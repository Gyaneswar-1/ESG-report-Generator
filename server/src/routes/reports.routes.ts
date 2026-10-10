import { Router } from 'express';
import { requireAuth, requireApproved, allowRoles } from '../middleware/auth.js';
import * as reportsController from '../controller/reports.controller.js';

const router: Router = Router();

router.get('/brsr/data', requireAuth, requireApproved, reportsController.getBrsrReportData);
router.post('/brsr/assurance', requireAuth, requireApproved, allowRoles('auditor', 'executive'), reportsController.submitAuditorAssurance);

export default router;
