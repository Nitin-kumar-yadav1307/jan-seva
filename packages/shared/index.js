export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  WORKER: 'WORKER',
  ADMIN: 'ADMIN',
  FEDERATION_ADMIN: 'FEDERATION_ADMIN'
};

export const BOOKING_STATUS = {
  REQUESTED: 'REQUESTED',
  MATCHING: 'MATCHING',
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  ON_THE_WAY: 'ON_THE_WAY',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED'
};

export const SERVICE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Gardening',
  'Driver',
  'Caregiving',
  'Appliance Repair'
];

export const FAIRNESS_WEIGHTS = {
  NORMAL: {
    skillMatch: 0.30,
    proximity: 0.25,
    rating: 0.15,
    workloadBalance: 0.20, // Prevents overload & favors underutilized
    welfareFactor: 0.10
  },
  EMERGENCY: {
    skillMatch: 0.35,
    proximity: 0.45,       // Proximity & ETA prioritized
    rating: 0.10,
    workloadBalance: 0.05,
    welfareFactor: 0.05
  }
};

export const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
  MR: 'mr'
};

export const MAX_MATCHING_RADIUS_KM = 25;
