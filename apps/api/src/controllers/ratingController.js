import { store } from '../services/store.js';
import Rating from '../models/Rating.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import { createRatingSchema } from '@coopseva/validation';
import { getDbStatus } from '../config/db.js';

export const createRating = async (req, res) => {
  try {
    const validatedData = createRatingSchema.parse(req.body);
    const customerId = req.user?._id || 'user_cust_01';
    const { isConnected } = getDbStatus();

    // Find booking to get workerId
    let booking = store.bookings.find(b => b._id === validatedData.bookingId || b.bookingReference === validatedData.bookingId);
    if (!booking && isConnected) {
      booking = await Booking.findById(validatedData.bookingId);
    }
    const workerId = booking?.workerId?._id || booking?.workerId || req.body.workerId || 'wrk_01';

    const newRating = {
      _id: `rat_${Date.now()}`,
      bookingId: validatedData.bookingId,
      customerId,
      workerId,
      score: validatedData.score,
      comment: validatedData.comment || '',
      tags: validatedData.tags || ['Courteous', 'On Time', 'Professional'],
      createdAt: new Date()
    };

    if (isConnected) {
      const doc = new Rating(newRating);
      await doc.save();
      
      // Update worker rating and completed jobs count
      const wrk = await Worker.findById(workerId);
      if (wrk) {
        const count = (wrk.totalRatingsCount || 10) + 1;
        const currentSum = (wrk.rating || 4.8) * (count - 1);
        const newAvg = parseFloat(((currentSum + validatedData.score) / count).toFixed(2));
        wrk.rating = newAvg;
        wrk.totalRatingsCount = count;
        wrk.completedJobs = (wrk.completedJobs || 0) + 1;
        await wrk.save();
      }
    } else {
      store.ratings.unshift(newRating);
      const wIdx = store.workers.findIndex(w => w._id === workerId || w.userId === workerId);
      if (wIdx !== -1) {
        const wrk = store.workers[wIdx];
        const count = (wrk.totalRatingsCount || 10) + 1;
        const currentSum = (wrk.rating || 4.8) * (count - 1);
        wrk.rating = parseFloat(((currentSum + validatedData.score) / count).toFixed(2));
        wrk.totalRatingsCount = count;
        wrk.completedJobs = (wrk.completedJobs || 0) + 1;
      }
    }

    return res.status(201).json({
      rating: newRating,
      message: 'Rating and review submitted successfully'
    });
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message });
  }
};
