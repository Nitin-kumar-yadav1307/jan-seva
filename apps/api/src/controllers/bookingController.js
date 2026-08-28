import { store } from '../services/store.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { getDbStatus } from '../config/db.js';
import { socketBus } from '../socketBus.js';
import { BOOKING_STATUS, PAYMENT_STATUS, ROLES } from '@coopseva/shared';
import { createBookingSchema } from '@coopseva/validation';
import { VERIFICATION_STATUS } from '@coopseva/shared';

const idValue = (value) => value?._id?.toString() || value?.toString();

const isAdmin = (user) => user?.role === ROLES.ADMIN || user?.role === ROLES.FEDERATION_ADMIN;

const getWorkerForUser = async (user, isConnected) => {
  if (user?.role !== ROLES.WORKER) return null;
  if (isConnected) return Worker.findOne({ userId: user._id });
  return store.workers.find(worker => idValue(worker.userId) === idValue(user._id));
};

const canAccessBooking = async (booking, user, isConnected) => {
  if (isAdmin(user)) return true;
  if (user?.role === ROLES.CUSTOMER) return idValue(booking.customerId) === idValue(user._id);
  if (user?.role === ROLES.WORKER) {
    const worker = await getWorkerForUser(user, isConnected);
    return worker && idValue(booking.workerId) === idValue(worker._id);
  }
  return false;
};

export const createBooking = async (req, res) => {
  try {
    const validatedData = createBookingSchema.parse(req.body);
    const customerId = req.user._id;
    const { isConnected } = getDbStatus();

    // Find service to get price (optional when booking a worker directly by their hourly rate)
    let service = null;
    if (validatedData.serviceId) {
      service = store.services.find(s => s._id === validatedData.serviceId);
      if (!service && isConnected) {
        service = await Service.findById(validatedData.serviceId);
      }
      if (!service) return res.status(404).json({ error: 'Service not found' });
    }

    let workerId = validatedData.workerId;
    let workerDoc = null;
    let cooperativeId;

    if (workerId) {
      workerDoc = store.workers.find(w => w._id === workerId || w.userId === workerId) ||
        (isConnected ? await Worker.findById(workerId) : null);
      if (!workerDoc) return res.status(404).json({ error: 'Worker not found' });
      if (!workerDoc.availability || workerDoc.verificationStatus !== VERIFICATION_STATUS.VERIFIED) {
        return res.status(409).json({ error: 'Worker is not currently eligible for assignment' });
      }
      if (service && !workerDoc.skills?.some(skill => skill.category.toLowerCase() === service.category.toLowerCase())) {
        return res.status(409).json({ error: 'Worker skill does not match this service' });
      }
      if (workerDoc.cooperativeId) {
        cooperativeId = typeof workerDoc.cooperativeId === 'object' ? workerDoc.cooperativeId._id : workerDoc.cooperativeId;
      }
    }

    if (!service && !workerDoc) {
      return res.status(400).json({ error: 'A service or worker is required to create a booking' });
    }

    // Price: service price when booked via a service, otherwise the worker's hourly rate (1-hour visit)
    const workerRate = Number(workerDoc?.skills?.[0]?.hourlyRate ?? workerDoc?.hourlyRate);
    const basePrice = service
      ? (validatedData.isEmergency ? service.emergencyPrice : service.basePrice)
      : (Number.isFinite(workerRate) && workerRate > 0 ? workerRate : 299);

    const bookingData = {
      bookingReference: `CS-${Math.floor(100000 + Math.random() * 900000)}`,
      customerId,
      workerId,
      cooperativeId,
      serviceId: validatedData.serviceId || null,
      location: validatedData.location,
      scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : new Date(),
      status: workerId ? BOOKING_STATUS.ASSIGNED : BOOKING_STATUS.REQUESTED,
      isEmergency: !!validatedData.isEmergency,
      notes: validatedData.notes || '',
      estimatedPrice: basePrice,
      paymentStatus: PAYMENT_STATUS.PENDING,
      matchingScores: req.body.matchingScores,
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
      if (userRole === ROLES.CUSTOMER) query.customerId = userId;
      if (userRole === ROLES.WORKER) {
        const worker = await getWorkerForUser(req.user, isConnected);
        query.workerId = worker?._id || null;
      }
      if (isAdmin(req.user) && customerId) query.customerId = customerId;
      if (isAdmin(req.user) && workerId) query.workerId = workerId;

      bookings = await Booking.find(query)
        .populate('customerId', 'name email phone')
        .populate('workerId')
        .populate('serviceId')
        .populate('cooperativeId')
        .sort({ createdAt: -1 });
    } else {
      bookings = [...store.bookings];
      if (status) bookings = bookings.filter(b => b.status === status);
      if (userRole === ROLES.CUSTOMER) {
        const cId = userId;
        bookings = bookings.filter(b => b.customerId === cId || b.customerId?._id === cId);
      }
      if (userRole === ROLES.WORKER) {
        const worker = await getWorkerForUser(req.user, isConnected);
        const wId = worker?._id;
        bookings = bookings.filter(b => wId && (idValue(b.workerId) === idValue(wId) || b.workerId?.userId === userId));
      }
    }

    // Convert Mongoose documents to plain objects BEFORE enrichment.
    // Spreading a raw Document copies internal state ($__/_doc), not schema paths.
    const plain = bookings.map(b => (b && typeof b.toObject === 'function' ? b.toObject({ getters: true, versionKey: false }) : b));

    // Enrich with populated names if in-memory store
    const enriched = plain.map(b => {
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

    if (isConnected) {
      // Access check MUST run on the raw document: populating customerId
      // replaces it with null when the user record is missing (e.g. demo
      // accounts that only exist in the in-memory store), which would
      // wrongly fail the ownership check with a 403.
      const raw = await Booking.findById(id);
      if (!raw) return res.status(404).json({ error: 'Booking not found' });
      if (!await canAccessBooking(raw, req.user, isConnected)) {
        return res.status(403).json({ error: 'You do not have access to this booking' });
      }
    }

    let booking = null;
    if (isConnected) {
      booking = await Booking.findById(id)
        .populate('customerId', 'name email phone location')
        .populate('workerId')
        .populate('serviceId')
        .populate('cooperativeId');
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
    } else {
      booking = store.bookings.find(b => b._id === id || b.bookingReference === id);
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      if (!await canAccessBooking(booking, req.user, isConnected)) {
        return res.status(403).json({ error: 'You do not have access to this booking' });
      }
    }

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

    const validTransitions = {
      [BOOKING_STATUS.REQUESTED]: [BOOKING_STATUS.MATCHING, BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.MATCHING]: [BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.ASSIGNED]: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.ACCEPTED]: [BOOKING_STATUS.ON_THE_WAY, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.ON_THE_WAY]: [BOOKING_STATUS.STARTED, BOOKING_STATUS.CANCELLED],
      [BOOKING_STATUS.STARTED]: [BOOKING_STATUS.COMPLETED],
      [BOOKING_STATUS.COMPLETED]: [],
      [BOOKING_STATUS.CANCELLED]: []
    };

    let currentBooking = null;
    if (isConnected) currentBooking = await Booking.findById(id);
    else currentBooking = store.bookings.find(b => b._id === id || b.bookingReference === id);
    if (!currentBooking) return res.status(404).json({ error: 'Booking not found' });
    if (!await canAccessBooking(currentBooking, req.user, isConnected)) {
      return res.status(403).json({ error: 'You do not have permission to update this booking' });
    }
    if (!validTransitions[currentBooking.status]?.includes(status)) {
      return res.status(400).json({ error: `Cannot change booking from ${currentBooking.status} to ${status}` });
    }
    const isWorkerAction = req.user.role === ROLES.WORKER;
    const workerStatuses = [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.ON_THE_WAY, BOOKING_STATUS.STARTED, BOOKING_STATUS.COMPLETED];
    if (workerStatuses.includes(status) && !isWorkerAction && !isAdmin(req.user)) {
      return res.status(403).json({ error: 'Only the assigned worker or admin can perform this action' });
    }
    if (status === BOOKING_STATUS.CANCELLED && req.user.role !== ROLES.CUSTOMER && req.user.role !== ROLES.WORKER && !isAdmin(req.user)) {
      return res.status(403).json({ error: 'Only the customer, assigned worker, or admin can cancel this booking' });
    }

    const updates = { status };
    if (status === BOOKING_STATUS.STARTED) updates.startedAt = new Date();
    if (status === BOOKING_STATUS.COMPLETED) {
      updates.completedAt = new Date();
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

    const roomId = updated._id || id;
    const emittedBooking = updated.toObject ? updated.toObject() : updated;
    if (socketBus.io) {
      socketBus.io.to(`booking_${roomId}`).emit('booking_status_updated', {
        bookingId: roomId,
        status,
        payload: emittedBooking
      });
      socketBus.io.emit('booking_status_updated_global', {
        bookingId: roomId,
        status,
        payload: emittedBooking
      });
    }

    return res.status(200).json({ booking: updated, message: `Booking status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
