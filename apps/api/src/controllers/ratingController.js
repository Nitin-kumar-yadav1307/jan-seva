import { store } from '../services/store.js';
import Rating from '../models/Rating.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import { createRatingSchema } from '@coopseva/validation';
import { getDbStatus } from '../config/db.js';

export const createRating = async (req, res) => {
  try {
    const validatedData = createRatingSchema.parse(req.body);
    const customerId = req.user._id;
    const { isConnected } = getDbStatus();

    // Find booking to get workerId
    let booking = isConnected
      ? await Booking.findById(validatedData.bookingId)
      : store.bookings.find(b => b._id === validatedData.bookingId || b.bookingReference === validatedData.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.customerId?.toString() !== customerId.toString()) {
      return res.status(403).json({ error: 'You can only rate your own bookings' });
    }
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Only completed bookings can be rated' });
    }
    const workerId = booking.workerId?._id || booking.workerId;
    if (!workerId) return res.status(400).json({ error: 'Booking has no assigned worker' });
    if (isConnected && await Rating.exists({ bookingId: validatedData.bookingId })) {
      return res.status(409).json({ error: 'This booking has already been rated' });
    }
    if (!isConnected && store.ratings.some(rating => rating.bookingId === validatedData.bookingId)) {
      return res.status(409).json({ error: 'This booking has already been rated' });
    }

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
      const { _id, ...ratingData } = newRating;
      const doc = new Rating(ratingData);
      await doc.save();
      booking.ratingId = doc._id;
      await booking.save();
      
      // Update worker rating and completed jobs count
      const wrk = await Worker.findById(workerId);
      if (wrk) {
        const previousCount = wrk.totalRatingsCount || 0;
        const count = previousCount + 1;
        const currentSum = (wrk.rating || 0) * previousCount;
        const newAvg = parseFloat(((currentSum + validatedData.score) / count).toFixed(2));
        wrk.rating = newAvg;
        wrk.totalRatingsCount = count;
        await wrk.save();
      }
    } else {
      store.ratings.unshift(newRating);
      const wIdx = store.workers.findIndex(w => w._id === workerId || w.userId === workerId);
      if (wIdx !== -1) {
        const wrk = store.workers[wIdx];
        const previousCount = wrk.totalRatingsCount || 0;
        const count = previousCount + 1;
        const currentSum = (wrk.rating || 0) * previousCount;
        wrk.rating = parseFloat(((currentSum + validatedData.score) / count).toFixed(2));
        wrk.totalRatingsCount = count;
      }
    }

    return res.status(201).json({
      rating: isConnected ? await Rating.findOne({ bookingId: validatedData.bookingId }) : newRating,
      message: 'Rating and review submitted successfully'
    });
  } catch (error) {
    if (error.errors) return res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
    return res.status(500).json({ error: error.message });
  }
};
