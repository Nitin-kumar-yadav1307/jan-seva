import Booking from '../../../models/Booking.js';
import Service from '../../../models/Service.js';
import { getDbStatus } from '../../../config/db.js';
import { store } from '../../../services/store.js';

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getHistoricalBookings = async () => {
  const { isConnected } = getDbStatus();
  if (isConnected) return Booking.find({ status: { $ne: 'CANCELLED' } }).select('serviceId scheduledAt location').lean();
  return store.bookings.filter(booking => booking.status !== 'CANCELLED');
};

export const runForecastAgent = async ({ timeHorizonDays = 7, zone } = {}) => {
  const bookings = await getHistoricalBookings();
  const { isConnected } = getDbStatus();
  const services = isConnected ? await Service.find({}).select('category').lean() : store.services;
  const now = new Date();
  const horizon = Math.max(1, Math.min(14, timeHorizonDays));
  const historicalCounts = new Map();

  bookings.forEach(booking => {
    const scheduledAt = new Date(booking.scheduledAt || booking.createdAt);
    if (zone && booking.location?.zone && booking.location.zone !== zone) return;
    const serviceId = booking.serviceId?._id?.toString() || booking.serviceId?.toString();
    const service = services.find(item => item._id?.toString() === serviceId);
    const category = service?.category || 'Unknown';
    const key = `${scheduledAt.getDay()}:${category}`;
    historicalCounts.set(key, (historicalCounts.get(key) || 0) + 1);
  });

  const forecastData = Array.from({ length: horizon }, (_, offset) => {
    const date = new Date(now);
    date.setDate(now.getDate() + offset + 1);
    const dayIndex = date.getDay();
    const row = { day: DAY_NAMES[dayIndex], date: date.toISOString().slice(0, 10) };
    let total = 0;
    CATEGORIES.forEach(category => {
      const historical = historicalCounts.get(`${dayIndex}:${category}`) || 0;
      const forecast = historical ? Math.max(1, Math.round(historical * 1.1)) : 0;
      row[category.toLowerCase()] = forecast;
      total += forecast;
    });
    row.total = total;
    return row;
  });

  const expectedWeeklyVolume = forecastData.reduce((sum, day) => sum + day.total, 0);
  const peakDay = forecastData.reduce((peak, day) => day.total > peak.total ? day : peak, forecastData[0]);
  const categoryTotals = CATEGORIES.map(category => ({
    category,
    total: forecastData.reduce((sum, day) => sum + day[category.toLowerCase()], 0)
  })).sort((a, b) => b.total - a.total);

  return {
    forecastData,
    zoneShortages: [],
    summary: {
      expectedWeeklyVolume,
      peakDay: peakDay?.day || null,
      fastestGrowingCategory: categoryTotals[0]?.category || null,
      source: bookings.length ? 'booking-history' : 'no-historical-data',
      confidence: bookings.length ? 0.7 : 0
    }
  };
};
