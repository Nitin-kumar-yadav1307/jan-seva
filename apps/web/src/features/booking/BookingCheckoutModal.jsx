import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../context/GeolocationContext';
import api from '../../lib/api';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  CreditCard, 
  HeartHandshake, 
  Lock, 
  CheckCircle2,
  Zap
} from 'lucide-react';

export const BookingCheckoutModal = ({ isOpen, onClose, bookingConfig }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location: geoLocation } = useGeolocation();
  const customerCoords = geoLocation?.coords || [72.8777, 19.0760];
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState('COOP_SANDBOX');

  // Derive booking details with safe defaults so hooks below always run
  // (a conditional early-return before hooks crashes React when the modal opens).
  const { worker, service, serviceId, isEmergency = false, serviceName } = bookingConfig || {};
  const selectedServiceId = serviceId || service?._id;
  const selectedServiceName = serviceName || service?.name || (worker ? `${worker.skills?.[0]?.category || 'Specialist'} Service` : 'Service');
  // Price: service price when booked via a service, otherwise the worker's hourly rate (1-hour visit)
  const workerRate = Number(worker?.skills?.[0]?.hourlyRate ?? worker?.hourlyRate);
  const basePrice = isEmergency && service?.emergencyPrice != null
    ? service.emergencyPrice
    : (service?.basePrice ?? (Number.isFinite(workerRate) && workerRate > 0 ? workerRate : undefined));
  const workerWage = Number.isFinite(basePrice) ? Math.round(basePrice * 0.85) : 0;
  const welfareFund = Number.isFinite(basePrice) ? Math.round(basePrice * 0.10) : 0;
  const platformFee = Number.isFinite(basePrice) ? Math.round(basePrice * 0.05) : 0;

  useEffect(() => {
    if (!address) setAddress(user?.location?.address || '');
  }, [address, user?.location?.address]);

  if (!isOpen || !bookingConfig) return null;

  const handleConfirmAndPay = async () => {
    if (!Number.isFinite(basePrice) || !address.trim()) {
      alert('Please enter a service address to complete the booking.');
      return;
    }
    setLoading(true);
    try {
      // 1. Create booking in backend
      const bookingRes = await api.post('/bookings', {
        serviceId: selectedServiceId || undefined,
        workerId: worker?._id,
        location: {
          type: 'Point',
          coordinates: customerCoords,
          address,
          city: geoLocation?.city || 'Mumbai'
        },
        scheduledAt: new Date(),
        notes,
        isEmergency,
        matchingScores: bookingConfig.matchingScores
      });

      const newBooking = bookingRes.data.booking;

      // 2. Create payment order
      const orderRes = await api.post('/payments/order', {
        bookingId: newBooking._id,
        amount: basePrice,
        provider: paymentProvider
      });

      if (paymentProvider === 'RAZORPAY' && orderRes.data.razorpayLive) {
        // 3a. Real Razorpay Checkout — wait for the user to pay, then verify with signature
        await openRazorpayCheckout({
          keyId: orderRes.data.keyId,
          orderId: orderRes.data.orderId,
          amountPaise: orderRes.data.amountPaise,
          name: 'Co-opSeva',
          description: selectedServiceName,
          prefill: { name: user?.name || '', contact: user?.phone || '' },
          onSuccess: async (rzp) => {
            await api.post('/payments/verify', {
              bookingId: newBooking._id,
              orderId: rzp.razorpay_order_id,
              paymentId: rzp.razorpay_payment_id,
              signature: rzp.razorpay_signature
            });
          }
        });
      } else {
        // 3b. Sandbox test payment — auto-verify
        await api.post('/payments/verify', {
          bookingId: newBooking._id,
          orderId: orderRes.data.orderId,
          paymentId: `pay_mock_${Date.now()}`
        });
      }

      // 4. Close modal and navigate to Tracking
      onClose();
      const bookingId = newBooking?._id || newBooking?.bookingReference;
      navigate(bookingId ? `/customer/bookings/${bookingId}` : '/customer/bookings');
    } catch (err) {
      // User closed the Razorpay window — not an error
      if (err?.message === 'RAZORPAY_DISMISSED') return;
      console.error('Booking checkout error:', err);
      alert('Failed to complete booking: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const openRazorpayCheckout = ({ keyId, orderId, amountPaise, name, description, prefill, onSuccess }) =>
    new Promise((resolve, reject) => {
      const startCheckout = () => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount: amountPaise,
          currency: 'INR',
          name,
          description,
          order_id: orderId,
          prefill,
          theme: { color: '#2F80ED' },
          handler: (response) => {
            Promise.resolve(onSuccess(response)).then(resolve).catch(reject);
          },
          modal: {
            ondismiss: () => reject(new Error('RAZORPAY_DISMISSED'))
          }
        });
        rzp.on('payment.failed', (resp) => reject(new Error(resp?.error?.description || 'Payment failed')));
        rzp.open();
      };

      if (window.Razorpay) {
        startCheckout();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = startCheckout;
      script.onerror = () => reject(new Error('Could not load Razorpay Checkout. Check your internet connection.'));
      document.body.appendChild(script);
    });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-coop-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-300" />
            <h3 className="font-bold text-base">Co-op Direct Checkout</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Selected Worker & Service Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {worker?.avatar ? (
                <img src={worker.avatar} alt={worker.name} className="w-11 h-11 rounded-full object-cover border border-blue-200" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-coop-600 text-white flex items-center justify-center font-bold">
                  {worker?.name?.charAt(0) || 'W'}
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  {worker?.name || 'Assigned Cooperative Worker'}
                  {isEmergency && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Zap className="w-3 h-3 fill-rose-600" /> Rapid Dispatch
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500">{selectedServiceName || 'Selected service'}</p>
              </div>
            </div>
            <span className="text-base font-extrabold text-coop-900">₹{basePrice}</span>
          </div>

          {/* Service Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-coop-600" />
              Service Address in Mumbai
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-coop-500 focus:outline-none"
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Specific Job Details / Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. Main valve is on the balcony; please bring pipe sealant..."
              rows={2}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-coop-500 focus:outline-none"
            />
          </div>

          {/* Transparent Cooperative Fee Distribution */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200 pb-2">
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                Cooperative Dividend Transparency
              </span>
              <span>100% Ethical</span>
            </div>
            <div className="space-y-1 text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Worker Direct Labor Payout (85%):</span>
                <span className="font-semibold text-slate-900">₹{workerWage}</span>
              </div>
              <div className="flex justify-between">
                <span>Co-op Healthcare & Emergency Relief Fund (10%):</span>
                <span className="font-semibold text-blue-700">₹{welfareFund}</span>
              </div>
              <div className="flex justify-between">
                <span>Open Federation Operations & Server Fee (5%):</span>
                <span className="font-semibold text-slate-600">₹{platformFee}</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                <span>Total Amount Payable:</span>
                <span className="text-coop-600">₹{basePrice}</span>
              </div>
            </div>
          </div>

          {/* Payment Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Select Payment Mode</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentProvider('COOP_SANDBOX')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-all ${
                  paymentProvider === 'COOP_SANDBOX'
                    ? 'border-coop-600 bg-blue-50 text-coop-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-coop-600" />
                <span>Instant Test Sandbox</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentProvider('RAZORPAY')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-all ${
                  paymentProvider === 'RAZORPAY'
                    ? 'border-coop-600 bg-blue-50 text-coop-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span>Razorpay Test Mock</span>
              </button>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmAndPay}
            disabled={loading}
            className="w-full bg-coop-600 hover:bg-coop-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Confirming & Dispatching...' : `Confirm & Pay ₹${basePrice}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
