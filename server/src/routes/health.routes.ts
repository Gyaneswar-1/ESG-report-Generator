import { Router } from 'express';
import { healthCheck } from '../controller/health.controller.js';

const health = Router();

health.get('/health-check', healthCheck);

export default health;
