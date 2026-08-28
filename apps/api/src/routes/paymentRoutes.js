import express from 'express';
import { createPaymentOrder, verifyPayment, getInvoice } from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { ROLES } from '@coopseva/shared';

const router = express.Router();

router.use(authenticateToken);
router.post('/order', requireRoles(ROLES.CUSTOMER), createPaymentOrder);
router.post('/verify', requireRoles(ROLES.CUSTOMER), verifyPayment);
router.get('/invoice/:bookingId', getInvoice);
router.post('/webhook', requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), (req, res) => res.status(200).json({ received: true }));

export default router;
