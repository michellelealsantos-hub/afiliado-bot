import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as whatsappController from '../controllers/whatsappController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/qr', whatsappController.getQrCode);
router.get('/status', whatsappController.getWhatsAppStatus);
router.post('/disconnect', whatsappController.disconnectWhatsApp);
router.get('/groups', whatsappController.getWhatsAppGroups);

export default router;
