import { store } from '../services/store.js';
import Cooperative from '../models/Cooperative.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Payment from '../models/Payment.js';
import Rating from '../models/Rating.js';
import { getDbStatus } from '../config/db.js';
import { cooperativeSchema, cooperativeUpdateSchema } from '@coopseva/validation';

const isAdmin = (user) => user?.role === 'ADMIN' || user?.role === 'FEDERATION_ADMIN';

export const createCooperative = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ error: 'Only administrators can create cooperatives' });
    const data = cooperativeSchema.parse(req.body);
    const { isConnected } = getDbStatus();
    const cooperative = isConnected
      ? await Cooperative.create(data)
      : { _id: `coop_${Date.now()}`, ...data, createdAt: new Date() };
    if (!isConnected) store.cooperatives.push(cooperative);
    return res.status(201).json({ cooperative, message: 'Cooperative created successfully' });
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message });
  }
};

export const updateCooperative = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ error: 'Only administrators can update cooperatives' });
    const updates = cooperativeUpdateSchema.parse(req.body);
    const { id } = req.params;
    const { isConnected } = getDbStatus();
    const cooperative = isConnected
      ? await Cooperative.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      : store.cooperatives.find(item => item._id === id);
    if (!cooperative) return res.status(404).json({ error: 'Cooperative not found' });
    if (!isConnected) Object.assign(cooperative, updates);
    return res.status(200).json({ cooperative, message: 'Cooperative updated successfully' });
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message });
  }
};

export const getCooperativeStats = async (req, res) => {
  try {
    const { isConnected } = getDbStatus();

    let workers = store.workers;
    let bookings = store.bookings;
    let cooperatives = store.cooperatives;
    let services = store.services;
    let payments = store.payments;
    let ratings = store.ratings;

    if (isConnected) {
      workers = await Worker.find({});
      bookings = await Booking.find({});
      cooperatives = await Cooperative.find({});
      services = await Service.find({}).lean();
      payments = await Payment.find({ status: 'COMPLETED' }).lean();
      ratings = await Rating.find({}).lean();
    }

    const totalWorkers = workers.length;
    const verifiedWorkers = workers.filter(w => w.verificationStatus === 'VERIFIED').length;
    const activeBookings = bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status)).length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;

    const totalRevenue = payments.length > 0
      ? payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      : bookings.filter(b => b.paymentStatus === 'COMPLETED' || b.paymentStatus === 'PAID')
        .reduce((sum, b) => sum + (b.finalPrice || b.estimatedPrice || 0), 0);
    const workerWelfareFundAccrued = Math.round(totalRevenue * 0.10);

    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length).toFixed(2)
      : workers.length > 0
        ? (workers.reduce((sum, w) => sum + (w.rating || 0), 0) / workers.length).toFixed(2)
        : '0';

    // Service demand breakdown
    const categoryCounts = {};
    bookings.forEach(b => {
      const serviceId = b.serviceId?._id?.toString() || b.serviceId?.toString();
      const srv = services.find(s => s._id?.toString() === serviceId);
      const cat = srv?.category || 'Unknown';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const serviceDemand = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / (bookings.length || 1)) * 100)
    }));

    const zoneMap = new Map();
    workers.forEach(worker => {
      const zone = worker.currentLocation?.zone || worker.currentLocation?.address || 'Unassigned';
      const entry = zoneMap.get(zone) || { zone, workers: 0, activeJobs: 0, demandIndex: 0 };
      entry.workers += 1;
      zoneMap.set(zone, entry);
    });
    bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status)).forEach(booking => {
      const zone = booking.location?.zone || booking.location?.city || 'Unassigned';
      const entry = zoneMap.get(zone) || { zone, workers: 0, activeJobs: 0, demandIndex: 0 };
      entry.activeJobs += 1;
      zoneMap.set(zone, entry);
    });
    const zoneDistribution = [...zoneMap.values()].map(entry => ({
      ...entry,
      demandIndex: Math.min(100, entry.activeJobs * 20 + (entry.workers ? Math.round(entry.activeJobs / entry.workers * 100) : 0))
    }));

    const opportunityIndex = workers.length > 0
      ? Math.round(workers.reduce((sum, worker) => sum + (worker.opportunityScore || 0), 0) / workers.length)
      : 0;
    const healthScore = Math.round((
      (verifiedWorkers / (totalWorkers || 1)) * 40 +
      (avgRating / 5) * 30 +
      Math.max(0, 30 - (activeBookings / (totalWorkers || 1)) * 5)
    ));

    return res.status(200).json({
      summary: {
        totalWorkers,
        verifiedWorkers,
        activeBookings,
        completedBookings,
        totalRevenue,
        workerWelfareFundAccrued,
        avgRating: Number(avgRating),
        opportunityIndex,
        healthScore: Math.min(100, healthScore)
      },
      serviceDemand,
      zoneDistribution,
      cooperatives
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCooperatives = async (req, res) => {
  try {
    const { isConnected } = getDbStatus();
    let coops = [];
    if (isConnected) {
      coops = await Cooperative.find({});
    } else {
      coops = store.cooperatives;
    }
    return res.status(200).json({ cooperatives: coops });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
