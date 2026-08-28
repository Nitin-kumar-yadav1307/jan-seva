import { store } from '../services/store.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { getDbStatus } from '../config/db.js';
import { BOOKING_STATUS, PAYMENT_STATUS, ROLES } from '@coopseva/shared';
import { createBookingSchema } from '@coopseva/validation';

export const createBooking = async (req, res) => {
  try {
    const validatedData = createBookingSchema.parse(req.body);
    const customerId = req.user?._id || req.body.customerId || 'user_cust_01';
    const { isConnected } = getDbStatus();

    // Find service to get price
    let service = store.services.find(s => s._id === validatedData.serviceId);
    if (!service && isConnected) {
      service = await Service.findById(validatedData.serviceId);
    }
    const basePrice = service ? (validatedData.isEmergency ? service.emergencyPrice : service.basePrice) : 349;

    let workerId = validatedData.workerId;
    let cooperativeId = 'coop_delhi_central_01';

    if (workerId) {
      const wrk = store.workers.find(w => w._id === workerId || w.userId === workerId);
      if (wrk && wrk.cooperativeId) {
        cooperativeId = typeof wrk.cooperativeId === 'object' ? wrk.cooperativeId._id : wrk.cooperativeId;
      }
    }

    const bookingData = {
      bookingReference: `CS-${Math.floor(100000 + Math.random() * 900000)}`,
      customerId,
      workerId,
      cooperativeId,
      serviceId: validatedData.serviceId,
      location: validatedData.location,
      scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : new Date(),
      status: workerId ? BOOKING_STATUS.ASSIGNED : BOOKING_STATUS.REQUESTED,
      isEmergency: !!validatedData.isEmergency,
      notes: validatedData.notes || '',
      estimatedPrice: basePrice,
      paymentStatus: PAYMENT_STATUS.PENDING,
      matchingScores: req.body.matchingScores || {
        overallScore: 92,
        skillScore: 95,
        proximityScore: 90,
        workloadScore: 92,
        welfareFactor: 90,
        reasoning: 'Directly assigned to recommended cooperative worker.'
      },
      createdAt: new Date()
    };

    let newBooking = null;
    if (isConnected) {
      const doc = new Booking(bookingData);
      await doc.save();
      newBooking = doc.toObject();
    } else {
      newBooking = { _id: `book_${Date.now()}`, ...bookingData };
      store.bookings.unshift(newBooking);
    }

    return res.status(201).json({
      booking: newBooking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { status, role, customerId, workerId } = req.query;
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const { isConnected } = getDbStatus();

    let bookings = [];
    if (isConnected) {
      const query = {};
      if (status) query.status = status;
      if (userRole === ROLES.CUSTOMER || customerId) query.customerId = customerId || userId;
      if (userRole === ROLES.WORKER || workerId) query.workerId = workerId || userId;

      bookings = await Booking.find(query)
        .populate('customerId', 'name email phone')
        .populate('workerId')
        .populate('serviceId')
        .populate('cooperativeId')
        .sort({ createdAt: -1 });
    } else {
      bookings = [...store.bookings];
      if (status) bookings = bookings.filter(b => b.status === status);
      if (userRole === ROLES.CUSTOMER || customerId) {
        const cId = customerId || userId;
        bookings = bookings.filter(b => b.customerId === cId || b.customerId?._id === cId);
      }
      if (userRole === ROLES.WORKER || workerId) {
        const wId = workerId || userId;
        bookings = bookings.filter(b => b.workerId === wId || b.workerId?._id === wId || b.workerId?.userId === wId);
      }
    }

    // Enrich with populated names if in-memory store
    const enriched = bookings.map(b => {
      const cust = store.users.find(u => u._id === b.customerId || u._id === b.customerId?._id);
      const wrk = store.workers.find(w => w._id === b.workerId || w._id === b.workerId?._id);
      const srv = store.services.find(s => s._id === b.serviceId || s._id === b.serviceId?._id);
      const coop = store.cooperatives.find(c => c._id === b.cooperativeId || c._id === b.cooperativeId?._id);
      return {
        ...b,
        customer: cust || b.customerId,
        worker: wrk || b.workerId,
        service: srv || b.serviceId,
        cooperative: coop || b.cooperativeId
      };
    });

    return res.status(200).json({ bookings: enriched, count: enriched.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDbStatus();

    let booking = null;
    if (isConnected) {
      booking = await Booking.findById(id)
        .populate('customerId', 'name email phone location')
        .populate('workerId')
        .populate('serviceId')
        .populate('cooperativeId');
    } else {
      booking = store.bookings.find(b => b._id === id || b.bookingReference === id);
    }

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const cust = store.users.find(u => u._id === booking.customerId || u._id === booking.customerId?._id);
    const wrk = store.workers.find(w => w._id === booking.workerId || w._id === booking.workerId?._id);
    const srv = store.services.find(s => s._id === booking.serviceId || s._id === booking.serviceId?._id);
    const coop = store.cooperatives.find(c => c._id === booking.cooperativeId || c._id === booking.cooperativeId?._id);

    return res.status(200).json({
      booking: {
        ...(booking.toObject ? booking.toObject() : booking),
        customer: cust || booking.customerId,
        worker: wrk || booking.workerId,
        service: srv || booking.serviceId,
        cooperative: coop || booking.cooperativeId
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, finalPrice, cancellationReason } = req.body;
    const { isConnected } = getDbStatus();

    const updates = { status };
    if (status === BOOKING_STATUS.STARTED) updates.startedAt = new Date();
    if (status === BOOKING_STATUS.COMPLETED) {
      updates.completedAt = new Date();
      updates.paymentStatus = PAYMENT_STATUS.COMPLETED;
      if (finalPrice) updates.finalPrice = finalPrice;
    }
    if (status === BOOKING_STATUS.CANCELLED && cancellationReason) {
      updates.cancellationReason = cancellationReason;
    }

    let updated = null;
    if (isConnected) {
      updated = await Booking.findByIdAndUpdate(id, updates, { new: true });
    } else {
      const idx = store.bookings.findIndex(b => b._id === id || b.bookingReference === id);
      if (idx !== -1) {
        store.bookings[idx] = { ...store.bookings[idx], ...updates };
        updated = store.bookings[idx];
      }
    }

    if (!updated) return res.status(404).json({ error: 'Booking not found' });
    return res.status(200).json({ booking: updated, message: `Booking status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
