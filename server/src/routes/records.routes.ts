import { Router } from 'express';
import { allowRoles, requireApproved, requireAuth } from '../middleware/auth.js';
import * as recordsController from '../controller/records.controller.js';

const router = Router();

router.use(requireAuth);

// Sites
router.get('/sites', requireApproved, recordsController.getSites);
router.post('/sites', allowRoles('executive'), requireApproved, recordsController.createSite);

// Records
router.get('/records', requireApproved, recordsController.getRecords);
router.post('/records', allowRoles('engineer'), requireApproved, recordsController.uploadEvidence, recordsController.createRecord);
router.patch('/records/:id/review', allowRoles('subsidiary_head', 'executive'), requireApproved, recordsController.reviewRecord);
router.get('/records/:id/audit', requireApproved, recordsController.getRecordAudit);

// Metrics
router.get('/metrics', allowRoles('executive'), requireApproved, recordsController.getMetrics);

// Evidence Vault
router.get('/evidence/:id', requireApproved, recordsController.getEvidence);

export default router;
