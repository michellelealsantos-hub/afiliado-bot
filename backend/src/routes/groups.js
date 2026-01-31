import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as groupsController from '../controllers/groupsController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/monitor', groupsController.updateMonitoredGroups);
router.post('/post-target', groupsController.updatePostTargetGroups);
router.get('/', groupsController.getMonitoredGroups);
router.get('/list', groupsController.getGroupsForSelection);

export default router;
