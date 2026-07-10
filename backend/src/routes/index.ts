import { Router } from "express";

import { adminRouter } from "./admin.routes";
import { authRouter } from "./auth.routes";
import { vocabularyRouter } from "./vocabulary.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/vocabularies", vocabularyRouter);
