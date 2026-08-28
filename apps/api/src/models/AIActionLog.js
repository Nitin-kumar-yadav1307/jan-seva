import mongoose from 'mongoose';

const aiActionLogSchema = new mongoose.Schema({
  agent: {
    type: String,
    enum: ['SUPERVISOR', 'BOOKING_AGENT', 'MATCHING_AGENT', 'FORECAST_AGENT', 'WORKFORCE_AGENT', 'WELFARE_AGENT'],
    required: true
  },
  task: {
    type: String,
    required: true
  },
  inputSummary: {
    type: String,
    required: true
  },
  toolsUsed: [{
    type: String
  }],
  recommendation: {
    type: mongoose.Schema.Types.Mixed
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.95
  },
  explainabilityNote: {
    type: String
  },
  status: {
    type: String,
    enum: ['PROPOSED', 'APPROVED', 'REJECTED', 'EXECUTED'],
    default: 'EXECUTED'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AIActionLog = mongoose.model('AIActionLog', aiActionLogSchema);
export default AIActionLog;
