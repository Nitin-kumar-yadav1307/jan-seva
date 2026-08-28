import express from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/webhook', (req, res) => res.status(200).json({ received: true }));

export default router;
