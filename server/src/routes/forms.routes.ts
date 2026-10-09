import { Router } from 'express';
import { allowRoles, requireApproved, requireAuth } from '../middleware/auth.js';
import * as formsController from '../controller/forms.controller.js';

export { serializeFormDescription, parseFormDescription } from '../controller/forms.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireApproved, formsController.getForms);
router.post('/', allowRoles('subsidiary_head', 'executive'), requireApproved, formsController.publishForm);
router.patch('/:id/status', allowRoles('subsidiary_head', 'executive'), requireApproved, formsController.toggleFormStatus);

export default router;
