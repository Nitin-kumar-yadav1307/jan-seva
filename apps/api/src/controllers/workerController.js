import { store } from '../services/store.js';
import Worker from '../models/Worker.js';
import User from '../models/User.js';
import { getDbStatus } from '../config/db.js';
import { VERIFICATION_STATUS } from '@coopseva/shared';

export const getWorkers = async (req, res) => {
  try {
    const { category, verificationStatus, zone, available } = req.query;
    const { isConnected } = getDbStatus();

    let workers = [];
    if (isConnected) {
      const query = {};
      if (category) query['skills.category'] = new RegExp(category, 'i');
      if (verificationStatus) query.verificationStatus = verificationStatus;
      if (available !== undefined) query.availability = available === 'true';
      workers = await Worker.find(query).populate('userId', 'name email phone language').populate('cooperativeId');
    } else {
      workers = [...store.workers];
      if (category) {
        workers = workers.filter(w => w.skills?.some(s => s.category.toLowerCase().includes(category.toLowerCase())));
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

    return res.status(200).json({ workers, count: workers.length });
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
    const updates = req.body;
    const { isConnected } = getDbStatus();

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
