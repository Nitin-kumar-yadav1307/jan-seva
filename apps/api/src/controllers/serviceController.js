import { store } from '../services/store.js';
import Service from '../models/Service.js';
import { getDbStatus } from '../config/db.js';
import { serviceSchema, serviceUpdateSchema } from '@coopseva/validation';

const isAdmin = (user) => user?.role === 'ADMIN' || user?.role === 'FEDERATION_ADMIN';

export const createService = async (req, res) => {
  try {
    const data = serviceSchema.parse(req.body);
    const { isConnected } = getDbStatus();
    const service = isConnected
      ? await Service.create(data)
      : { _id: `srv_${Date.now()}`, ...data, createdAt: new Date() };
    if (!isConnected) store.services.push(service);
    return res.status(201).json({ service, message: 'Service created successfully' });
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const updates = serviceUpdateSchema.parse(req.body);
    const { id } = req.params;
    const { isConnected } = getDbStatus();
    const service = isConnected
      ? await Service.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      : store.services.find(item => item._id === id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    if (!isConnected) Object.assign(service, updates);
    return res.status(200).json({ service, message: 'Service updated successfully' });
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDbStatus();
    const result = isConnected
      ? await Service.findByIdAndDelete(id)
      : store.services.splice(store.services.findIndex(item => item._id === id), 1)[0];
    if (!result) return res.status(404).json({ error: 'Service not found' });
    return res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const { category, popular } = req.query;
    const { isConnected } = getDbStatus();

    let services = [];
    if (isConnected) {
      const query = {};
      if (category) query.category = category;
      if (popular !== undefined) query.popular = popular === 'true';
      services = await Service.find(query);
    } else {
      services = [...store.services];
      if (category) services = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
      if (popular !== undefined) services = services.filter(s => String(s.popular) === popular);
    }

    return res.status(200).json({ services, count: services.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDbStatus();

    let service = null;
    if (isConnected) {
      service = await Service.findById(id);
    } else {
      service = store.services.find(s => s._id === id);
    }

    if (!service) return res.status(404).json({ error: 'Service not found' });
    return res.status(200).json({ service });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
