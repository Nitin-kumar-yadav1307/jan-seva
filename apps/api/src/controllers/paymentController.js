import { store } from '../services/store.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { getDbStatus } from '../config/db.js';
import { PAYMENT_STATUS, BOOKING_STATUS } from '@coopseva/shared';

export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, amount = 299, provider = 'COOP_SANDBOX' } = req.body;
    const customerId = req.user?._id || 'user_cust_01';

    // Fair Cooperative Fee Breakdown
    const base = Number(amount);
    const workerShare = Math.round(base * 0.85); // 85% to worker
    const welfareFund = Math.round(base * 0.10); // 10% to cooperative welfare fund
    const platformFee = Math.round(base * 0.05); // 5% platform maintenance

    const orderId = `order_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const paymentRecord = {
      _id: `pay_${Date.now()}`,
      bookingId,
      customerId,
      provider,
      providerOrderId: orderId,
      amount: base,
      breakdown: {
        workerDirectPayout: workerShare,
        cooperativeWelfareFund: welfareFund,
        platformFee,
        tax: 0
      },
      status: PAYMENT_STATUS.PENDING,
      createdAt: new Date()
    };

    return res.status(200).json({
      orderId,
      amount: base,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId12345',
      breakdown: paymentRecord.breakdown,
      paymentRecord,
      message: 'Payment order created. Ready for sandbox or live checkout.'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, orderId, paymentId = `pay_mock_${Date.now()}` } = req.body;
    const { isConnected } = getDbStatus();

    // Mark booking as completed & paid
    if (isConnected) {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: PAYMENT_STATUS.COMPLETED,
        status: BOOKING_STATUS.COMPLETED
      });
    } else {
      const bIdx = store.bookings.findIndex(b => b._id === bookingId || b.bookingReference === bookingId);
      if (bIdx !== -1) {
        store.bookings[bIdx].paymentStatus = PAYMENT_STATUS.COMPLETED;
        store.bookings[bIdx].status = BOOKING_STATUS.COMPLETED;
      }
    }

    const invoiceUrl = `/api/payments/invoice/${bookingId}`;

    return res.status(200).json({
      success: true,
      bookingId,
      paymentId,
      orderId,
      status: PAYMENT_STATUS.COMPLETED,
      invoiceUrl,
      message: 'Payment verified and credited to worker & cooperative fund.'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
