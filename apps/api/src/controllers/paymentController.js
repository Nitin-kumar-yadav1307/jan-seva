import crypto from 'crypto';
import { store } from '../services/store.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { getDbStatus } from '../config/db.js';
import { PAYMENT_STATUS, BOOKING_STATUS } from '@coopseva/shared';

export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, amount, provider = 'COOP_SANDBOX' } = req.body;
    if (!bookingId || amount === undefined) return res.status(400).json({ error: 'Booking ID and amount are required' });
    const { isConnected } = getDbStatus();
    const booking = isConnected
      ? await Booking.findById(bookingId)
      : store.bookings.find(item => item._id === bookingId || item.bookingReference === bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.customerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You do not have access to this booking payment' });
    }
    const customerId = req.user._id;

    // Fair Cooperative Fee Breakdown
    const base = Number(amount);
    if (!Number.isFinite(base) || base <= 0) return res.status(400).json({ error: 'Payment amount must be positive' });
    const expectedAmount = Number(booking.finalPrice || booking.estimatedPrice);
    if (Number.isFinite(expectedAmount) && Math.round(base) !== Math.round(expectedAmount)) {
      return res.status(400).json({ error: `Payment amount must equal the booking amount of ${expectedAmount}` });
    }
    const workerShare = Math.round(base * 0.85); // 85% to worker
    const welfareFund = Math.round(base * 0.10); // 10% to cooperative welfare fund
    const platformFee = Math.round(base * 0.05); // 5% platform maintenance

    let orderId = `order_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let razorpayLive = false;

    // Create a REAL Razorpay order when the provider is Razorpay and API keys are configured
    if (provider === 'RAZORPAY' && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
        body: JSON.stringify({
          amount: Math.round(base * 100), // Razorpay expects paise
          currency: 'INR',
          receipt: booking.bookingReference || bookingId,
          notes: { bookingId, customerId: String(customerId) }
        })
      });
      if (!rzpRes.ok) {
        const rzpErr = await rzpRes.json().catch(() => ({}));
        return res.status(502).json({ error: `Razorpay order creation failed: ${rzpErr.error?.description || rzpRes.status}` });
      }
      const rzpOrder = await rzpRes.json();
      orderId = rzpOrder.id;
      razorpayLive = true;
    }

    const paymentData = {
      bookingId,
      customerId,
      provider,
      providerOrderId: orderId,
      amount: base,
      breakdown: {
        baseAmount: base,
        workerDirectPayout: workerShare,
        cooperativeWelfareFund: welfareFund,
        platformFee,
        tax: 0
      },
      status: PAYMENT_STATUS.PENDING,
      createdAt: new Date()
    };

    let paymentRecord;
    if (isConnected) {
      const existing = await Payment.findOne({ bookingId, status: PAYMENT_STATUS.PENDING, provider });
      paymentRecord = existing || await Payment.create(paymentData);
    } else {
      paymentRecord = store.payments?.find(payment => payment.bookingId === bookingId && payment.provider === provider && payment.status === PAYMENT_STATUS.PENDING);
      if (!paymentRecord) {
        paymentRecord = { _id: `pay_${Date.now()}`, ...paymentData };
        store.payments = store.payments || [];
        store.payments.push(paymentRecord);
      } else {
        paymentRecord.providerOrderId = orderId;
        paymentRecord.amount = base;
      }
    }

    return res.status(200).json({
      orderId: paymentRecord.providerOrderId,
      amount: base,
      amountPaise: Math.round(base * 100),
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId12345',
      razorpayLive,
      provider,
      breakdown: paymentRecord.breakdown,
      paymentRecord,
      message: razorpayLive
        ? 'Live Razorpay order created. Open Razorpay Checkout.'
        : 'Payment order created. Ready for sandbox or live checkout.'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, orderId, paymentId = `pay_mock_${Date.now()}` } = req.body;
    const { isConnected } = getDbStatus();

    if (!bookingId || !orderId) return res.status(400).json({ error: 'Booking ID and order ID are required' });
    const booking = isConnected
      ? await Booking.findById(bookingId)
      : store.bookings.find(item => item._id === bookingId || item.bookingReference === bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.customerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You do not have access to verify this payment' });
    }

    let payment;
    if (isConnected) {
      payment = await Payment.findOne({ providerOrderId: orderId, bookingId, customerId: req.user._id });
    } else {
      payment = store.payments?.find(item => item.providerOrderId === orderId && item.bookingId === bookingId && item.customerId === req.user._id);
    }
    if (!payment) return res.status(404).json({ error: 'Payment order not found' });
    if (payment.status === PAYMENT_STATUS.COMPLETED) {
      return res.status(200).json({ success: true, bookingId, paymentId: payment.providerPaymentId, orderId, status: payment.status, invoiceUrl: payment.invoiceUrl });
    }
    if (payment.amount !== Number(booking.finalPrice || booking.estimatedPrice)) {
      return res.status(400).json({ error: 'Payment amount does not match the booking' });
    }
    if (payment.provider === 'RAZORPAY') {
      const signature = req.body.signature;
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const expectedSignature = secret && crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
      if (!signature || !expectedSignature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    }

    const invoiceUrl = `/api/payments/invoice/${bookingId}`;
    if (isConnected) {
      payment.providerPaymentId = paymentId;
      payment.status = PAYMENT_STATUS.COMPLETED;
      payment.invoiceUrl = invoiceUrl;
      await payment.save();
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: PAYMENT_STATUS.COMPLETED });
    } else {
      payment.providerPaymentId = paymentId;
      payment.status = PAYMENT_STATUS.COMPLETED;
      payment.invoiceUrl = invoiceUrl;
      const bIdx = store.bookings.findIndex(b => b._id === bookingId || b.bookingReference === bookingId);
      if (bIdx !== -1) store.bookings[bIdx].paymentStatus = PAYMENT_STATUS.COMPLETED;
    }

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

export const getInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { isConnected } = getDbStatus();
    const booking = isConnected
      ? await Booking.findById(bookingId).populate('serviceId', 'name category').populate('workerId', 'userId')
      : store.bookings.find(item => item._id === bookingId || item.bookingReference === bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'FEDERATION_ADMIN';
    if (!isAdmin && booking.customerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You do not have access to this invoice' });
    }
    const payment = isConnected
      ? await Payment.findOne({ bookingId, status: PAYMENT_STATUS.COMPLETED })
      : store.payments?.find(item => item.bookingId === bookingId && item.status === PAYMENT_STATUS.COMPLETED);
    if (!payment) return res.status(404).json({ error: 'Completed payment not found' });
    return res.status(200).json({
      invoice: {
        invoiceNumber: `INV-${booking.bookingReference || bookingId}`,
        bookingId,
        bookingReference: booking.bookingReference,
        amount: payment.amount,
        breakdown: payment.breakdown,
        paymentId: payment.providerPaymentId,
        paidAt: payment.updatedAt || payment.createdAt,
        service: booking.serviceId
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
