import jwt from 'jsonwebtoken';
import { store } from '../services/store.js';
import User from '../models/User.js';
import { getDbStatus } from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'coopseva_dev_only_jwt_secret');
    if (!secret) return res.status(503).json({ error: 'Authentication is not configured' });
    const decoded = jwt.verify(token, secret);
    
    let user = null;
    const { isConnected } = getDbStatus();
    
    if (isConnected) {
      user = await User.findById(decoded.id).select('-passwordHash');
    }
    
    // Fallback if not connected or not found
    if (!user) {
      user = store.users.find(u => u._id === decoded.id || u.email === decoded.email);
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found or session expired' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
