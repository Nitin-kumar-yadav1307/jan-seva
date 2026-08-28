# Co-opSeva — API Reference

Base URL (dev): `http://localhost:5000/api`

All endpoints return JSON. Errors follow `{ "error": "message" }` format.

---

## Health

### GET /health
Returns server and AI status.

```json
{
  "status": "HEALTHY",
  "service": "Co-opSeva Backend API & Agentic AI Layer",
  "database": { "isConnected": false, "mode": "in-memory-fallback" },
  "aiMode": "api",
  "version": "1.0.0"
}
```

---

## Authentication

### POST /auth/register
```json
{ "name": "Suresh Kumar", "email": "suresh@example.com", "password": "pass123", "role": "WORKER" }
```

### POST /auth/login
```json
{ "email": "suresh@example.com", "password": "pass123" }
```
Returns `{ "token": "...", "user": {...} }`

### GET /auth/me
Header: `Authorization: Bearer <token>`

---

## Workers

### GET /workers
Query params: `category`, `verificationStatus`, `zone`, `available`

### GET /workers/:id
Returns full worker profile with skills, certifications, location.

### PUT /workers/:id
Auth required. Update worker profile.

### POST /workers/:id/verify
Admin only. Body: `{ "status": "VERIFIED" | "REJECTED", "reason": "..." }`

---

## Services

### GET /services
Returns all 9 service categories with pricing.

### GET /services/:id
Full service details including emergency pricing.

---

## Matching

### POST /matching/find
```json
{
  "serviceCategory": "Plumbing",
  "customerCoords": [77.2167, 28.6328],
  "isEmergency": false
}
```
Returns ranked worker candidates with fairness scores.

---

## Bookings

### POST /bookings
```json
{
  "workerId": "wrk_01",
  "serviceId": "srv_plumb_01",
  "location": { "type": "Point", "coordinates": [77.2167, 28.6328] },
  "estimatedPrice": 299,
  "isEmergency": false
}
```

### GET /bookings
Returns all bookings (filtered by user role in production).

### GET /bookings/:id
Full booking with worker, service, cooperative details.

### PUT /bookings/:id/status
Body: `{ "status": "ACCEPTED" | "ON_THE_WAY" | "STARTED" | "COMPLETED" | "CANCELLED" }`

---

## Payments

### POST /payments/order
```json
{ "bookingId": "book_xxx", "amount": 299 }
```
Returns Razorpay order with payment breakdown.

### POST /payments/verify
```json
{ "bookingId": "...", "razorpayOrderId": "...", "razorpayPaymentId": "..." }
```

---

## Ratings

### POST /ratings
```json
{ "bookingId": "...", "workerId": "wrk_01", "score": 5, "comment": "Excellent work!" }
```

---

## Cooperatives

### GET /cooperatives/stats
Returns stats for all cooperatives including health score, opportunity index.

---

## AI Endpoints

### POST /ai/booking-intent
```json
{ "prompt": "Mere kitchen ka pipe leak ho gaya", "language": "hi" }
```
Returns structured intent with service category, urgency, schedule.

### POST /ai/match
```json
{ "serviceCategory": "Plumbing", "customerCoords": [77.2167, 28.6328], "isEmergency": true }
```
Returns ranked workers with fairness scores + explainability.

### POST /ai/supervisor
```json
{ "prompt": "Emergency electrician chahiye abhi", "language": "hi" }
```
Full orchestration: Booking Agent → Matching Agent → AI Log.

### GET /ai/demand-forecast
Query: `?zone=Zone+A+-+Central+Delhi`
Returns 7-day demand forecast by category.

### GET /ai/workforce-recommendation
Returns workforce rebalancing recommendations per zone.

### GET /ai/welfare-alerts
Returns welfare status for all workers (OVERWORKED, UNDERUTILIZED, OPTIMAL).

### GET /ai/actions
Returns last 30 AI action logs.

### POST /ai/test
Test endpoint. Input: `{ "prompt": "Need a plumber tomorrow morning." }`
