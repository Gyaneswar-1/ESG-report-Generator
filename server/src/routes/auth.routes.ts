import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as authController from '../controller/auth.controller.js';

export { issueToken } from '../controller/auth.controller.js';

const router = Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/me', requireAuth, authController.getMe);
router.patch('/profile', requireAuth, authController.updateProfile);
router.get('/pending-approvals', requireAuth, authController.getPendingApprovals);
router.patch('/approvals/:id', requireAuth, authController.decideApproval);
router.get('/public/sites', authController.getPublicSites);
router.get('/public/subsidiaries', authController.getPublicSubsidiaries);

export default router;
