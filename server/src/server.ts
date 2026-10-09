import express, { type Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { morganMiddleware } from './middleware/morgan.js';
import { errorHandler } from './middleware/errorHandler.js';
import health from './routes/health.routes.js';
import records from './routes/records.routes.js';
import auth from './routes/auth.routes.js';
import forms from './routes/forms.routes.js';
import reports from './routes/reports.routes.js';

export const app: Application = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(cookieParser());
app.use(morganMiddleware);

app.use('/api/v1', health);
app.use('/api/v1/auth', auth);
app.use('/api/v1/forms', forms);
app.use('/api/v1/reports', reports);
app.use('/api/v1', records);

app.use(errorHandler);

export default app;
