import { Router } from "express";

import { usersController } from "../controllers/users.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export const usersRouter = Router();

usersRouter.post("/register", asyncHandler(usersController.register));
usersRouter.post("/login", asyncHandler(usersController.login));
usersRouter.post(
  "/forgot-password",
  asyncHandler(usersController.forgotPassword),
);
usersRouter.post(
  "/reset-password",
  asyncHandler(usersController.resetPassword),
);
