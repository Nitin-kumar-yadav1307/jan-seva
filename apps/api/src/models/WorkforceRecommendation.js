import mongoose from 'mongoose';

const workforceRecommendationSchema = new mongoose.Schema({
  recommendationId: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  targetZone: { type: String, required: true },
  sourceZone: { type: String },
  serviceCategory: { type: String, required: true },
  workersToShift: { type: Number, min: 0, required: true },
  rationale: { type: String, required: true },
  impact: { type: String, required: true },
  status: { type: String, enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'], default: 'PENDING_APPROVAL' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  reviewNote: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const WorkforceRecommendation = mongoose.model('WorkforceRecommendation', workforceRecommendationSchema);
export default WorkforceRecommendation;
