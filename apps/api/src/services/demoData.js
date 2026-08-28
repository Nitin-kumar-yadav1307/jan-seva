// Distinct realistic portraits so no two demo workers share an avatar
const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80'
];
const OLD_DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80';

// Distinct service images per category (used for seeding + migration)
const OLD_DEFAULT_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=60';
const SERVICE_IMAGES = {
  Plumbing: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0704?w=900&auto=format&fit=crop&q=80',
  Electrical: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&auto=format&fit=crop&q=80',
  Cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&auto=format&fit=crop&q=80',
  Carpentry: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=900&auto=format&fit=crop&q=80',
  Painting: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900&auto=format&fit=crop&q=80',
  'Appliance Repair': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&auto=format&fit=crop&q=80',
  Caregiving: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=900&auto=format&fit=crop&q=80',
  Gardening: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&auto=format&fit=crop&q=80',
  Driver: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&auto=format&fit=crop&q=80'
};
const serviceImageFor = (category) => SERVICE_IMAGES[category] || 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=900&auto=format&fit=crop&q=80';


import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { store } from './store.js';
import { getDbStatus } from '../config/db.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Cooperative from '../models/Cooperative.js';
import Service from '../models/Service.js';
import { ROLES, VERIFICATION_STATUS } from '@coopseva/shared';

/**
 * Demo dataset for Co-opSeva Mumbai.
 * Workers are spread across the four Mumbai zones so that
 * nearest-first distance sorting and the live map are meaningful.
 */
const DEMO_COOPERATIVE = {
  name: 'Mumbai Central Artisan Co-op',
  registrationNumber: 'MUM/COOP/2024/0117',
  contact: { phone: '+91 22 4000 1234', email: 'hello@mumbaicentralcoop.in', address: 'Dadar West, Mumbai 400028' }
};

// [name, email, category, experienceYears, hourlyRate, [lon, lat], address, zone, rating]
const DEMO_WORKERS = [
  ['Ramesh Iyer', 'ramesh.plumber@coopseva.local', 'Plumbing', 9, 349, [72.8422, 19.0176], 'Dadar West, Mumbai', 'Zone A - South Mumbai', 4.9],
  ['Sunita Kamble', 'sunita.cleaner@coopseva.local', 'Cleaning', 6, 299, [72.8347, 18.9334], 'Fort, Mumbai', 'Zone A - South Mumbai', 4.8],
  ['Abdul Shaikh', 'abdul.electrician@coopseva.local', 'Electrical', 11, 399, [72.8231, 19.0075], 'Worli, Mumbai', 'Zone A - South Mumbai', 4.9],
  ['Priya Nair', 'priya.caregiver@coopseva.local', 'Caregiving', 7, 379, [72.8223, 18.9067], 'Colaba, Mumbai', 'Zone A - South Mumbai', 4.7],
  ['Vikas Jadhav', 'vikas.carpenter@coopseva.local', 'Carpentry', 8, 359, [72.8347, 19.0596], 'Bandra West, Mumbai', 'Zone B - Western Suburbs', 4.8],
  ['Farhan Qureshi', 'farhan.acrepair@coopseva.local', 'Appliance Repair', 5, 329, [72.8697, 19.1136], 'Andheri East, Mumbai', 'Zone B - Western Suburbs', 4.6],
  ['Meera Deshpande', 'meera.painter@coopseva.local', 'Painting', 10, 339, [72.8547, 19.2307], 'Borivali West, Mumbai', 'Zone B - Western Suburbs', 4.9],
  ['Sanjay Gupta', 'sanjay.plumber@coopseva.local', 'Plumbing', 4, 279, [72.8265, 19.0968], 'Juhu, Mumbai', 'Zone B - Western Suburbs', 4.5],
  ['Lakshmi Rao', 'lakshmi.cleaner@coopseva.local', 'Cleaning', 3, 259, [72.8846, 19.0726], 'Kurla West, Mumbai', 'Zone C - Central Suburbs', 4.6],
  ['Deepak Pawar', 'deepak.electrician@coopseva.local', 'Electrical', 6, 319, [72.9046, 19.0869], 'Ghatkopar West, Mumbai', 'Zone C - Central Suburbs', 4.7],
  ['Anjali Verma', 'anjali.gardener@coopseva.local', 'Gardening', 5, 289, [72.9470, 19.1726], 'Mulund West, Mumbai', 'Zone C - Central Suburbs', 4.8],
  ['Imran Khan', 'imran.driver@coopseva.local', 'Driver', 8, 269, [72.9986, 19.0771], 'Vashi, Navi Mumbai', 'Zone D - Navi Mumbai', 4.7],
  ['Rohini Patil', 'rohini.caregiver@coopseva.local', 'Caregiving', 4, 309, [73.0158, 19.0330], 'Nerul, Navi Mumbai', 'Zone D - Navi Mumbai', 4.6],
  ['Kiran Bhoir', 'kiran.carpenter@coopseva.local', 'Carpentry', 12, 399, [73.0667, 19.1180], 'Kharghar, Navi Mumbai', 'Zone D - Navi Mumbai', 4.9]
];

const DEMO_SERVICES = [
  ['Expert Plumbing Repair', 'Plumbing', 'Leak fixing, tap & pipe installation, bathroom fittings by certified plumbers.', 349, 499, '90 mins', true, ['Leak detection & fix', 'Pipe & tap installation', '6-month service warranty']],
  ['Home Electrical Services', 'Electrical', 'Wiring, switchboards, fan & light installation by licensed electricians.', 399, 549, '60 mins', true, ['Wiring & rewiring', 'Switchboard repair', 'Safety inspection included']],
  ['Deep Home Cleaning', 'Cleaning', 'Full-home deep cleaning including kitchen, bathrooms and balconies.', 1299, 1799, '3 hrs', true, ['Trained cleaning crew', 'Eco-friendly supplies', 'Before/after checklist']],
  ['Carpentry & Furniture Repair', 'Carpentry', 'Furniture repair, door alignment, modular fittings and custom woodwork.', 359, 499, '2 hrs', false, ['Door & lock alignment', 'Furniture assembly', 'Hardware replacement']],
  ['AC & Appliance Repair', 'Appliance Repair', 'AC servicing, fridge & washing machine repair by brand-trained technicians.', 329, 599, '75 mins', true, ['AC gas refill', 'Deep coil cleaning', '90-day repair warranty']],
  ['Interior & Exterior Painting', 'Painting', 'Professional painting with premium finishes and complete site protection.', 2499, 3499, '1 day', false, ['Putty & primer included', 'Site masking & cleanup', 'Colour consultation']],
  ['Elder Care & Companionship', 'Caregiving', 'Verified, trained caregivers for elderly assistance and daily support.', 379, 549, '4 hrs', false, ['Background-verified staff', 'Daily activity report', 'Emergency escalation protocol']],
  ['Garden & Terrace Maintenance', 'Gardening', 'Plant care, pruning, terrace garden setup and seasonal maintenance.', 289, 429, '90 mins', false, ['Pruning & trimming', 'Soil & fertiliser care', 'Monthly maintenance plans']]
];

const skillLevel = (years) => (years > 5 ? 'EXPERT' : years > 2 ? 'INTERMEDIATE' : 'BEGINNER');


 const seedMongo = async () => {
  // Normalize legacy worker docs that lack GeoJSON coordinates. These break the
  // 2dsphere index build and crash seeding, but distances are computed in JS so
  // we just backfill a valid Mumbai coordinate for safety.
  try {
    const raw = mongoose.connection.db.collection('workers');
    await raw.updateMany(
      { 'currentLocation.coordinates': { $exists: false } },
      {
        $set: {
          'currentLocation.type': 'Point',
          'currentLocation.coordinates': [72.8777, 19.0760],
          'currentLocation.address': 'Dadar, Mumbai',
          'currentLocation.city': 'Mumbai',
          'currentLocation.zone': 'Zone A - South Mumbai'
        }
      }
    );
  } catch (e) { /* best effort */ }

  if ((await Worker.countDocuments()) === 0 && (await User.countDocuments({ role: ROLES.WORKER })) <= 1) {
    const cooperative = (await Cooperative.countDocuments()) === 0
      ? await Cooperative.create(DEMO_COOPERATIVE)
      : await Cooperative.findOne({ name: DEMO_COOPERATIVE.name });

    const passwordHash = await bcrypt.hash('Demo@123', 10);
    for (const [i, [name, email, category, years, rate, coordinates, address, zone, rating]] of DEMO_WORKERS.entries()) {
      const user = await User.create({
        name, email,
        phone: `+91 98${String(200000000 + Math.floor(Math.random() * 799999999)).slice(0, 8)}`,
        passwordHash,
        role: ROLES.WORKER,
        location: { type: 'Point', coordinates, address, city: 'Mumbai' }
      });
      await Worker.create({
        userId: user._id,
        cooperativeId: cooperative._id,
        name,
        avatar: AVATAR_POOL[i % AVATAR_POOL.length],
        skills: [{ category, experienceYears: years, level: skillLevel(years), hourlyRate: rate }],
        certifications: [{ name: 'NSDC Skill Certified', issuer: 'NSDC', year: 2023, verified: true }],
        experience: years,
        hourlyRate: rate,
        rating,
        totalRatingsCount: 10 + Math.floor(Math.random() * 90),
        completedJobs: 20 + Math.floor(Math.random() * 180),
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        availability: true,
        currentLocation: { type: 'Point', coordinates, address, zone }
      });
    }
    console.log(`[DemoData] Seeded ${DEMO_WORKERS.length} Mumbai cooperative workers.`);
  }

  // One-time avatar migration: fix workers seeded before distinct avatars existed
  const staleAvatars = await Worker.find({
    $or: [
      { avatar: '' },
      { avatar: { $exists: false } },
      { avatar: OLD_DEFAULT_AVATAR },
      { avatar: { $regex: 'ui-avatars\\.com' } }
    ]
  });
    if (staleAvatars.length > 0) {
    for (const [i, w] of staleAvatars.entries()) {
      w.avatar = AVATAR_POOL[i % AVATAR_POOL.length];
      await w.save({ validateBeforeSave: false }); // don't re-validate missing required fields on legacy docs
    }
    console.log(`[DemoData] Updated avatars for ${staleAvatars.length} workers.`);
  }

  // One-time image migration: give seeded services distinct per-category photos
  const staleServices = await Service.find({
    $or: [
      { image: OLD_DEFAULT_SERVICE_IMAGE },
      { image: '' },
      { image: { $exists: false } }
    ]
  });
    if (staleServices.length > 0) {
    for (const s of staleServices) {
      s.image = serviceImageFor(s.category);
      await s.save({ validateBeforeSave: false }); // don't re-validate legacy docs
    }
    console.log(`[DemoData] Updated images for ${staleServices.length} services.`);
  }

  if ((await Service.countDocuments()) === 0) {
    for (const [name, category, description, basePrice, emergencyPrice, estimatedDuration, popular, features] of DEMO_SERVICES) {
      await Service.create({ name, category, description, basePrice, emergencyPrice, estimatedDuration, popular, features, image: serviceImageFor(category) });
    }
    console.log(`[DemoData] Seeded ${DEMO_SERVICES.length} services.`);
  }
};

const seedInMemory = () => {
  if (store.workers.length === 0) {
    const passwordHash = bcrypt.hashSync('Demo@123', 8);
    const cooperative = {
      _id: `coop_${Date.now()}`,
      ...DEMO_COOPERATIVE,
      status: 'ACTIVE',
      healthScore: 92,
      opportunityIndex: 88,
      createdAt: new Date()
    };
    store.cooperatives.push(cooperative);

    for (const [i, [name, email, category, years, rate, coordinates, address, zone, rating]] of DEMO_WORKERS.entries()) {
      const userId = `user_${email.split('@')[0]}`;
      if (!store.users.some(u => u.email === email)) {
        store.users.push({
          _id: userId, name, email, phone: '+91 98200 00000', passwordHash,
          role: ROLES.WORKER,
          location: { type: 'Point', coordinates, address, city: 'Mumbai' },
          createdAt: new Date()
        });
      }
      store.workers.push({
        _id: `wrk_${email.split('@')[0]}`,
        userId,
        cooperativeId: cooperative._id,
        name,
        avatar: AVATAR_POOL[i % AVATAR_POOL.length],
        skills: [{ category, experienceYears: years, level: skillLevel(years), hourlyRate: rate }],
        certifications: [{ name: 'NSDC Skill Certified', issuer: 'NSDC', year: 2023, verified: true }],
        experience: years,
        hourlyRate: rate,
        rating,
        totalRatingsCount: 10 + Math.floor(Math.random() * 90),
        completedJobs: 20 + Math.floor(Math.random() * 180),
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        availability: true,
        currentLocation: { type: 'Point', coordinates, address, zone },
        workloadScore: 15 + Math.floor(Math.random() * 40),
        welfareScore: 85 + Math.floor(Math.random() * 15),
        opportunityScore: 70 + Math.floor(Math.random() * 25),
        activeJobsToday: Math.floor(Math.random() * 3),
        weeklyHoursLogged: 20 + Math.floor(Math.random() * 20),
        createdAt: new Date()
      });
    }
    console.log(`[DemoData] Seeded ${DEMO_WORKERS.length} Mumbai cooperative workers (in-memory).`);
  }

  if (store.services.length === 0) {
    DEMO_SERVICES.forEach(([name, category, description, basePrice, emergencyPrice, estimatedDuration, popular, features], i) => {
      store.services.push({
        _id: `svc_${i + 1}`, name, category, description, basePrice, emergencyPrice,
        estimatedDuration, popular, features, image: serviceImageFor(category), createdAt: new Date()
      });
    });
    console.log(`[DemoData] Seeded ${DEMO_SERVICES.length} services (in-memory).`);
  }
};

export const ensureDemoData = async () => {
  try {
    // Never seed demo data in production unless explicitly enabled
    if (process.env.NODE_ENV === 'production' && process.env.DEMO_ACCOUNTS_ENABLED !== 'true') {
      return;
    }
    const { isConnected } = getDbStatus();
    if (isConnected) {
      await seedMongo();
    } else {
      seedInMemory();
    }
  } catch (err) {
    console.warn(`[DemoData] Skipped demo seeding: ${err.message}`);
  }
};
