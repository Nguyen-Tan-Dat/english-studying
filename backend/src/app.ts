import compression from 'compression';
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';

import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { healthRouter } from './routes/health.routes';
import { apiRouter } from './routes';

const app: Application = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(healthRouter);
app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
