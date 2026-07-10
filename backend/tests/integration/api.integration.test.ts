import { createHash } from "node:crypto";

import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app";
import { SYSTEM_PERMISSION_NAMES } from "../../src/config/rbac";
import { closeDatabaseConnection, db } from "../../src/database/db";
import { grantRoleToUser, resetTestData } from "../helpers/database";
import { DEFAULT_TEST_USER, loginUser, registerUser } from "../helpers/users";

beforeEach(async () => {
  await resetTestData();
});

afterAll(async () => {
  await closeDatabaseConnection();
});

describe("health API", () => {
  it("reports that PostgreSQL is connected", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: "OK", database: "connected" },
    });
  });
});

describe("users authentication API", () => {
  it("registers a user, hashes secrets, and assigns the default role", async () => {
    const response = await registerUser();

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        user: {
          email: DEFAULT_TEST_USER.email,
          userName: DEFAULT_TEST_USER.userName,
        },
      },
    });
    expect(response.body.data.user).not.toHaveProperty("password");
    expect(response.body.data.user).not.toHaveProperty("pin");

    const storedUser = await db
      .selectFrom("users")
      .select(["id", "password", "pin"])
      .where("email", "=", DEFAULT_TEST_USER.email)
      .executeTakeFirstOrThrow();

    expect(storedUser.password).not.toBe(DEFAULT_TEST_USER.password);
    expect(storedUser.pin).not.toBe(DEFAULT_TEST_USER.pin);
    await expect(
      bcrypt.compare(DEFAULT_TEST_USER.password, storedUser.password),
    ).resolves.toBe(true);
    await expect(
      bcrypt.compare(DEFAULT_TEST_USER.pin ?? "1234", storedUser.pin),
    ).resolves.toBe(true);

    const assignedRole = await db
      .selectFrom("user_roles as userRole")
      .innerJoin("roles as role", "role.id", "userRole.role_id")
      .select("role.name")
      .where("userRole.user_id", "=", storedUser.id)
      .executeTakeFirstOrThrow();

    expect(assignedRole.name).toBe("user");
  });

  it("rejects duplicate email addresses without case sensitivity", async () => {
    await registerUser();

    const duplicateResponse = await registerUser({
      ...DEFAULT_TEST_USER,
      email: "LEARNER@EXAMPLE.COM",
      userName: "another_user",
    });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.success).toBe(false);
  });

  it("rejects invalid registration data", async () => {
    const response = await request(app).post("/api/users/register").send({
      email: "not-an-email",
      userName: "A",
      password: "weak",
      pin: "1",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("logs in by email and persists the access token", async () => {
    await registerUser();

    const response = await request(app).post("/api/users/login").send({
      identifier: DEFAULT_TEST_USER.email,
      password: DEFAULT_TEST_USER.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toEqual(expect.any(String));

    const tokenRecord = await db
      .selectFrom("tokens")
      .select(["token", "token_type"])
      .where("token", "=", response.body.data.accessToken)
      .executeTakeFirstOrThrow();

    expect(tokenRecord.token_type).toBe("access");
  });

  it("rejects an incorrect password", async () => {
    await registerUser();

    const response = await request(app).post("/api/users/login").send({
      identifier: DEFAULT_TEST_USER.userName,
      password: "WrongPass123",
    });

    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty("accessToken");
  });

  it("does not reveal whether a forgotten-password email exists", async () => {
    const response = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "missing@example.com" });

    expect(response.status).toBe(200);
    expect(response.body.data.message).toMatch(/If an account exists/i);
    expect(response.body.data).not.toHaveProperty("development");
  });

  it("resets the password once, stores only the token hash, and revokes old sessions", async () => {
    const registerResponse = await registerUser();
    const userId = registerResponse.body.data.user.id as string;
    const oldAccessToken = await loginUser(
      DEFAULT_TEST_USER.email,
      DEFAULT_TEST_USER.password,
    );

    const forgotResponse = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: DEFAULT_TEST_USER.email });

    expect(forgotResponse.status).toBe(200);
    const rawResetToken = forgotResponse.body.data.development
      .resetToken as string;

    const storedResetToken = await db
      .selectFrom("tokens")
      .select("token")
      .where("user_id", "=", userId)
      .where("token_type", "=", "password_reset")
      .executeTakeFirstOrThrow();

    expect(storedResetToken.token).not.toBe(rawResetToken);
    expect(storedResetToken.token).toBe(
      createHash("sha256").update(rawResetToken).digest("hex"),
    );

    const resetResponse = await request(app)
      .post("/api/users/reset-password")
      .send({ token: rawResetToken, newPassword: "NewStrongPass456" });

    expect(resetResponse.status).toBe(200);

    const oldSessionResponse = await request(app)
      .get("/api/vocabularies")
      .set("Authorization", `Bearer ${oldAccessToken}`);
    expect(oldSessionResponse.status).toBe(401);

    const oldPasswordResponse = await request(app)
      .post("/api/users/login")
      .send({
        identifier: DEFAULT_TEST_USER.email,
        password: DEFAULT_TEST_USER.password,
      });
    expect(oldPasswordResponse.status).toBe(401);

    const newPasswordResponse = await request(app)
      .post("/api/users/login")
      .send({
        identifier: DEFAULT_TEST_USER.email,
        password: "NewStrongPass456",
      });
    expect(newPasswordResponse.status).toBe(200);

    const reuseResponse = await request(app)
      .post("/api/users/reset-password")
      .send({ token: rawResetToken, newPassword: "AnotherPass789" });
    expect(reuseResponse.status).toBe(400);
  });
});

describe("admin RBAC API", () => {
  it("requires authentication", async () => {
    const response = await request(app).get("/api/admin/roles");

    expect(response.status).toBe(401);
  });

  it("forbids a normal user without roles.read", async () => {
    await registerUser();
    const token = await loginUser(
      DEFAULT_TEST_USER.email,
      DEFAULT_TEST_USER.password,
    );

    const response = await request(app)
      .get("/api/admin/roles")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("allows a super admin to manage roles and permissions", async () => {
    const admin = {
      email: "admin@example.com",
      userName: "admin_user",
      password: "AdminPass123",
      pin: "4321",
    };

    const registerResponse = await registerUser(admin);
    const adminUserId = registerResponse.body.data.user.id as string;
    await grantRoleToUser(adminUserId, "super_admin");
    const token = await loginUser(admin.email, admin.password);

    const permissionsResponse = await request(app)
      .get("/api/admin/permissions")
      .set("Authorization", `Bearer ${token}`);

    expect(permissionsResponse.status).toBe(200);
    expect(permissionsResponse.body.data).toHaveLength(
      SYSTEM_PERMISSION_NAMES.length,
    );

    const superAdminRole = await db
      .selectFrom("roles")
      .select("id")
      .where("name", "=", "super_admin")
      .executeTakeFirstOrThrow();

    const protectedDeleteResponse = await request(app)
      .delete(`/api/admin/roles/${superAdminRole.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(protectedDeleteResponse.status).toBe(400);

    const createResponse = await request(app)
      .post("/api/admin/roles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "vocabulary_manager",
        description: "Manages vocabulary records",
        permissionNames: ["english_words.read", "english_words.update"],
      });

    expect(createResponse.status).toBe(201);
    const roleId = createResponse.body.data.id as string;
    expect(createResponse.body.data.permissions).toHaveLength(2);

    const updateResponse = await request(app)
      .patch(`/api/admin/roles/${roleId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Updated description" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.description).toBe("Updated description");

    const replaceResponse = await request(app)
      .put(`/api/admin/roles/${roleId}/permissions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ permissionNames: ["english_words.read"] });
    expect(replaceResponse.status).toBe(200);
    expect(replaceResponse.body.data.permissions).toHaveLength(1);

    const deleteResponse = await request(app)
      .delete(`/api/admin/roles/${roleId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteResponse.status).toBe(204);

    const getDeletedResponse = await request(app)
      .get(`/api/admin/roles/${roleId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(getDeletedResponse.status).toBe(404);
  });

  it("rolls back role creation when a permission name is invalid", async () => {
    const admin = {
      email: "admin@example.com",
      userName: "admin_user",
      password: "AdminPass123",
      pin: "4321",
    };

    const registerResponse = await registerUser(admin);
    await grantRoleToUser(registerResponse.body.data.user.id, "super_admin");
    const token = await loginUser(admin.email, admin.password);

    const response = await request(app)
      .post("/api/admin/roles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "broken_role",
        permissionNames: ["not_a_table.read"],
      });

    expect(response.status).toBe(400);

    const storedRole = await db
      .selectFrom("roles")
      .select("id")
      .where("name", "=", "broken_role")
      .executeTakeFirst();
    expect(storedRole).toBeUndefined();
  });
});
