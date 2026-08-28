import { store } from '../services/store.js';
import Worker from '../models/Worker.js';
import { getDbStatus } from '../config/db.js';
import { VERIFICATION_STATUS } from '@coopseva/shared';

export const getEligibleWorkers = async ({
  serviceCategory = 'Plumbing',
  customerCoords = [77.2167, 28.6328],
  maxRadiusKm = 25
} = {}) => {
  const { isConnected } = getDbStatus();
  const normalizedCategory = serviceCategory.trim();
  let workers;

  if (isConnected) {
    workers = await Worker.find({
      availability: true,
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      'skills.category': new RegExp(`^${normalizedCategory}$`, 'i')
    }).populate('userId', 'name email phone language').populate('cooperativeId');
  } else {
    workers = store.workers.filter(worker => (
      worker.availability &&
      worker.verificationStatus === VERIFICATION_STATUS.VERIFIED &&
      worker.skills?.some(skill => skill.category.toLowerCase() === normalizedCategory.toLowerCase())
    ));
  }

  return workers.filter(worker => {
    const [customerLon, customerLat] = customerCoords;
    const [workerLon, workerLat] = worker.currentLocation?.coordinates || [];
    if (![customerLon, customerLat, workerLon, workerLat].every(Number.isFinite)) return false;

    const toRadians = value => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const latitudeDelta = toRadians(workerLat - customerLat);
    const longitudeDelta = toRadians(workerLon - customerLon);
    const haversine = Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(toRadians(customerLat)) * Math.cos(toRadians(workerLat)) * Math.sin(longitudeDelta / 2) ** 2;
    const distanceKm = earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    return distanceKm <= maxRadiusKm;
  });
};
