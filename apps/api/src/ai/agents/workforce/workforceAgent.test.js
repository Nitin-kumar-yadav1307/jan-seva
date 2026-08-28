import test from 'node:test';
import assert from 'node:assert/strict';

import {
  runWorkforceAgent,
  updateWorkforceRecommendationStatus
} from './workforceAgent.js';

test('runWorkforceAgent returns pending approval recommendations', async () => {
  const result = await runWorkforceAgent();
  assert.ok(Array.isArray(result.recommendations));
  assert.ok(result.recommendations.length > 0);
  assert.equal(result.recommendations[0].status, 'PENDING_APPROVAL');
});

test('updateWorkforceRecommendationStatus persists approval state changes', async () => {
  const initial = await runWorkforceAgent();
  const id = initial.recommendations[0].id;

  const updated = await updateWorkforceRecommendationStatus(id, { status: 'APPROVED', reviewedBy: 'admin-1' });
  assert.equal(updated.status, 'APPROVED');
  assert.equal(updated.reviewedBy, 'admin-1');

  const refreshed = await runWorkforceAgent();
  const recomm = refreshed.recommendations.find(item => item.id === id);
  assert.equal(recomm.status, 'APPROVED');
});
