import { Router } from 'express';
import { requireAuth, requireApproved } from '../middleware/auth.js';
import * as reportsController from '../controller/reports.controller.js';

const router: Router = Router();

router.get('/brsr/data', requireAuth, requireApproved, reportsController.getBrsrReportData);

export default router;
