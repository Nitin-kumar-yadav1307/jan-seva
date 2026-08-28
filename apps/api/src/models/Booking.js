import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS } from '@coopseva/shared';

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    unique: true,
    default: () => `CS-${Math.floor(100000 + Math.random() * 900000)}`
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative'
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
    // Optional: bookings made directly for a worker use the worker's hourly rate instead
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: { type: String, required: true },
    city: { type: String, default: 'Mumbai' }
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.REQUESTED
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  },
  estimatedPrice: {
    type: Number,
    required: true
  },
  finalPrice: {
    type: Number
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  matchingScores: {
    overallScore: Number,
    skillScore: Number,
    proximityScore: Number,
    workloadScore: Number,
    welfareFactor: Number,
    reasoning: String
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  ratingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.index({ location: '2dsphere' });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
