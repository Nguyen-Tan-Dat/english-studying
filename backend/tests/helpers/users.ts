import request from "supertest";

import app from "../../src/app";

export interface TestUserInput {
  email: string;
  userName: string;
  password: string;
  pin?: string;
}

export const DEFAULT_TEST_USER: TestUserInput = {
  email: "learner@example.com",
  userName: "learner",
  password: "StrongPass123",
  pin: "1234",
};

export async function registerUser(input: TestUserInput = DEFAULT_TEST_USER) {
  return request(app)
    .post("/api/users/register")
    .send({
      email: input.email,
      userName: input.userName,
      password: input.password,
      pin: input.pin ?? "1234",
    });
}

export async function loginUser(
  identifier: string,
  password: string,
): Promise<string> {
  const response = await request(app)
    .post("/api/users/login")
    .send({ identifier, password });

  if (
    response.status !== 200 ||
    typeof response.body?.data?.accessToken !== "string"
  ) {
    throw new Error(
      `Unable to log in test user. Status: ${response.status}; body: ${JSON.stringify(response.body)}`,
    );
  }

  return response.body.data.accessToken;
}
