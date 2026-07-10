import { createHash, randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { sql } from "kysely";

import { env } from "../config/env";
import { db } from "../database/db";
import { ApiError } from "../utils/api-error";

const PASSWORD_RESET_TOKEN_TYPE = "password_reset";
const DEFAULT_USER_ROLE_NAME = "user";
const GENERIC_PASSWORD_RESET_MESSAGE =
  "If an account exists for this email, password reset instructions have been created.";

interface LoginInput {
  identifier: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}

interface RegisterInput {
  email: string;
  userName: string;
  password: string;
  pin: string;
}

interface ForgotPasswordInput {
  email: string;
  ipAddress: string;
  userAgent: string;
}

interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  userName: string;
}

interface PasswordResetDevelopmentData {
  resetToken: string;
  resetUrl: string;
  expiresAt: string;
}

interface ForgotPasswordResult {
  message: string;
  development?: PasswordResetDevelopmentData;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeUserName(userName: string): string {
  return userName.trim().toLowerCase();
}

function validateEmail(email: string): void {
  if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw ApiError.badRequest("email must be a valid email address");
  }
}

function validateUserName(userName: string): void {
  if (
    userName.length < 3 ||
    userName.length > 50 ||
    !/^[a-z0-9._]+$/.test(userName)
  ) {
    throw ApiError.badRequest(
      "userName must be 3-50 characters and contain only lowercase letters, numbers, dots, or underscores",
    );
  }
}

function validatePassword(password: string, fieldName = "password"): void {
  if (password.length < 8 || password.length > 72) {
    throw ApiError.badRequest(
      `${fieldName} must contain between 8 and 72 characters`,
    );
  }

  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    throw ApiError.badRequest(
      `${fieldName} must contain at least one lowercase letter, one uppercase letter, and one number`,
    );
  }
}

function validatePin(pin: string): void {
  if (!/^\d{4,12}$/.test(pin)) {
    throw ApiError.badRequest("pin must contain between 4 and 12 digits");
  }
}

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function buildResetUrl(token: string): string {
  const resetUrl = new URL(env.PASSWORD_RESET_URL);
  resetUrl.searchParams.set("token", token);
  return resetUrl.toString();
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: AuthenticatedUser }> {
    const email = normalizeEmail(input.email);
    const userName = normalizeUserName(input.userName);

    validateEmail(email);
    validateUserName(userName);
    validatePassword(input.password);
    validatePin(input.pin);

    const existingUser = await db
      .selectFrom("users")
      .select(["id", "email", "user_name"])
      .where((expressionBuilder) =>
        expressionBuilder.or([
          sql<boolean>`lower(email) = ${email}`,
          sql<boolean>`lower(user_name) = ${userName}`,
        ]),
      )
      .executeTakeFirst();

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email) {
        throw ApiError.conflict("Email is already registered");
      }

      throw ApiError.conflict("Username is already in use");
    }

    const [passwordHash, pinHash] = await Promise.all([
      bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS),
      bcrypt.hash(input.pin, env.BCRYPT_SALT_ROUNDS),
    ]);

    const user = await db.transaction().execute(async (transaction) => {
      const createdUser = await transaction
        .insertInto("users")
        .values({
          email,
          user_name: userName,
          password: passwordHash,
          pin: pinHash,
        })
        .returning(["id", "email", "user_name"])
        .executeTakeFirstOrThrow();

      const defaultRole = await transaction
        .insertInto("roles")
        .values({
          name: DEFAULT_USER_ROLE_NAME,
          description: "Default role assigned to registered users",
        })
        .onConflict((conflict) =>
          conflict.column("name").doUpdateSet({
            description: "Default role assigned to registered users",
          }),
        )
        .returning("id")
        .executeTakeFirstOrThrow();

      await transaction
        .insertInto("user_roles")
        .values({
          user_id: createdUser.id,
          role_id: defaultRole.id,
        })
        .onConflict((conflict) =>
          conflict.columns(["user_id", "role_id"]).doNothing(),
        )
        .execute();

      return createdUser;
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        userName: user.user_name,
      },
    };
  }

  async login(input: LoginInput): Promise<{
    accessToken: string;
    expiresAt: string;
    user: AuthenticatedUser;
  }> {
    const identifier = input.identifier.trim().toLowerCase();

    const user = await db
      .selectFrom("users")
      .select(["id", "email", "user_name", "password", "locked_until"])
      .where((expressionBuilder) =>
        expressionBuilder.or([
          sql<boolean>`lower(email) = ${identifier}`,
          sql<boolean>`lower(user_name) = ${identifier}`,
        ]),
      )
      .executeTakeFirst();

    if (!user) {
      throw ApiError.unauthorized("Invalid email, username, or password");
    }

    if (user.locked_until && user.locked_until.getTime() > Date.now()) {
      throw new ApiError(423, "This account is temporarily locked");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);

    if (!passwordMatches) {
      throw ApiError.unauthorized("Invalid email, username, or password");
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      userName: user.user_name,
    };

    const accessToken = jwt.sign(
      {
        email: authenticatedUser.email,
        userName: authenticatedUser.userName,
      },
      env.JWT_SECRET,
      {
        subject: authenticatedUser.id,
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
        expiresIn: env.JWT_EXPIRES_IN_SECONDS,
      },
    );

    const expiresAt = new Date(Date.now() + env.JWT_EXPIRES_IN_SECONDS * 1_000);

    await db.transaction().execute(async (transaction) => {
      await transaction
        .insertInto("tokens")
        .values({
          user_id: authenticatedUser.id,
          token: accessToken,
          token_type: "access",
          ip_address: input.ipAddress,
          user_agent: input.userAgent,
          expires_at: expiresAt,
        })
        .execute();

      await transaction
        .updateTable("users")
        .set({ last_login_at: new Date() })
        .where("id", "=", authenticatedUser.id)
        .execute();
    });

    return {
      accessToken,
      expiresAt: expiresAt.toISOString(),
      user: authenticatedUser,
    };
  }

  async forgotPassword(
    input: ForgotPasswordInput,
  ): Promise<ForgotPasswordResult> {
    const email = normalizeEmail(input.email);
    validateEmail(email);

    const user = await db
      .selectFrom("users")
      .select(["id", "email"])
      .where(sql<boolean>`lower(email) = ${email}`)
      .executeTakeFirst();

    if (!user) {
      return { message: GENERIC_PASSWORD_RESET_MESSAGE };
    }

    const resetToken = randomBytes(32).toString("hex");
    const storedTokenHash = hashResetToken(resetToken);
    const expiresAt = new Date(
      Date.now() + env.PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES * 60_000,
    );

    await db.transaction().execute(async (transaction) => {
      await transaction
        .deleteFrom("tokens")
        .where("user_id", "=", user.id)
        .where("token_type", "=", PASSWORD_RESET_TOKEN_TYPE)
        .execute();

      await transaction
        .insertInto("tokens")
        .values({
          user_id: user.id,
          token: storedTokenHash,
          token_type: PASSWORD_RESET_TOKEN_TYPE,
          ip_address: input.ipAddress,
          user_agent: input.userAgent,
          expires_at: expiresAt,
        })
        .execute();
    });

    const result: ForgotPasswordResult = {
      message: GENERIC_PASSWORD_RESET_MESSAGE,
    };

    if (env.RETURN_PASSWORD_RESET_TOKEN) {
      result.development = {
        resetToken,
        resetUrl: buildResetUrl(resetToken),
        expiresAt: expiresAt.toISOString(),
      };
    }

    return result;
  }

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const resetToken = input.token.trim();

    if (!/^[a-f0-9]{64}$/i.test(resetToken)) {
      throw ApiError.badRequest("Reset token is invalid or expired");
    }

    validatePassword(input.newPassword, "newPassword");

    const storedTokenHash = hashResetToken(resetToken);

    const existingToken = await db
      .selectFrom("tokens")
      .select("id")
      .where("token", "=", storedTokenHash)
      .where("token_type", "=", PASSWORD_RESET_TOKEN_TYPE)
      .where("expires_at", ">", new Date())
      .executeTakeFirst();

    if (!existingToken) {
      throw ApiError.badRequest("Reset token is invalid or expired");
    }

    const passwordHash = await bcrypt.hash(
      input.newPassword,
      env.BCRYPT_SALT_ROUNDS,
    );

    await db.transaction().execute(async (transaction) => {
      const tokenRecord = await transaction
        .selectFrom("tokens")
        .select(["id", "user_id"])
        .where("token", "=", storedTokenHash)
        .where("token_type", "=", PASSWORD_RESET_TOKEN_TYPE)
        .where("expires_at", ">", new Date())
        .forUpdate()
        .executeTakeFirst();

      if (!tokenRecord) {
        throw ApiError.badRequest("Reset token is invalid or expired");
      }

      await transaction
        .updateTable("users")
        .set({
          password: passwordHash,
          pin_wrong: 0,
          locked_until: null,
        })
        .where("id", "=", tokenRecord.user_id)
        .execute();

      await transaction
        .deleteFrom("tokens")
        .where("user_id", "=", tokenRecord.user_id)
        .execute();
    });

    return {
      message:
        "Password has been reset successfully. Please sign in with the new password.",
    };
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    let payload: JwtPayload;

    try {
      const decodedToken = jwt.verify(token, env.JWT_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      });

      if (typeof decodedToken === "string") {
        throw new Error("Unexpected JWT payload");
      }

      payload = decodedToken;
    } catch {
      throw ApiError.unauthorized("Access token is invalid or expired");
    }

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.userName !== "string"
    ) {
      throw ApiError.unauthorized("Access token payload is invalid");
    }

    const activeToken = await db
      .selectFrom("tokens")
      .innerJoin("users", "users.id", "tokens.user_id")
      .select([
        "users.id",
        "users.email",
        "users.user_name",
        "users.locked_until",
      ])
      .where("tokens.token", "=", token)
      .where("tokens.token_type", "=", "access")
      .where("tokens.expires_at", ">", new Date())
      .where("users.id", "=", payload.sub)
      .executeTakeFirst();

    if (!activeToken) {
      throw ApiError.unauthorized("Access token has been revoked or expired");
    }

    if (
      activeToken.locked_until &&
      activeToken.locked_until.getTime() > Date.now()
    ) {
      throw new ApiError(423, "This account is temporarily locked");
    }

    return {
      id: activeToken.id,
      email: activeToken.email,
      userName: activeToken.user_name,
    };
  }
}

export const authService = new AuthService();
