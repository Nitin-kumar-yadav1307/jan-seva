import { store } from '../../services/store.js';

/**
 * bookingTools.js — Booking query tools for AI agents
 * Agents call these to read booking context without DB access.
 */

export const createBookingDraft = ({ workerId, serviceId, customerLocation, isEmergency = false, scheduledAt }) => {
  const worker = store.workers.find(w => w._id === workerId || w.userId === workerId);
  const service = store.services.find(s => s._id === serviceId);

  if (!worker || !service) {
    return { success: false, error: 'Worker or service not found in store' };
  }

  const basePrice = isEmergency ? (service.emergencyPrice || service.basePrice * 1.5) : service.basePrice;
  const workerDirectAmount = Math.round(basePrice * 0.85);
  const cooperativeWelfare = Math.round(basePrice * 0.10);
  const platformFee = Math.round(basePrice * 0.05);

  return {
    success: true,
    draft: {
      workerId: worker._id,
      workerName: worker.name,
      serviceId: service._id,
      serviceName: service.name,
      serviceCategory: service.category,
      isEmergency,
      estimatedPrice: basePrice,
      priceBreakdown: {
        workerDirectAmount,
        cooperativeWelfare,
        platformFee
      },
      scheduledAt: scheduledAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      customerLocation,
      status: 'DRAFT'
    }
  };
};

export const getActiveBookings = ({ workerId } = {}) => {
  let bookings = [...store.bookings];
  if (workerId) {
    bookings = bookings.filter(b => b.workerId === workerId || b.worker?._id === workerId);
  }
  const active = bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status));
  return { bookings: active, count: active.length };
};

export const getBookingHistory = ({ limit = 20 } = {}) => {
  const completed = store.bookings
    .filter(b => b.status === 'COMPLETED')
    .slice(0, limit);
  return {
    bookings: completed,
    count: completed.length,
    totalRevenue: completed.reduce((sum, b) => sum + (b.finalPrice || b.estimatedPrice || 0), 0)
  };
};

export const getWorkerActiveJobCount = (workerId) => {
  const active = store.bookings.filter(b =>
    (b.workerId === workerId || b.worker?._id === workerId) &&
    !['COMPLETED', 'CANCELLED', 'REQUESTED'].includes(b.status)
  );
  return active.length;
};
