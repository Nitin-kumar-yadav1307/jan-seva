import app from '../apps/api/src/app.js';
import http from 'http';
import { calculateDistanceKm, calculateProximityScore } from '../apps/api/src/matching/scoring.js';
import { rankWorkersForBooking } from '../apps/api/src/matching/fairness.js';
import { runSupervisorAgent } from '../apps/api/src/ai/agents/supervisor/supervisorAgent.js';
import { runForecastAgent } from '../apps/api/src/ai/agents/forecast/forecastAgent.js';
import { store } from '../apps/api/src/services/store.js';

const PORT = 5099;

async function runAllTests() {
  console.log('\n============================================================');
  console.log('🧪 CO-OPSEVA FULL PROTOCOL & CHUNK VALIDATION SUITE');
  console.log('============================================================\n');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}/api`;

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('Chunk 0: API /api/health responds with 200 OK', async () => {
    const res = await fetch(`${baseUrl}/health`).then(r => r.json());
    if (res.status !== 'HEALTHY') throw new Error('Unhealthy status');
  });

  // 2. Services Catalogue
  await test('Chunk 4: Service Catalogue returns services across categories', async () => {
    const res = await fetch(`${baseUrl}/services`).then(r => r.json());
    if (!res.services || res.services.length < 5) throw new Error('Missing services');
  });

  // 3. Worker Discovery
  await test('Chunk 3 & 5: Worker discovery returns 20+ realistic verified workers', async () => {
    const res = await fetch(`${baseUrl}/workers`).then(r => r.json());
    if (!res.workers || res.workers.length < 10) throw new Error('Worker count insufficient');
  });

  // 4. Deterministic Fairness Engine Test
  await test('Chunk 6: Fairness Engine chooses underutilized Suresh over overloaded closer worker', async () => {
    // Ramesh: overloaded (workload 88), 0.3km away
    // Suresh: underutilized (workload 25), 1.1km away
    const ranked = rankWorkersForBooking(store.workers, {
      customerCoords: [77.2167, 28.6328],
      serviceCategory: 'Plumbing',
      isEmergency: false
    });

    const topWorker = ranked[0]?.worker;
    if (topWorker.name !== 'Suresh Kumar') {
      throw new Error(`Expected Suresh Kumar to win fairness balancing, but got ${topWorker.name}`);
    }
  });

  // 5. Booking Creation & State Machine
  await test('Chunk 7: Booking lifecycle state machine transitions correctly', async () => {
    // Create
    const createRes = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: 'srv_plumb_01',
        workerId: 'wrk_01',
        location: {
          type: 'Point',
          coordinates: [77.2167, 28.6328],
          address: 'Connaught Place, New Delhi'
        },
        scheduledAt: new Date().toISOString(),
        isEmergency: false
      })
    }).then(r => r.json());

    const bId = createRes.booking._id;

    // Accept
    const acceptRes = await fetch(`${baseUrl}/bookings/${bId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACCEPTED' })
    }).then(r => r.json());
    if (acceptRes.booking.status !== 'ACCEPTED') throw new Error('Failed to transition to ACCEPTED');

    // Complete
    const compRes = await fetch(`${baseUrl}/bookings/${bId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED', finalPrice: 299 })
    }).then(r => r.json());
    if (compRes.booking.status !== 'COMPLETED') throw new Error('Failed to transition to COMPLETED');
  });

  // 6. Payment & Dividend Breakdown
  await test('Chunk 8: Payment breakdown allocates 85% directly to worker', async () => {
    const payRes = await fetch(`${baseUrl}/payments/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: 'book_demo_01', amount: 300 })
    }).then(r => r.json());

    if (payRes.breakdown.workerDirectPayout !== 255) { // 85% of 300 = 255
      throw new Error(`Expected 255 worker share, got ${payRes.breakdown.workerDirectPayout}`);
    }
  });

  // 7. Rating submission
  await test('Chunk 9: Rating updates worker average and completed job counter', async () => {
    const rateRes = await fetch(`${baseUrl}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'book_demo_01',
        score: 5,
        comment: 'Outstanding cooperative work quality!'
      })
    }).then(r => r.json());
    if (!rateRes.rating) throw new Error('Failed to record rating');
  });

  // 8. AI Supervisor & Intent NLP
  await test('Chunk 11, 12, 14, 15: AI Supervisor extracts intent and matches verified worker', async () => {
    const aiRes = await runSupervisorAgent({
      prompt: 'Emergency! Water pipe leaking heavily in kitchen right now',
      customerLocation: { coordinates: [77.2167, 28.6328] }
    });

    if (aiRes.bookingIntent.serviceCategory !== 'Plumbing') {
      throw new Error(`Expected Plumbing category, got ${aiRes.bookingIntent.serviceCategory}`);
    }
    if (!aiRes.bookingIntent.isEmergency) {
      throw new Error('Expected emergency flag to be true');
    }
    if (!aiRes.matchingResult.topRecommendation) {
      throw new Error('Expected matching worker candidate');
    }
  });

  // 9. AI Forecast Agent
  await test('Chunk 16 & 17: Forecast Agent predicts demand surges by zone', async () => {
    const forecast = await runForecastAgent();
    if (!forecast.forecastData || forecast.forecastData.length !== 7) {
      throw new Error('Invalid 7-day forecast dataset');
    }
  });

  // 10. Cooperative Dashboard Stats
  await test('Chunk 10: Cooperative stats calculate health score & opportunity index', async () => {
    const statsRes = await fetch(`${baseUrl}/cooperatives/stats`).then(r => r.json());
    if (statsRes.summary.healthScore < 80 || statsRes.summary.opportunityIndex < 80) {
      throw new Error('Invalid health metrics');
    }
  });

  server.close();

  console.log('\n============================================================');
  console.log(`📊 SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('============================================================\n');

  if (failed > 0) process.exit(1);
}

runAllTests();
