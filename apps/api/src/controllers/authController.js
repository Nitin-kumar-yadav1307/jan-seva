import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { store } from '../services/store.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import { registerSchema, loginSchema } from '@coopseva/validation';
import { getDbStatus } from '../config/db.js';
import { ROLES, VERIFICATION_STATUS } from '@coopseva/shared';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'coopseva_dev_only_jwt_secret');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const DEMO_ACCOUNTS = [
  { email: 'demo.customer@coopseva.local', password: 'Demo@123', name: 'Demo Customer', role: ROLES.CUSTOMER, phone: '+91 90000 00001' },
  { email: 'demo.worker@coopseva.local', password: 'Demo@123', name: 'Demo Worker', role: ROLES.WORKER, workerCategory: 'Plumbing', phone: '+91 90000 00002' },
  { email: 'demo.admin@coopseva.local', password: 'Demo@123', name: 'Demo Admin', role: ROLES.ADMIN, phone: '+91 90000 00003' },
];

const ensureDemoAccounts = async () => {
  if (process.env.NODE_ENV === 'production' && process.env.DEMO_ACCOUNTS_ENABLED !== 'true') return;

  const { isConnected } = getDbStatus();

  // When MongoDB is connected the demo accounts MUST exist there too —
  // otherwise bookings created in Mongo reference a customer id that only
  // exists in the in-memory store, and populating that user resolves to
  // null (breaking access checks and tracking pages).
  if (isConnected) {
    for (const account of DEMO_ACCOUNTS) {
      const demoId = account.role === ROLES.CUSTOMER
        ? '000000000000000000000001'
        : account.role === ROLES.WORKER
          ? '000000000000000000000002'
          : '000000000000000000000003';
      let user = await User.findById(demoId);
      if (!user) user = await User.findOne({ email: account.email });
      if (!user) {
        try {
          user = await User.create({
            _id: demoId,
            name: account.name,
            email: account.email,
            phone: account.phone,
            passwordHash: bcrypt.hashSync(account.password, 8),
            role: account.role,
            language: 'en',
            location: {
              type: 'Point',
              coordinates: [72.8777, 19.0760],
              address: 'Dadar, Mumbai',
              city: 'Mumbai'
            }
          });
        } catch (seedErr) {
          // A partially-created demo user (e.g. an old doc with a duplicate
          // phone) must never block login — fall back to the in-memory store.
          console.warn(`[Auth] Demo account ${account.email} could not be synced to DB: ${seedErr.message}`);
          continue;
        }
      }
      if (account.role === ROLES.WORKER) {
        const existingWorker = await Worker.findOne({ userId: user._id });
        if (!existingWorker) {
          await Worker.create({
            userId: user._id,
            name: account.name,
            cooperativeId: null,
            skills: [{ category: account.workerCategory, experienceYears: 1, level: 'BEGINNER', hourlyRate: 299 }],
            completedJobs: 0,
            rating: 0,
            verificationStatus: VERIFICATION_STATUS.VERIFIED,
            availability: true,
            workloadScore: 0,
            welfareScore: 95,
            opportunityScore: 90,
            activeJobsToday: 0,
            weeklyHoursLogged: 0,
            currentLocation: {
              type: 'Point',
              coordinates: [72.8777, 19.0760],
              address: 'Dadar, Mumbai',
              zone: 'Zone A - South Mumbai'
            }
          });
        }
      }
    }
    return;
  }

  for (const account of DEMO_ACCOUNTS) {
    if (store.users.some(user => user.email === account.email)) continue;

    const userId = account.role === ROLES.CUSTOMER
      ? '000000000000000000000001'
      : account.role === ROLES.WORKER
        ? '000000000000000000000002'
        : '000000000000000000000003';
    store.users.push({
      _id: userId,
      name: account.name,
      email: account.email,
      phone: account.phone,
      passwordHash: bcrypt.hashSync(account.password, 8),
      role: account.role,
      language: 'en',
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.0760],
        address: 'Demo workspace, Mumbai',
        city: 'Mumbai'
      },
      createdAt: new Date()
    });

    if (account.role === ROLES.WORKER) {
      store.workers.push({
        _id: 'demo_worker_profile',
        userId,
        name: account.name,
        cooperativeId: null,
        skills: [{ category: account.workerCategory, experienceYears: 0, level: 'BEGINNER', hourlyRate: 0 }],
        completedJobs: 0,
        rating: 0,
        verificationStatus: VERIFICATION_STATUS.PENDING,
        availability: false,
        workloadScore: 0,
        welfareScore: 0,
        opportunityScore: 0,
        activeJobsToday: 0,
        weeklyHoursLogged: 0,
        createdAt: new Date()
      });
    }
  }
};

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/** POST /auth/register
 * Accepts: name, email, password, role, phone, language, location
 * For WORKER: also accepts skills[], cooperativeId, hourlyRate, experience
 * For ADMIN: requires an adminCode match
 */
export const register = async (req, res) => {
  try {
    // Validate admin secret code before creating admin accounts
    if (req.body.role === ROLES.ADMIN || req.body.role === 'FEDERATION_ADMIN') {
      const ADMIN_CODE = process.env.ADMIN_REGISTRATION_CODE;
      if (!ADMIN_CODE) {
        return res.status(503).json({ error: 'Admin registration is not configured.' });
      }
      if (req.body.adminCode !== ADMIN_CODE) {
        return res.status(403).json({ error: 'Invalid admin registration code. Contact your cooperative federation.' });
      }
    }

    const validatedData = registerSchema.parse(req.body);
    const { isConnected } = getDbStatus();

    // Derive a sensible default skill from submitted workerCategory
    const defaultCategory = req.body.workerCategory || 'Plumbing';
    const defaultHourlyRate = parseInt(req.body.hourlyRate) || 299;
    const defaultExperience = parseInt(req.body.experience) || 1;

    if (isConnected) {
      const existing = await User.findOne({ email: validatedData.email });
      if (existing) return res.status(400).json({ error: 'User with this email already exists' });

      const passwordHash = await bcrypt.hash(validatedData.password, 10);
      const user = new User({ ...validatedData, passwordHash });
            await user.save();

      let workerProfile = null;
      if (user.role === ROLES.WORKER) {
        try {
          workerProfile = new Worker({
            userId: user._id,
            cooperativeId: req.body.cooperativeId || null,
            skills: [{
              category: defaultCategory,
              experienceYears: defaultExperience,
              level: defaultExperience > 5 ? 'EXPERT' : defaultExperience > 2 ? 'INTERMEDIATE' : 'BEGINNER',
              hourlyRate: defaultHourlyRate
            }],
            experience: defaultExperience,
            hourlyRate: defaultHourlyRate,
            currentLocation: user.location || {
              type: 'Point',
              coordinates: [72.8777, 19.0760],
              address: 'Mumbai, Maharashtra'
            },
            verificationStatus: VERIFICATION_STATUS.PENDING
          });
          await workerProfile.save();
        } catch (workerErr) {
          // Roll back the user so retries don't hit a duplicate-email lock.
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            error: 'Could not create worker profile: ' + (workerErr.errors ? Object.values(workerErr.errors)[0].message : workerErr.message)
          });
        }
      }

      const token = signToken(user);
      const userObj = user.toObject({ getters: true, versionKey: false });
      delete userObj.passwordHash;
      return res.status(201).json({ user: { ...userObj, workerProfile }, token, message: 'Registration successful' });
    } else {
      // In-Memory store fallback
      const existing = store.users.find(u => u.email === validatedData.email.toLowerCase());
      if (existing) return res.status(400).json({ error: 'User with this email already exists' });

      const newId = `user_${Date.now()}`;
      const newUser = {
        _id: newId,
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        phone: validatedData.phone || '',
        passwordHash: bcrypt.hashSync(validatedData.password, 8),
        role: validatedData.role || ROLES.CUSTOMER,
        language: validatedData.language || 'en',
        location: validatedData.location || {
          type: 'Point',
          coordinates: [72.8777, 19.0760],
          address: 'Dadar, Mumbai',
          city: 'Mumbai'
        },
        createdAt: new Date()
      };
      store.users.push(newUser);

      let workerProfile = null;
      if (newUser.role === ROLES.WORKER) {
        const skillLevel = defaultExperience > 5 ? 'EXPERT' : defaultExperience > 2 ? 'INTERMEDIATE' : 'BEGINNER';
        workerProfile = {
          _id: `wrk_${Date.now()}`,
          userId: newId,
          name: newUser.name,
          cooperativeId: req.body.cooperativeId || 'coop_mumbai_central_01',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=1d4ed8&color=fff&size=150`,
          skills: [{
            category: defaultCategory,
            experienceYears: defaultExperience,
            level: skillLevel,
            hourlyRate: defaultHourlyRate
          }],
          certifications: [],
          experience: defaultExperience,
          hourlyRate: defaultHourlyRate,
          rating: 4.8,
          totalRatingsCount: 0,
          completedJobs: 0,
          verificationStatus: VERIFICATION_STATUS.PENDING,
          availability: true,
          currentLocation: newUser.location,
          workloadScore: 10,
          welfareScore: 95,
          opportunityScore: 90,
          activeJobsToday: 0,
          weeklyHoursLogged: 0,
          createdAt: new Date()
        };
        store.workers.push(workerProfile);
      }

      const token = signToken(newUser);
      const { passwordHash: _, ...safeUser } = newUser;
      return res.status(201).json({ user: { ...safeUser, workerProfile }, token, message: 'Registration successful' });
    }
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/** POST /auth/login */
export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { isConnected } = getDbStatus();

    await ensureDemoAccounts();

    let user = null;
    let isMatch = false;

    if (isConnected) {
      user = await User.findOne({ email: validatedData.email.toLowerCase() });
      if (user) isMatch = await user.comparePassword(validatedData.password);
    }

    if (!user) {
      user = store.users.find(u => u.email.toLowerCase() === validatedData.email.toLowerCase());
      if (user) isMatch = bcrypt.compareSync(validatedData.password, user.passwordHash);
    }

    if (!user || !isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let workerProfile = null;
    if (user.role === ROLES.WORKER) {
      workerProfile = isConnected
        ? await Worker.findOne({ userId: user._id })
        : store.workers.find(w => w.userId === user._id || w.userId?.toString() === user._id?.toString());
    }

    const token = signToken(user);
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.passwordHash;

    return res.status(200).json({ user: { ...userObj, workerProfile }, token });
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/** GET /auth/me */
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let workerProfile = null;
    if (user.role === ROLES.WORKER) {
      const { isConnected } = getDbStatus();
      workerProfile = isConnected
        ? await Worker.findOne({ userId: user._id })
        : store.workers.find(w => w.userId === user._id || w.userId?.toString() === user._id?.toString());
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.passwordHash;

    return res.status(200).json({ user: { ...userObj, workerProfile } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/** POST /auth/logout (stateless — client just drops the token, but log it) */
export const logout = (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully' });
};

/** PUT /auth/change-password */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both current and new passwords required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const { isConnected } = getDbStatus();
    const user = isConnected
      ? await User.findById(req.user._id)
      : store.users.find(item => item._id === req.user._id);
    const isMatch = user?.comparePassword
      ? await user.comparePassword(currentPassword)
      : bcrypt.compareSync(currentPassword, user?.passwordHash || '');
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

    const newHash = bcrypt.hashSync(newPassword, 10);
    if (isConnected) {
      user.passwordHash = newHash;
      await user.save();
    } else if (user) {
      user.passwordHash = newHash;
    }

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
