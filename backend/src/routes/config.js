import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as configController from '../controllers/configController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/affiliate', configController.saveAffiliateConfig);
router.get('/affiliate', configController.getAffiliateConfig);
router.get('/affiliate/:platform', configController.getPlatformConfig);
router.delete('/affiliate/:platform', configController.deleteAffiliateConfig);

export default router;
