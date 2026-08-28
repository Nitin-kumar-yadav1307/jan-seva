import { store } from '../services/store.js';
import Cooperative from '../models/Cooperative.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import { getDbStatus } from '../config/db.js';

export const getCooperativeStats = async (req, res) => {
  try {
    const { isConnected } = getDbStatus();

    let workers = store.workers;
    let bookings = store.bookings;
    let cooperatives = store.cooperatives;

    if (isConnected) {
      workers = await Worker.find({});
      bookings = await Booking.find({});
      cooperatives = await Cooperative.find({});
    }

    const totalWorkers = workers.length;
    const verifiedWorkers = workers.filter(w => w.verificationStatus === 'VERIFIED').length;
    const activeBookings = bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status)).length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.finalPrice || b.estimatedPrice || 0), 0);
    const workerWelfareFundAccrued = Math.round(totalRevenue * 0.10);

    const avgRating = workers.length > 0
      ? (workers.reduce((sum, w) => sum + (w.rating || 4.5), 0) / workers.length).toFixed(2)
      : 4.85;

    // Service demand breakdown
    const categoryCounts = {};
    bookings.forEach(b => {
      const srv = store.services.find(s => s._id === b.serviceId || s._id === b.serviceId?._id);
      const cat = srv ? srv.category : 'Plumbing';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const serviceDemand = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / (bookings.length || 1)) * 100)
    }));

    // Zone distribution
    const zoneDistribution = [
      { zone: 'Zone A - Central Delhi', workers: 7, activeJobs: 3, demandIndex: 94 },
      { zone: 'Zone B - West Delhi', workers: 5, activeJobs: 2, demandIndex: 82 },
      { zone: 'Zone C - South Delhi', workers: 6, activeJobs: 2, demandIndex: 88 },
      { zone: 'Zone D - East Delhi', workers: 4, activeJobs: 1, demandIndex: 76 }
    ];

    return res.status(200).json({
      summary: {
        totalWorkers,
        verifiedWorkers,
        activeBookings,
        completedBookings,
        totalRevenue,
        workerWelfareFundAccrued,
        avgRating: Number(avgRating),
        opportunityIndex: 89,
        healthScore: 94
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
