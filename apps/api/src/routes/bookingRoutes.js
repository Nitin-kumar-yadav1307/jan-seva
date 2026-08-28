import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { ROLES } from '@coopseva/shared';

const router = express.Router();

router.use(authenticateToken);
router.post('/', requireRoles(ROLES.CUSTOMER), createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/accept', (req, res) => {
  req.body = { status: 'ACCEPTED' };
  updateBookingStatus(req, res);
});
router.put('/:id/start', (req, res) => {
  req.body = { status: 'STARTED' };
  updateBookingStatus(req, res);
});
router.put('/:id/complete', (req, res) => {
  req.body = { status: 'COMPLETED' };
  updateBookingStatus(req, res);
});
router.put('/:id/cancel', (req, res) => {
  req.body = { status: 'CANCELLED', cancellationReason: req.body.cancellationReason || 'Cancelled by user' };
  updateBookingStatus(req, res);
});

export default router;
