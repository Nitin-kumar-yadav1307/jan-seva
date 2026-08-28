import bcrypt from 'bcryptjs';
import { ROLES, BOOKING_STATUS, PAYMENT_STATUS, VERIFICATION_STATUS } from '@coopseva/shared';

// Initial realistic data sets for New Delhi region
export const INITIAL_COOPERATIVES = [
  {
    _id: 'coop_delhi_central_01',
    name: 'Delhi Central Artisan & Service Co-operative',
    registrationNumber: 'DL-COP-2021-8842',
    federationId: 'FED-DELHI-STATE',
    contact: { phone: '+91 11 2341 5500', email: 'support@delhicentralcoop.org', address: 'Barakhamba Road, Connaught Place, New Delhi' },
    status: 'ACTIVE',
    healthScore: 94,
    opportunityIndex: 89,
    serviceAreas: [{ city: 'New Delhi', zone: 'Central & West' }]
  },
  {
    _id: 'coop_ncr_federation_02',
    name: 'NCR Urban Workers Federation',
    registrationNumber: 'NCR-FED-2019-1094',
    federationId: 'FED-NATIONAL-URBAN',
    contact: { phone: '+91 120 4567 890', email: 'help@ncrurbanfed.org', address: 'Sector 18, Noida / East Delhi' },
    status: 'ACTIVE',
    healthScore: 91,
    opportunityIndex: 86,
    serviceAreas: [{ city: 'Noida / East Delhi', zone: 'East & South' }]
  },
  {
    _id: 'coop_mahila_samiti_03',
    name: 'South Delhi Mahila Seva Sahakari Samiti',
    registrationNumber: 'DL-MAHILA-2022-4412',
    federationId: 'FED-DELHI-STATE',
    contact: { phone: '+91 11 2654 3210', email: 'mahilaseva@coopdelhi.in', address: 'Hauz Khas, New Delhi' },
    status: 'ACTIVE',
    healthScore: 96,
    opportunityIndex: 93,
    serviceAreas: [{ city: 'New Delhi', zone: 'South Delhi' }]
  }
];

export const INITIAL_SERVICES = [
  {
    _id: 'srv_plumb_01',
    name: 'Plumbing & Pipe Repair',
    category: 'Plumbing',
    description: 'Expert pipe leakage fix, tap replacement, bathroom drain unclogging, and sanitary installations.',
    basePrice: 299,
    emergencyPrice: 449,
    estimatedDuration: '45-60 mins',
    icon: 'Wrench',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=60',
    popular: true,
    features: ['30-Day Co-op Guarantee', 'Genuine replacement parts', 'Fair cooperative wage']
  },
  {
    _id: 'srv_elec_02',
    name: 'Electrical Inspection & Wiring',
    category: 'Electrical',
    description: 'Circuit breaker diagnosis, switchboard repair, appliance wiring, and short-circuit troubleshooting.',
    basePrice: 349,
    emergencyPrice: 520,
    estimatedDuration: '60 mins',
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=60',
    popular: true,
    features: ['Certified electricians', 'Safety-tested equipment', 'Emergency rapid response']
  },
  {
    _id: 'srv_carp_03',
    name: 'Carpentry & Furniture Repair',
    category: 'Carpentry',
    description: 'Door lock replacement, hinge repair, custom shelf assembly, and woodwork restoration.',
    basePrice: 399,
    emergencyPrice: 599,
    estimatedDuration: '90 mins',
    icon: 'Hammer',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&auto=format&fit=crop&q=60',
    popular: false,
    features: ['Precision tools', 'Hardwood specialists', 'Upfront pricing']
  },
  {
    _id: 'srv_paint_04',
    name: 'Home Painting & Touch-up',
    category: 'Painting',
    description: 'Waterproofing, wall crack filling, interior room painting, and exterior weather coating.',
    basePrice: 799,
    emergencyPrice: 1199,
    estimatedDuration: '180 mins',
    icon: 'Paintbrush',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=60',
    popular: false,
    features: ['Eco-friendly paints', 'Floor protection included', 'Clean-up after work']
  },
  {
    _id: 'srv_clean_05',
    name: 'Deep Home Cleaning & Sanitization',
    category: 'Cleaning',
    description: 'Full kitchen deep clean, bathroom scrubbing, sofa shampooing, and high-pressure floor washing.',
    basePrice: 499,
    emergencyPrice: 699,
    estimatedDuration: '120 mins',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&auto=format&fit=crop&q=60',
    popular: true,
    features: ['Hospital grade disinfectant', 'Trained women cooperative staff', 'Standardized checklists']
  },
  {
    _id: 'srv_gard_06',
    name: 'Gardening & Lawn Maintenance',
    category: 'Gardening',
    description: 'Plant trimming, pest control, organic fertilizer application, and terrace garden setup.',
    basePrice: 349,
    emergencyPrice: 499,
    estimatedDuration: '60-90 mins',
    icon: 'Trees',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=500&auto=format&fit=crop&q=60',
    popular: false,
    features: ['Organic compost', 'Plant health diagnostic', 'Water saving tips']
  },
  {
    _id: 'srv_appl_07',
    name: 'Appliance Repair (AC, Fridge, RO)',
    category: 'Appliance Repair',
    description: 'AC gas refill, refrigerator cooling repair, microwave service, and RO water purifier filter change.',
    basePrice: 449,
    emergencyPrice: 649,
    estimatedDuration: '60 mins',
    icon: 'Tv',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
    popular: true,
    features: ['OEM spare parts', '90-day service warranty', 'Fair labor pricing']
  },
  {
    _id: 'srv_care_08',
    name: 'Elderly & Patient Home Care',
    category: 'Caregiving',
    description: 'Compassionate assistance for mobility, medication monitoring, meal preparation, and companion care.',
    basePrice: 599,
    emergencyPrice: 899,
    estimatedDuration: '180 mins',
    icon: 'HeartHandshake',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
    popular: false,
    features: ['Background verified caregivers', 'First aid certified', 'Empathetic trained staff']
  },
  {
    _id: 'srv_driv_09',
    name: 'Verified Personal Chauffeur / Driver',
    category: 'Driver',
    description: 'On-demand verified driver for city commute, airport drop, outstation trips, and luxury cars.',
    basePrice: 399,
    emergencyPrice: 599,
    estimatedDuration: '120 mins',
    icon: 'Car',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&auto=format&fit=crop&q=60',
    popular: false,
    features: ['Commercial DL verified', 'Route optimization', '24x7 availability']
  }
];

export const INITIAL_USERS = [
  {
    _id: 'user_cust_01',
    name: 'Aditi Sharma',
    email: 'customer@coopseva.org',
    phone: '9876543210',
    passwordHash: bcrypt.hashSync('Customer@123', 8),
    role: ROLES.CUSTOMER,
    language: 'en',
    location: { type: 'Point', coordinates: [77.2167, 28.6328], address: 'Barakhamba Road, Connaught Place, New Delhi', city: 'New Delhi' }
  },
  {
    _id: 'user_worker_01',
    name: 'Suresh Kumar',
    email: 'suresh@coopseva.org',
    phone: '9811223344',
    passwordHash: bcrypt.hashSync('Worker@123', 8),
    role: ROLES.WORKER,
    language: 'hi',
    location: { type: 'Point', coordinates: [77.2100, 28.6350], address: 'Pahar Ganj, New Delhi', city: 'New Delhi' }
  },
  {
    _id: 'user_worker_02',
    name: 'Ramesh Sharma',
    email: 'ramesh@coopseva.org',
    phone: '9811556677',
    passwordHash: bcrypt.hashSync('Worker@123', 8),
    role: ROLES.WORKER,
    language: 'en',
    location: { type: 'Point', coordinates: [77.2200, 28.6300], address: 'Janpath, New Delhi', city: 'New Delhi' }
  },
  {
    _id: 'user_admin_01',
    name: 'Vikas Mehra (Co-op Admin)',
    email: 'admin@coopseva.org',
    phone: '9900112233',
    passwordHash: bcrypt.hashSync('Admin@123', 8),
    role: ROLES.ADMIN,
    language: 'en',
    location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Federation HQ, New Delhi', city: 'New Delhi' }
  },
  {
    _id: 'user_fedadmin_01',
    name: 'Dr. Sunita Deshmukh',
    email: 'federation@coopseva.org',
    phone: '9911224455',
    passwordHash: bcrypt.hashSync('Federation@123', 8),
    role: ROLES.FEDERATION_ADMIN,
    language: 'en',
    location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Apex Cooperative Council, New Delhi', city: 'New Delhi' }
  }
];

// 22 realistic workers covering all service categories & locations in Delhi-NCR
export const INITIAL_WORKERS = [
  {
    _id: 'wrk_01',
    userId: 'user_worker_01',
    name: 'Suresh Kumar',
    cooperativeId: 'coop_delhi_central_01',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    skills: [
      { category: 'Plumbing', experienceYears: 7, level: 'EXPERT', hourlyRate: 299 },
      { category: 'Appliance Repair', experienceYears: 4, level: 'INTERMEDIATE', hourlyRate: 350 }
    ],
    certifications: [
      { name: 'NSDC Master Plumber Grade A', issuer: 'National Skill Development Corp', year: 2021, verified: true },
      { name: 'Delhi Cooperative Pipe Safety Certificate', issuer: 'Delhi Artisan Co-op', year: 2023, verified: true }
    ],
    experience: 7,
    hourlyRate: 299,
    rating: 4.9,
    totalRatingsCount: 42,
    completedJobs: 138,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    availability: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.2100, 28.6350], // 1.1 km from Connaught Place
      address: 'Pahar Ganj, Central Delhi',
      zone: 'Zone A - Central Delhi'
    },
    workloadScore: 25, // FRESH / Underutilized -> Optimal for fairness balance
    welfareScore: 92,
    opportunityScore: 84,
    activeJobsToday: 1,
    weeklyHoursLogged: 24
  },
  {
    _id: 'wrk_02',
    userId: 'user_worker_02',
    name: 'Ramesh Sharma',
    cooperativeId: 'coop_delhi_central_01',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    skills: [
      { category: 'Plumbing', experienceYears: 9, level: 'EXPERT', hourlyRate: 320 }
    ],
    certifications: [
      { name: 'State Sanitary Tech Certification', issuer: 'Delhi Skill Council', year: 2019, verified: true }
    ],
    experience: 9,
    hourlyRate: 320,
    rating: 4.8,
    totalRatingsCount: 88,
    completedJobs: 290,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    availability: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.2180, 28.6310], // 0.3 km closer to CP, but HIGH WORKLOAD
      address: 'Janpath Lane, New Delhi',
      zone: 'Zone A - Central Delhi'
    },
    workloadScore: 88, // OVERLOADED (6 jobs today, 48 hours logged this week)
    welfareScore: 68,
    opportunityScore: 42,
    activeJobsToday: 5,
    weeklyHoursLogged: 48
  },
  {
    _id: 'wrk_03',
    userId: 'user_worker_03',
    name: 'Priya Devi',
    cooperativeId: 'coop_mahila_samiti_03',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    skills: [
      { category: 'Cleaning', experienceYears: 5, level: 'EXPERT', hourlyRate: 299 },
      { category: 'Caregiving', experienceYears: 3, level: 'INTERMEDIATE', hourlyRate: 350 }
    ],
    certifications: [
      { name: 'Hospitality & Hygiene Gold Standard', issuer: 'Mahila Seva Trust', year: 2022, verified: true }
    ],
    experience: 5,
    hourlyRate: 299,
    rating: 4.95,
    totalRatingsCount: 65,
    completedJobs: 180,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    availability: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.2050, 28.5490], // Hauz Khas / South Delhi
      address: 'Hauz Khas Village, South Delhi',
      zone: 'Zone C - South Delhi'
    },
    workloadScore: 30,
    welfareScore: 95,
    opportunityScore: 90,
    activeJobsToday: 1,
    weeklyHoursLogged: 22
  },
  {
    _id: 'wrk_04',
    userId: 'user_worker_04',
    name: 'Rajesh Verma',
    cooperativeId: 'coop_delhi_central_01',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    skills: [
      { category: 'Electrical', experienceYears: 8, level: 'EXPERT', hourlyRate: 349 }
    ],
    certifications: [
      { name: 'Licensed Wireman Grade 1', issuer: 'Central Electricity Authority', year: 2018, verified: true }
    ],
    experience: 8,
    hourlyRate: 349,
    rating: 4.85,
    totalRatingsCount: 52,
    completedJobs: 165,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    availability: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.1920, 28.6430], // Karol Bagh
      address: 'Karol Bagh Market, New Delhi',
      zone: 'Zone B - West Delhi'
    },
    workloadScore: 40,
    welfareScore: 88,
    opportunityScore: 80,
    activeJobsToday: 2,
    weeklyHoursLogged: 30
  },
  {
    _id: 'wrk_05',
    userId: 'user_worker_05',
    name: 'Amit Singh',
    cooperativeId: 'coop_ncr_federation_02',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    skills: [
      { category: 'Carpentry', experienceYears: 6, level: 'EXPERT', hourlyRate: 399 }
    ],
    certifications: [
      { name: 'Modular Woodwork Certified', issuer: 'National Woodcraft Association', year: 2020, verified: true }
    ],
    experience: 6,
    hourlyRate: 399,
    rating: 4.75,
    totalRatingsCount: 38,
    completedJobs: 110,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    availability: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.2800, 28.6250], // Laxmi Nagar, East Delhi
      address: 'Vikas Marg, Laxmi Nagar',
      zone: 'Zone D - East Delhi'
    },
    workloadScore: 35,
    welfareScore: 90,
    opportunityScore: 78,
    activeJobsToday: 1,
    weeklyHoursLogged: 26
  },
  {
    _id: 'wrk_06',
    userId: 'user_worker_06',
    name: 'Sunita Bai',
    cooperativeId: 'coop_mahila_samiti_03',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    skills: [
      { category: 'Caregiving', experienceYears: 10, level: 'EXPERT', hourlyRate: 499 },
      { category: 'Cleaning', experienceYears: 8, level: 'EXPERT', hourlyRate: 320 }
    ],
    certifications: [
      { name: 'Elder Care Specialist Diploma', issuer: 'Indian Red Cross Society', year: 2017, verified: true }
    ],
    experience: 10,
    hourlyRate: 499,
    rating: 5.0,
    totalRatingsCount: 78,
    completedJobs: 240,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    availability: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.2400, 28.5700], // Lajpat Nagar
      address: 'Lajpat Nagar IV, New Delhi',
      zone: 'Zone C - South Delhi'
    },
    workloadScore: 20,
    welfareScore: 96,
    opportunityScore: 92,
    activeJobsToday: 0,
    weeklyHoursLogged: 18
  },
  {
    _id: 'wrk_07',
    userId: 'user_worker_07',
    name: 'Vikram Patel',
    cooperativeId: 'coop_delhi_central_01',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    skills: [
      { category: 'Appliance Repair', experienceYears: 7, level: 'EXPERT', hourlyRate: 449 }
    ],
    certifications: [
      { name: 'HVAC & Refrigeration Master', issuer: 'Daikin & Co-op Training Institute', year: 2021, verified: true }
    ],
    experience: 7,
    hourlyRate: 449,
    rating: 4.8,
    totalRatingsCount: 45,
    completedJobs: 130,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    availability: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.2250, 28.6500], // Chandni Chowk / North Delhi
      address: 'Chandni Chowk, Old Delhi',
      zone: 'Zone A - Central Delhi'
    },
    workloadScore: 32,
    welfareScore: 89,
    opportunityScore: 82,
    activeJobsToday: 1,
    weeklyHoursLogged: 25
  },
  {
    _id: 'wrk_08',
    userId: 'user_worker_08',
    name: 'Deepak Gupta',
    cooperativeId: 'coop_ncr_federation_02',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    skills: [
      { category: 'Painting', experienceYears: 9, level: 'EXPERT', hourlyRate: 599 }
    ],
    certifications: [
      { name: 'Asian Paints Master Applicator', issuer: 'Asian Paints Academy', year: 2019, verified: true }
    ],
    experience: 9,
    hourlyRate: 599,
    rating: 4.7,
    totalRatingsCount: 33,
    completedJobs: 95,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    availability: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.3100, 28.5800], // Noida Sector 15
      address: 'Sector 15, Noida',
      zone: 'Zone E - NCR East'
    },
    workloadScore: 28,
    welfareScore: 91,
    opportunityScore: 85,
    activeJobsToday: 1,
    weeklyHoursLogged: 20
  },
  {
    _id: 'wrk_09',
    userId: 'user_worker_09',
    name: 'Mohammed Ali',
    cooperativeId: 'coop_delhi_central_01',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    skills: [
      { category: 'Driver', experienceYears: 12, level: 'EXPERT', hourlyRate: 399 }
    ],
    certifications: [
      { name: 'Defensive Driving & First Aid', issuer: 'Automobile Association of Upper India', year: 2018, verified: true }
    ],
    experience: 12,
    hourlyRate: 399,
    rating: 4.9,
    totalRatingsCount: 92,
    completedJobs: 310,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    availability: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.2300, 28.6100], // India Gate area
      address: 'Tilak Marg, Central Delhi',
      zone: 'Zone A - Central Delhi'
    },
    workloadScore: 45,
    welfareScore: 87,
    opportunityScore: 79,
    activeJobsToday: 2,
    weeklyHoursLogged: 32
  },
  {
    _id: 'wrk_10',
    userId: 'user_worker_10',
    name: 'Karan Malhotra',
    cooperativeId: 'coop_delhi_central_01',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    skills: [
      { category: 'Gardening', experienceYears: 6, level: 'EXPERT', hourlyRate: 349 }
    ],
    certifications: [
      { name: 'Horticulture & Landscape Tech', issuer: 'IARI Pusa Delhi', year: 2021, verified: true }
    ],
    experience: 6,
    hourlyRate: 349,
    rating: 4.88,
    totalRatingsCount: 29,
    completedJobs: 84,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    availability: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.1600, 28.6300], // Pusa Road
      address: 'Pusa Institute Campus, New Delhi',
      zone: 'Zone B - West Delhi'
    },
    workloadScore: 22,
    welfareScore: 94,
    opportunityScore: 88,
    activeJobsToday: 0,
    weeklyHoursLogged: 16
  }
];

export const INITIAL_BOOKINGS = [
  {
    _id: 'book_demo_01',
    bookingReference: 'CS-849201',
    customerId: 'user_cust_01',
    workerId: 'wrk_01',
    cooperativeId: 'coop_delhi_central_01',
    serviceId: 'srv_plumb_01',
    location: {
      type: 'Point',
      coordinates: [77.2167, 28.6328],
      address: 'Flat 402, Regalia Heights, Barakhamba Road, New Delhi'
    },
    scheduledAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    status: BOOKING_STATUS.COMPLETED,
    isEmergency: false,
    estimatedPrice: 299,
    finalPrice: 299,
    paymentStatus: PAYMENT_STATUS.COMPLETED,
    matchingScores: {
      overallScore: 94,
      skillScore: 96,
      proximityScore: 92,
      workloadScore: 95,
      welfareFactor: 90,
      reasoning: 'Selected Suresh Kumar: Highly qualified (NSDC Master Plumber), 1.1 km away, and maintains optimal workload balance (24 hrs logged).'
    },
    startedAt: new Date(Date.now() - 3600000 * 2),
    completedAt: new Date(Date.now() - 3600000 * 1),
    ratingId: 'rat_01'
  },
  {
    _id: 'book_demo_02',
    bookingReference: 'CS-710294',
    customerId: 'user_cust_01',
    workerId: 'wrk_04',
    cooperativeId: 'coop_delhi_central_01',
    serviceId: 'srv_elec_02',
    location: {
      type: 'Point',
      coordinates: [77.2167, 28.6328],
      address: 'Barakhamba Road, New Delhi'
    },
    scheduledAt: new Date(Date.now() + 3600000 * 4), // 4 hours later
    status: BOOKING_STATUS.ACCEPTED,
    isEmergency: true,
    estimatedPrice: 520,
    paymentStatus: PAYMENT_STATUS.PENDING,
    matchingScores: {
      overallScore: 91,
      skillScore: 98,
      proximityScore: 88,
      workloadScore: 85,
      welfareFactor: 88,
      reasoning: 'Emergency mode triggered. Selected Rajesh Verma: Licensed Wireman Grade 1, nearby in Karol Bagh, ETA 18 mins.'
    }
  }
];

export const INITIAL_RATINGS = [
  {
    _id: 'rat_01',
    bookingId: 'book_demo_01',
    customerId: 'user_cust_01',
    workerId: 'wrk_01',
    score: 5,
    comment: 'Suresh arrived right on time and fixed our pipe leak with great skill. Very polite cooperative worker!',
    tags: ['On Time', 'Expert Work', 'Fair Price', 'Cooperative Pride'],
    createdAt: new Date(Date.now() - 3600000 * 1)
  }
];

export const INITIAL_AI_LOGS = [
  {
    _id: 'ai_log_01',
    agent: 'SUPERVISOR',
    task: 'ORCHESTRATE_BOOKING_MATCH',
    inputSummary: 'Customer requested emergency plumber for leaking pipe at Connaught Place.',
    toolsUsed: ['findNearbyWorkers', 'getWorkerWorkload', 'calculateFairnessScore'],
    recommendation: {
      selectedWorker: 'Suresh Kumar (wrk_01)',
      recommendedPrice: 299,
      urgencyLevel: 'HIGH',
      fairnessBalancingApplied: true,
      excludedCandidate: 'Ramesh Sharma (wrk_02, excluded due to 48hr workload fatigue protection)'
    },
    confidence: 0.96,
    explainabilityNote: 'Fairness engine balanced skill vs workload. Ramesh Sharma is 300m closer but logged 48hrs this week. Suresh Kumar chosen to guarantee service quality and worker welfare.',
    status: 'EXECUTED',
    createdAt: new Date(Date.now() - 3600000 * 2)
  },
  {
    _id: 'ai_log_02',
    agent: 'FORECAST_AGENT',
    task: 'DEMAND_PREDICTION_ZONE_A',
    inputSummary: 'Predicted upcoming weekend plumbing & electrical surge due to monsoon weather forecast.',
    toolsUsed: ['getHistoricalDemand', 'analyzeZoneTrends'],
    recommendation: {
      zone: 'Zone A - Central Delhi',
      serviceSurge: { Plumbing: '+35%', Electrical: '+28%' },
      requiredStaffing: 14,
      currentAvailable: 9
    },
    confidence: 0.91,
    explainabilityNote: 'Monsoon forecast + 3-week trend indicates 35% surge in pipe blockages. Recommended cross-allocating 4 workers from Zone D.',
    status: 'PROPOSED',
    createdAt: new Date(Date.now() - 3600000 * 12)
  }
];

// Persistent In-Memory Store state
class InMemoryStore {
  constructor() {
    this.cooperatives = [...INITIAL_COOPERATIVES];
    this.services = [...INITIAL_SERVICES];
    this.users = [...INITIAL_USERS];
    this.workers = [...INITIAL_WORKERS];
    this.bookings = [...INITIAL_BOOKINGS];
    this.ratings = [...INITIAL_RATINGS];
    this.aiLogs = [...INITIAL_AI_LOGS];
  }

  resetToDemo() {
    this.cooperatives = JSON.parse(JSON.stringify(INITIAL_COOPERATIVES));
    this.services = JSON.parse(JSON.stringify(INITIAL_SERVICES));
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.workers = JSON.parse(JSON.stringify(INITIAL_WORKERS));
    this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
    this.ratings = JSON.parse(JSON.stringify(INITIAL_RATINGS));
    this.aiLogs = JSON.parse(JSON.stringify(INITIAL_AI_LOGS));
    console.log('[Store] Reset all store tables to initial demo state');
  }
}

export const store = new InMemoryStore();
