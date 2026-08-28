import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  emergencyPrice: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDuration: {
    type: String,
    default: '60 mins'
  },
  icon: {
    type: String,
    default: 'Wrench'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=60'
  },
  popular: {
    type: Boolean,
    default: false
  },
  features: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
