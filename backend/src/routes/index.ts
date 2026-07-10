import { Router } from "express";

import { adminRouter } from "./admin.routes";
import { authRouter } from "./auth.routes";
import { usersRouter } from "./users.routes";
import { vocabularyRouter } from "./vocabulary.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/vocabularies", vocabularyRouter);
