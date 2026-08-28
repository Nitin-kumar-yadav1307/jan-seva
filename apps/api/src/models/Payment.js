import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '@coopseva/shared';

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    enum: ['RAZORPAY', 'COOP_SANDBOX', 'UPI_DIRECT', 'CASH'],
    default: 'COOP_SANDBOX'
  },
  providerOrderId: {
    type: String
  },
  providerPaymentId: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  breakdown: {
    baseAmount: Number,
    workerDirectPayout: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    cooperativeWelfareFund: { type: Number, default: 0 },
    tax: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  invoiceUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
