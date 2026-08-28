import { store } from '../services/store.js';
import Worker from '../models/Worker.js';
import User from '../models/User.js';
import { getDbStatus } from '../config/db.js';
import { VERIFICATION_STATUS } from '@coopseva/shared';
import { workerProfileSchema, workerProfileUpdateSchema } from '@coopseva/validation';
import { calculateDistanceKm } from '../matching/scoring.js';

export const createWorkerProfile = async (req, res) => {
  try {
    const data = workerProfileSchema.parse(req.body);
    const { isConnected } = getDbStatus();
    if (req.user.role !== 'WORKER') return res.status(403).json({ error: 'Only workers can create a worker profile' });

    if (isConnected) {
      const existing = await Worker.findOne({ userId: req.user._id });
      if (existing) return res.status(409).json({ error: 'Worker profile already exists' });
      const worker = await Worker.create({
        userId: req.user._id,
        ...data,
        experience: data.experienceYears,
        verificationStatus: VERIFICATION_STATUS.PENDING
      });
      return res.status(201).json({ worker, message: 'Worker profile created successfully' });
    }

    if (store.workers.some(worker => worker.userId === req.user._id)) {
      return res.status(409).json({ error: 'Worker profile already exists' });
    }
    const worker = {
      _id: `wrk_${Date.now()}`,
      userId: req.user._id,
      ...data,
      experience: data.experienceYears,
      verificationStatus: VERIFICATION_STATUS.PENDING,
      createdAt: new Date()
    };
    store.workers.push(worker);
    return res.status(201).json({ worker, message: 'Worker profile created successfully' });
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message });
  }
};

export const getWorkers = async (req, res) => {
  try {
    const { category, verificationStatus, zone, available, lat, lng } = req.query;
    const { isConnected } = getDbStatus();

    let workers = [];
    if (isConnected) {
      const query = {};
      if (category) query['skills.category'] = new RegExp(category, 'i');
      if (verificationStatus) query.verificationStatus = verificationStatus;
      if (available !== undefined) query.availability = available === 'true';
      workers = await Worker.find(query).populate('userId', 'name email phone language').populate('cooperativeId');
      workers = workers.map(w => ({
        ...w.toObject({ getters: true, versionKey: false }),
        name: w.name || w.userId?.name || 'Cooperative Worker',
        avatar: w.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name || w.userId?.name || 'Worker')}&background=2F80ED&color=fff&size=150`
      }));
    } else {
      workers = [...store.workers];
      if (category) {
        workers = workers.filter(w => w.skills?.some(s => s.category?.toLowerCase().includes(category.toLowerCase())));
      }
      if (verificationStatus) {
        workers = workers.filter(w => w.verificationStatus === verificationStatus);
      }
      if (available !== undefined) {
        workers = workers.filter(w => String(w.availability) === available);
      }
      if (zone) {
        workers = workers.filter(w => w.currentLocation?.zone?.toLowerCase().includes(zone.toLowerCase()));
      }
    }

    // Customer's location → rank workers by distance (nearest first)
    let searchCenter = null;
    const customerLat = Number(lat);
    const customerLng = Number(lng);
    if (Number.isFinite(customerLat) && Number.isFinite(customerLng)) {
      searchCenter = { lat: customerLat, lon: customerLng };

      workers = workers.map(w => {
        const coords = w.currentLocation?.coordinates || [72.8777, 19.0760]; // [lon, lat]
        if (!Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) {
          return { ...w, distanceKm: null, etaMinutes: null };
        }
        const distanceKm = calculateDistanceKm(customerLat, customerLng, coords[1], coords[0]);
        const etaMinutes = Math.max(5, Math.round(distanceKm * 12)); // ~5 km/h urban travel estimate
        return {
          ...w,
          distanceKm: Math.round(distanceKm * 10) / 10,
          etaMinutes,
          etaText: etaMinutes <= 10 ? 'Within 10 mins' : `~${etaMinutes} mins`,
        };
      });

      // Nulls (unknown location) go last; otherwise nearest first
      workers.sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return res.status(200).json({ workers, count: workers.length, searchCenter });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDbStatus();

    let worker = null;
    if (isConnected) {
      worker = await Worker.findById(id).populate('userId', 'name email phone language').populate('cooperativeId');
      if (worker) {
        worker = {
          ...worker.toObject({ getters: true, versionKey: false }),
          name: worker.name || worker.userId?.name || 'Cooperative Worker',
          avatar: worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name || worker.userId?.name || 'Worker')}&background=2F80ED&color=fff&size=150`
        };
      }
    } else {
      worker = store.workers.find(w => w._id === id || w.userId === id);
    }

    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    return res.status(200).json({ worker });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateWorkerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = workerProfileUpdateSchema.parse(req.body);
    const { isConnected } = getDbStatus();

    if (req.user.role !== 'ADMIN' && req.user.role !== 'FEDERATION_ADMIN') {
      const worker = isConnected
        ? await Worker.findById(id)
        : store.workers.find(item => item._id === id || item.userId === id);
      if (!worker || worker.userId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'You can only update your own worker profile' });
      }
    }

    let updatedWorker = null;
    if (isConnected) {
      updatedWorker = await Worker.findByIdAndUpdate(id, updates, { new: true });
    } else {
      const index = store.workers.findIndex(w => w._id === id || w.userId === id);
      if (index !== -1) {
        store.workers[index] = { ...store.workers[index], ...updates };
        updatedWorker = store.workers[index];
      }
    }

    if (!updatedWorker) return res.status(404).json({ error: 'Worker not found' });
    return res.status(200).json({ worker: updatedWorker, message: 'Worker profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const verifyWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = VERIFICATION_STATUS.VERIFIED, reason = 'Cooperative verification complete' } = req.body;
    const { isConnected } = getDbStatus();

    let worker = null;
    if (isConnected) {
      worker = await Worker.findByIdAndUpdate(id, { verificationStatus: status }, { new: true });
    } else {
      const item = store.workers.find(w => w._id === id);
      if (item) {
        item.verificationStatus = status;
        worker = item;
      }
    }

    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    return res.status(200).json({ worker, message: `Worker status changed to ${status}`, reason });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
