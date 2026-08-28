import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { store } from '../services/store.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import { registerSchema, loginSchema } from '@coopseva/validation';
import { getDbStatus } from '../config/db.js';
import { ROLES, VERIFICATION_STATUS } from '@coopseva/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'coopseva_super_secret_jwt_key_sih_2026_prototype';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { isConnected } = getDbStatus();

    // Check if user already exists
    if (isConnected) {
      const existing = await User.findOne({ email: validatedData.email });
      if (existing) return res.status(400).json({ error: 'User with this email already exists' });

      const passwordHash = await bcrypt.hash(validatedData.password, 10);
      const user = new User({ ...validatedData, passwordHash });
      await user.save();

      // If registered as worker, create worker profile
      if (user.role === ROLES.WORKER) {
        const workerProfile = new Worker({
          userId: user._id,
          skills: [{ category: 'Plumbing', experienceYears: 1, level: 'BEGINNER', hourlyRate: 250 }],
          currentLocation: user.location,
          verificationStatus: VERIFICATION_STATUS.PENDING
        });
        await workerProfile.save();
      }

      const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return res.status(201).json({ user: user.toObject({ getters: true, versionKey: false }), token });
    } else {
      // In-Memory store fallback
      const existing = store.users.find(u => u.email === validatedData.email);
      if (existing) return res.status(400).json({ error: 'User with this email already exists' });

      const newId = `user_${Date.now()}`;
      const newUser = {
        _id: newId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        passwordHash: bcrypt.hashSync(validatedData.password, 8),
        role: validatedData.role || ROLES.CUSTOMER,
        language: validatedData.language || 'en',
        location: validatedData.location || {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
          address: 'Connaught Place, New Delhi',
          city: 'New Delhi'
        },
        createdAt: new Date()
      };
      store.users.push(newUser);

      if (newUser.role === ROLES.WORKER) {
        const newWorker = {
          _id: `wrk_${Date.now()}`,
          userId: newId,
          name: newUser.name,
          cooperativeId: 'coop_delhi_central_01',
          avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
          skills: [{ category: 'Plumbing', experienceYears: 2, level: 'INTERMEDIATE', hourlyRate: 299 }],
          certifications: [],
          experience: 2,
          hourlyRate: 299,
          rating: 4.8,
          totalRatingsCount: 5,
          completedJobs: 12,
          verificationStatus: VERIFICATION_STATUS.PENDING,
          availability: true,
          currentLocation: newUser.location,
          workloadScore: 20,
          welfareScore: 90,
          opportunityScore: 80,
          activeJobsToday: 0,
          weeklyHoursLogged: 10
        };
        store.workers.push(newWorker);
      }

      const token = jwt.sign({ id: newUser._id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      const { passwordHash: _, ...safeUser } = newUser;
      return res.status(201).json({ user: safeUser, token });
    }
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { isConnected } = getDbStatus();

    let user = null;
    let isMatch = false;

    if (isConnected) {
      user = await User.findOne({ email: validatedData.email.toLowerCase() });
      if (user) {
        isMatch = await user.comparePassword(validatedData.password);
      }
    } else {
      user = store.users.find(u => u.email.toLowerCase() === validatedData.email.toLowerCase());
      if (user) {
        isMatch = bcrypt.compareSync(validatedData.password, user.passwordHash);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Attach worker details if worker
    let workerProfile = null;
    if (user.role === ROLES.WORKER) {
      workerProfile = store.workers.find(w => w.userId === user._id || w.userId?.toString() === user._id?.toString());
    }

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.passwordHash;

    return res.status(200).json({
      user: { ...userObj, workerProfile },
      token
    });
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let workerProfile = null;
    if (user.role === ROLES.WORKER) {
      workerProfile = store.workers.find(w => w.userId === user._id || w.userId?.toString() === user._id?.toString());
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.passwordHash;

    return res.status(200).json({ user: { ...userObj, workerProfile } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
