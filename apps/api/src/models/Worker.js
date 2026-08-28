import mongoose from 'mongoose';
import { VERIFICATION_STATUS } from '@coopseva/shared';

const skillSchema = new mongoose.Schema({
  category: { type: String, required: true },
  experienceYears: { type: Number, default: 2 },
  level: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'EXPERT'], default: 'INTERMEDIATE' },
  hourlyRate: { type: Number, default: 250 }
}, { _id: false });

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  year: { type: Number },
  verified: { type: Boolean, default: true }
}, { _id: false });

const workerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
  },
  skills: [skillSchema],
  certifications: [certificationSchema],
  experience: {
    type: Number,
    default: 3
  },
  hourlyRate: {
    type: Number,
    default: 299
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.8
  },
  totalRatingsCount: {
    type: Number,
    default: 12
  },
  completedJobs: {
    type: Number,
    default: 24
  },
  verificationStatus: {
    type: String,
    enum: Object.values(VERIFICATION_STATUS),
    default: VERIFICATION_STATUS.VERIFIED
  },
  availability: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: { type: String, default: 'Karol Bagh, New Delhi' },
    zone: { type: String, default: 'Zone A - Central Delhi' }
  },
  workloadScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 30 // Low workload = available & fresh
  },
  welfareScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 90
  },
  opportunityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 75
  },
  activeJobsToday: {
    type: Number,
    default: 1
  },
  weeklyHoursLogged: {
    type: Number,
    default: 28
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for geospatial distance matching
workerSchema.index({ currentLocation: '2dsphere' });

const Worker = mongoose.model('Worker', workerSchema);
export default Worker;
