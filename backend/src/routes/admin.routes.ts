import { Router } from "express";

import { adminRoleController } from "../controllers/admin-role.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermissions } from "../middlewares/permission.middleware";

export const adminRouter = Router();

adminRouter.use(asyncHandler(authenticate));

adminRouter.get(
  "/permissions",
  asyncHandler(requirePermissions("permissions.read")),
  asyncHandler(adminRoleController.listPermissions),
);

adminRouter.get(
  "/roles",
  asyncHandler(requirePermissions("roles.read")),
  asyncHandler(adminRoleController.list),
);
adminRouter.get(
  "/roles/:id",
  asyncHandler(requirePermissions("roles.read")),
  asyncHandler(adminRoleController.getById),
);
adminRouter.post(
  "/roles",
  asyncHandler(requirePermissions("roles.create")),
  asyncHandler(adminRoleController.create),
);
adminRouter.patch(
  "/roles/:id",
  asyncHandler(requirePermissions("roles.update")),
  asyncHandler(adminRoleController.update),
);
adminRouter.put(
  "/roles/:id/permissions",
  asyncHandler(requirePermissions("role_permissions.update")),
  asyncHandler(adminRoleController.replacePermissions),
);
adminRouter.delete(
  "/roles/:id",
  asyncHandler(requirePermissions("roles.delete")),
  asyncHandler(adminRoleController.delete),
);
