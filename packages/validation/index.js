import { z } from 'zod';
import { ROLES, BOOKING_STATUS, PAYMENT_STATUS, VERIFICATION_STATUS } from '@coopseva/shared';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([ROLES.CUSTOMER, ROLES.WORKER, ROLES.ADMIN, ROLES.FEDERATION_ADMIN]).default(ROLES.CUSTOMER),
  language: z.string().default('en'),
  location: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
    address: z.string().optional(),
    city: z.string().optional()
  }).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const workerProfileSchema = z.object({
  cooperativeId: z.string().optional(),
  skills: z.array(z.object({
    category: z.string(),
    experienceYears: z.number().min(0),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'EXPERT']).default('INTERMEDIATE'),
    hourlyRate: z.number().min(0)
  })).min(1, 'At least one skill is required'),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number().optional(),
    verified: z.boolean().default(false)
  })).optional(),
  experienceYears: z.number().min(0).default(1),
  hourlyRate: z.number().min(50).default(250),
  availability: z.boolean().default(true),
  currentLocation: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.string().optional(),
    city: z.string().optional()
  })
});

export const createBookingSchema = z.object({
  serviceId: z.string(),
  workerId: z.string().optional(),
  location: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.string(),
    city: z.string().optional()
  }),
  scheduledAt: z.string().or(z.date()),
  notes: z.string().optional(),
  isEmergency: z.boolean().default(false)
});

export const createRatingSchema = z.object({
  bookingId: z.string(),
  score: z.number().min(1).max(5),
  comment: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const aiBookingIntentSchema = z.object({
  prompt: z.string().min(3, 'Prompt is required'),
  customerLocation: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.string().optional()
  }).optional(),
  language: z.string().default('en')
});
