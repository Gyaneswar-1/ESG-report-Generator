import express, { type Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { morganMiddleware } from './middleware/morgan.js';
import { errorHandler } from './middleware/errorHandler.js';
import health from './routes/health.routes.js';

export const app: Application = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(cookieParser());
app.use(morganMiddleware);

app.use('/api/v1', health);

app.use(errorHandler);

export default app;
