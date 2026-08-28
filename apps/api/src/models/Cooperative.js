import mongoose from 'mongoose';

const cooperativeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  registrationNumber: {
    type: String,
    unique: true
  },
  federationId: {
    type: String,
    default: 'FED-DELHI-CENTRAL'
  },
  serviceAreas: [{
    city: String,
    zone: String,
    polygon: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: [[[Number]]]
    }
  }],
  contact: {
    phone: String,
    email: String,
    address: String
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING_AUDIT'],
    default: 'ACTIVE'
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 92
  },
  opportunityIndex: {
    type: Number,
    min: 0,
    max: 100,
    default: 88
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Cooperative = mongoose.model('Cooperative', cooperativeSchema);
export default Cooperative;
