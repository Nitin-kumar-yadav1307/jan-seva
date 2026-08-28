import { store } from '../services/store.js';
import Service from '../models/Service.js';
import { getDbStatus } from '../config/db.js';

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
