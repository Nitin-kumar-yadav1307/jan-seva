# Co-opSeva — SIH Agentic AI Prototype Plan

## 0. Product Goal

Build a **demoable, end-to-end cooperative service marketplace** using a MERN monorepo with an agentic AI layer.

Core demo:

```text
Customer request
  → Booking Agent
  → Supervisor
  → Matching Agent
  → Geo + Skill + Availability + Fairness tools
  → Worker recommendation
  → Customer confirmation
  → Booking
  → Worker acceptance
  → Sandbox payment
  → Service completion
  → Rating
  → Cooperative dashboard
  → Forecast + Workforce Agent
```

### Primary differentiator

Co-opSeva does not optimize only for "nearest worker".

It optimizes:

- service quality
- distance
- skill match
- availability
- customer experience
- equitable distribution of cooperative work
- worker workload/welfare

AI should **recommend and reason**, while deterministic backend rules remain the source of truth.

---

# 1. MVP Scope

## P0 — Must work

- [ ] Customer authentication
- [ ] Worker authentication
- [ ] Admin/federation authentication
- [ ] Worker profile
- [ ] Worker skills/certifications
- [ ] Cooperative verification
- [ ] Service catalogue
- [ ] Customer booking
- [ ] Geo-based worker discovery
- [ ] Fairness-aware worker matching
- [ ] Worker accept/reject
- [ ] Booking lifecycle
- [ ] Sandbox payment
- [ ] Invoice
- [ ] Rating/feedback
- [ ] Cooperative dashboard
- [ ] AI natural-language booking
- [ ] AI demand forecasting
- [ ] AI workforce allocation recommendation
- [ ] AI action/explanation log
- [ ] English + Hindi + one additional Indian language

## P1 — Strong additions

- [ ] Emergency booking mode
- [ ] Worker welfare dashboard
- [ ] Opportunity/fairness score
- [ ] Real-time booking updates
- [ ] Admin approval workflow for AI recommendations

## P2 — Future/optional

- [ ] Real insurance API
- [ ] SMS/WhatsApp notifications
- [ ] Advanced ML forecasting
- [ ] Native mobile application
- [ ] Automated KYC
- [ ] Multi-federation federation management

---

# 2. Monorepo Structure

Use **one repository** for the entire project.

```text
coopseva/
│
├── apps/
│   ├── web/                         # React customer/worker/admin app
│   │   ├── public/
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── features/
│   │       │   ├── auth/
│   │       │   ├── customer/
│   │       │   ├── worker/
│   │       │   ├── admin/
│   │       │   ├── booking/
│   │       │   ├── services/
│   │       │   ├── payments/
│   │       │   └── ai/
│   │       ├── hooks/
│   │       ├── layouts/
│   │       ├── lib/
│   │       ├── locales/
│   │       ├── routes/
│   │       ├── services/
│   │       └── main.jsx
│   │
│   └── api/                         # Node + Express API
│       └── src/
│           ├── config/
│           ├── controllers/
│           ├── middleware/
│           ├── models/
│           ├── routes/
│           ├── services/
│           ├── validators/
│           ├── utils/
│           ├── ai/
│           │   ├── agents/
│           │   │   ├── supervisor/
│           │   │   ├── booking/
│           │   │   ├── matching/
│           │   │   ├── forecast/
│           │   │   ├── workforce/
│           │   │   └── welfare/
│           │   ├── tools/
│           │   │   ├── workerTools.js
│           │   │   ├── bookingTools.js
│           │   │   ├── geoTools.js
│           │   │   ├── analyticsTools.js
│           │   │   ├── paymentTools.js
│           │   │   └── cooperativeTools.js
│           │   ├── prompts/
│           │   ├── schemas/
│           │   ├── memory/
│           │   ├── guardrails/
│           │   ├── aiClient.js
│           │   └── agentRuntime.js
│           ├── matching/
│           │   ├── scoring.js
│           │   └── fairness.js
│           ├── app.js
│           └── server.js
│
├── packages/
│   ├── shared/                      # Shared JS constants/types/schemas
│   ├── ui/                          # Shared React UI components
│   ├── config/                      # Shared config
│   └── validation/                  # Shared Zod schemas
│
├── scripts/
│   ├── seed.js
│   ├── reset-db.js
│   └── demo-reset.js
│
├── data/
│   ├── seed/
│   └── sample/
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── ai-agents.md
│   ├── demo-script.md
│   └── judge-questions.md
│
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── README.md
└── plan.md
```

### Important rule

Do not create separate repositories for frontend, backend, and AI.

The monorepo should make it easy to:

```text
git clone
pnpm install
pnpm dev
```

---

# 3. Technology Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Frontend | React + Vite |
| UI | Tailwind CSS |
| Data fetching | TanStack Query |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Validation | Zod |
| Authentication | JWT + bcrypt |
| AI | LLM API with tool/function calling |
| Maps | Mapbox or Google Maps |
| Payments | Razorpay Test Mode |
| Charts | Recharts |
| Realtime | Socket.IO, optional |
| i18n | i18next |
| Deployment | Vercel + backend cloud host |
| Version control | Git/GitHub |

Do not add another major framework unless it solves a demonstrated problem.

---

# 4. Environment Variables

Create `.env.example` at the monorepo root.

```env
# -------------------------
# API
# -------------------------
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# -------------------------
# Database
# -------------------------
MONGODB_URI=

# -------------------------
# Authentication
# -------------------------
JWT_SECRET=
JWT_EXPIRES_IN=7d

# -------------------------
# AI
# -------------------------
AI_API_KEY=
AI_MODEL=

# -------------------------
# Maps
# -------------------------
MAP_PROVIDER=mapbox
MAP_API_KEY=

# -------------------------
# Payments
# -------------------------
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# -------------------------
# Realtime - optional
# -------------------------
SOCKET_ORIGIN=http://localhost:5173

# -------------------------
# AI/demo controls
# -------------------------
AI_MODE=api
MAP_MODE=live
PAYMENT_MODE=test
```

Never commit actual credentials.

`.gitignore` must contain:

```text
.env
.env.*
!.env.example
```

---

# 5. External Services

## Required

### MongoDB Atlas

Need:

```text
MONGODB_URI
```

Format:

```text
mongodb+srv://<username>:<password>@<cluster>/<database>
```

Use a dedicated database for the project.

### AI provider

Need:

```text
AI_API_KEY
AI_MODEL
```

The exact SDK/model can be selected during the AI foundation chunk.

The AI integration must support:

- structured output
- tool/function calling
- low-temperature deterministic tasks where appropriate
- error handling
- timeout handling

### Maps

Choose **one**:

- Mapbox
- Google Maps Platform

Do not implement both initially.

Need:

```text
MAP_API_KEY
```

### Payments

Use Razorpay **test mode**.

Need:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Real money must never be required for the SIH demo.

---

# 6. MongoDB Models

## User

```text
User
- name
- email
- phone
- passwordHash
- role
- language
- location
- createdAt
```

Roles:

```text
CUSTOMER
WORKER
ADMIN
FEDERATION_ADMIN
```

## Cooperative

```text
Cooperative
- name
- federationId
- serviceAreas
- contact
- status
- createdAt
```

## Worker

```text
Worker
- userId
- cooperativeId
- skills[]
- certifications[]
- experience
- hourlyRate
- rating
- completedJobs
- verificationStatus
- availability
- currentLocation
- workloadScore
- welfareScore
- opportunityScore
```

## Service

```text
Service
- name
- category
- description
- basePrice
- emergencyPrice
- estimatedDuration
```

## Booking

```text
Booking
- customerId
- workerId
- cooperativeId
- serviceId
- location
- scheduledAt
- status
- estimatedPrice
- paymentStatus
- startedAt
- completedAt
- ratingId
- createdAt
```

Statuses:

```text
REQUESTED
MATCHING
ASSIGNED
ACCEPTED
ON_THE_WAY
STARTED
COMPLETED
CANCELLED
```

## Payment

```text
Payment
- bookingId
- provider
- providerOrderId
- providerPaymentId
- amount
- status
- createdAt
```

## Rating

```text
Rating
- bookingId
- customerId
- workerId
- score
- comment
- createdAt
```

## AIActionLog

```text
AIActionLog
- agent
- task
- inputSummary
- toolsUsed[]
- recommendation
- confidence
- status
- approvedBy
- createdAt
```

---

# 7. Core API

## Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Workers

```text
GET  /api/workers
GET  /api/workers/:id
POST /api/workers/profile
PUT  /api/workers/:id
POST /api/workers/:id/verify
```

## Services

```text
GET /api/services
GET /api/services/:id
```

## Matching

```text
POST /api/matching/find
```

## Booking

```text
POST /api/bookings
GET  /api/bookings
GET  /api/bookings/:id
PUT  /api/bookings/:id/accept
PUT  /api/bookings/:id/start
PUT  /api/bookings/:id/complete
PUT  /api/bookings/:id/cancel
```

## Payments

```text
POST /api/payments/order
POST /api/payments/verify
POST /api/payments/webhook
```

## Ratings

```text
POST /api/ratings
```

## AI

```text
POST /api/ai/booking-intent
POST /api/ai/match
GET  /api/ai/demand-forecast
GET  /api/ai/workforce-recommendation
GET  /api/ai/actions
```

---

# 8. Agent Architecture

```text
                    SUPERVISOR AGENT
                           |
        +------------------+------------------+
        |                  |                  |
        v                  v                  v
 BOOKING AGENT       MATCHING AGENT     FORECAST AGENT
        |                  |                  |
        |                  v                  v
        |            WORKFORCE AGENT     demand history
        |                  |
        |                  v
        |            WELFARE AGENT
        |
        v
 Structured Intent
```

## Agent 1 — Booking Agent

Responsibilities:

- Understand natural language
- Extract service
- Extract issue
- Extract date/time
- Detect urgency
- Ask for missing information
- Return strict structured JSON

Example:

```json
{
  "service": "plumbing",
  "problem": "kitchen pipe leakage",
  "urgency": "normal",
  "date": "2026-08-29",
  "timeWindow": "morning"
}
```

It should not directly perform payment or irreversible operations.

---

# 9. Tool Layer

Agents must interact with real backend tools.

Required tools:

```text
findNearbyWorkers()
getWorkerProfile()
getWorkerSkills()
getWorkerAvailability()
getWorkerWorkload()
getWorkerRatings()
calculateDistance()
calculateFairnessScore()
createBookingDraft()
getDemandHistory()
getCooperativeStats()
getWorkerWelfare()
```

Tools should call normal backend services/database logic.

The LLM should never directly access MongoDB credentials.

---

# 10. Matching Agent

Input:

```text
service
location
time
urgency
```

Tool flow:

```text
findNearbyWorkers
       ↓
filter skill
       ↓
get availability
       ↓
get workload
       ↓
get rating
       ↓
calculate distance
       ↓
calculate fairness
       ↓
rank candidates
```

Output:

```json
{
  "recommendedWorkerId": "...",
  "alternatives": ["...", "..."],
  "reason": "...",
  "score": 91
}
```

---

# 11. Fair Matching Algorithm

Do not leave fairness entirely to the LLM.

Use deterministic scoring.

Initial formula:

```text
Match Score =

30% Skill Match
25% Distance
20% Availability
10% Rating
10% Workload Balance
 5% Welfare/Fairness
```

Normalize each component to 0–100.

Example:

```javascript
score =
  skill * 0.30 +
  distance * 0.25 +
  availability * 0.20 +
  rating * 0.10 +
  workload * 0.10 +
  welfare * 0.05;
```

The AI can explain the result, but the backend computes the score.

---

# 12. Agent 3 — Forecast Agent

Input:

```text
Historical bookings
Service category
Location/zone
Date
Time
Emergency volume
```

Output:

```json
{
  "forecast": [
    {
      "service": "plumbing",
      "zone": "A",
      "expectedDemand": 27,
      "confidence": 0.84
    }
  ]
}
```

The agent should identify:

- demand spikes
- service shortages
- low-demand areas
- likely worker capacity problems

---

# 13. Agent 4 — Workforce Agent

Input:

```text
Demand forecast
Available workers
Worker skills
Service zones
Current workload
```

Output:

```json
{
  "recommendations": [
    {
      "zone": "A",
      "service": "plumbing",
      "workers": 4,
      "reason": "High forecasted demand"
    }
  ]
}
```

Workflow:

```text
AI recommendation
      ↓
Rule validation
      ↓
Admin approval
      ↓
Database update
```

AI must not silently reassign workers.

---

# 14. Agent 5 — Welfare Agent

Monitor:

```text
jobs
hours
earnings
travel
ratings
cancellations
workload
```

Detect:

```text
OVERWORKED
UNDERUTILIZED
LOW_ASSIGNMENT
HIGH_TRAVEL
```

Example:

```text
Ramesh
31 jobs
124 hours
HIGH workload

Recommendation:
Reduce new assignments where possible.
```

---

# 15. Supervisor Agent

Responsibilities:

- Identify task type
- Route to specialist agent
- Maintain task state
- Combine results
- Enforce permissions
- Log agent actions

Example:

```text
User:
"Emergency electrician chahiye."

Supervisor
 → Booking Agent
 → Emergency detected
 → Matching Agent
 → Geo tools
 → Worker tools
 → Fairness/response-time rules
 → Recommendation
```

---

# 16. Agent Safety Rules

AI can:

```text
✓ Search workers
✓ Analyze demand
✓ Recommend workers
✓ Explain recommendations
✓ Create booking drafts
✓ Generate forecasts
✓ Recommend workforce allocation
```

AI cannot autonomously:

```text
✗ Transfer money
✗ Delete users
✗ Approve worker verification
✗ Modify payment records
✗ Permanently alter worker status
✗ Cancel someone else's booking
```

Sensitive operations require:

```text
AI
 ↓
Permission check
 ↓
Human confirmation
 ↓
Backend transaction
```

---

# 17. Explainability

Every AI recommendation should expose:

```text
Why this worker?
```

Example:

```text
Suresh Kumar — Match 91/100

✓ Required skill
✓ Verified cooperative worker
✓ 1.7 km away
✓ Available
✓ 4.7 rating
✓ Lower current workload
✓ Improves work distribution
```

Also show:

```text
AI Agent Activity

09:42 Booking Agent
Parsed customer request

09:42 Matching Agent
Found 7 eligible workers

09:42 Fairness Engine
Excluded 2 overloaded workers

09:43 Matching Agent
Recommended Suresh Kumar
```

---

# 18. Development Plan — Work Only One Chunk at a Time

## CHUNK 0 — Monorepo Foundation

Goal:

```text
pnpm install
pnpm dev
```

Build:

- [ ] Root package.json
- [ ] pnpm workspace
- [ ] apps/web
- [ ] apps/api
- [ ] packages/shared
- [ ] packages/validation
- [ ] .env.example
- [ ] Git configuration
- [ ] `/api/health`

Definition of done:

```text
React runs
Express runs
/api/health returns 200
```

Git commit:

```text
feat: initialize monorepo
```

---

# CHUNK 1 — MongoDB + Models

Build:

- [ ] MongoDB connection
- [ ] Mongoose configuration
- [ ] User
- [ ] Worker
- [ ] Cooperative
- [ ] Service
- [ ] Booking
- [ ] Payment
- [ ] Rating
- [ ] AIActionLog

Then create seed script.

Definition of done:

```text
pnpm seed
```

creates realistic demo data.

---

# CHUNK 2 — Authentication

Build:

- [ ] Register
- [ ] Login
- [ ] JWT
- [ ] Password hashing
- [ ] Auth middleware
- [ ] Role middleware
- [ ] Protected routes

Test:

```text
Customer
Worker
Admin
```

---

# CHUNK 3 — Worker Management

Build:

- [ ] Worker profile
- [ ] Skills
- [ ] Certifications
- [ ] Availability
- [ ] Cooperative association
- [ ] Verification workflow

Admin:

```text
VERIFY
REJECT
```

---

# CHUNK 4 — Service Catalogue

Build:

- [ ] Service list
- [ ] Service details
- [ ] Pricing
- [ ] Duration
- [ ] Emergency pricing

Seed:

```text
Plumbing
Electrical
Carpentry
Painting
Cleaning
Gardening
Driver
Caregiving
Appliance Repair
```

---

# CHUNK 5 — Geo Matching

Build:

- [ ] GeoJSON worker location
- [ ] MongoDB 2dsphere index
- [ ] Nearby worker query
- [ ] Radius filtering
- [ ] Distance calculation
- [ ] Map display

Definition of done:

Customer location → real database query → nearby workers.

---

# CHUNK 6 — Fairness Engine

Build deterministic scoring.

Inputs:

```text
skill
distance
availability
rating
workload
welfare
```

Return:

```text
matchScore
```

Test with at least 20 workers.

Important demo test:

```text
Nearest worker = overloaded
Second worker = slightly farther + underutilized
```

The algorithm should select the better balanced candidate when both are qualified.

---

# CHUNK 7 — Booking Engine

Implement:

```text
REQUESTED
 → MATCHING
 → ASSIGNED
 → ACCEPTED
 → ON_THE_WAY
 → STARTED
 → COMPLETED
```

Every state change must be persisted.

Worker can:

```text
Accept
Reject
Start
Complete
```

Customer can:

```text
View status
```

---

# CHUNK 8 — Payment + Invoice

Build:

```text
Create order
 → Test payment
 → Verify payment
 → Mark booking paid
 → Generate invoice
```

Never store raw card information.

---

# CHUNK 9 — Rating

Build:

- [ ] Star rating
- [ ] Comment
- [ ] Average worker rating update
- [ ] Completed-job count

---

# CHUNK 10 — Cooperative Dashboard

Show:

```text
Total workers
Total bookings
Revenue/value
Average rating
Service demand
Worker utilization
Zone distribution
```

Add:

```text
Worker Opportunity Index
Cooperative Health Score
```

---

# CHUNK 11 — AI Foundation

Before agents, build:

```text
aiClient.js
agentRuntime.js
structured output
tool schema system
error handling
timeouts
logging
AI_MODE
```

Test:

```text
POST /api/ai/test
```

Input:

```text
Need a plumber tomorrow morning.
```

Output must be valid structured JSON.

---

# CHUNK 12 — Booking Agent

Build:

```text
Customer text
 ↓
Booking Agent
 ↓
Structured intent
 ↓
Booking UI
```

Support Hindi/English initially.

Do not let the agent create final bookings automatically.

---

# CHUNK 13 — Tool Calling

Connect:

```text
findNearbyWorkers
getWorkerSkills
getWorkerAvailability
getWorkerWorkload
getWorkerRatings
calculateDistance
```

Test that the agent actually calls tools rather than hallucinating data.

---

# CHUNK 14 — Matching Agent

Build:

```text
Intent
 ↓
Matching Agent
 ↓
Tools
 ↓
Candidate workers
 ↓
Deterministic fairness engine
 ↓
Recommendation
```

Add explainability.

---

# CHUNK 15 — Supervisor Agent

Build:

```text
User request
 ↓
Supervisor
 ↓
Booking Agent
 ↓
Matching Agent
 ↓
Result
```

Add task state and AIActionLog.

---

# CHUNK 16 — Forecast Agent

Build:

```text
Historical booking data
 ↓
Forecast Agent
 ↓
Demand forecast
 ↓
Zone/service shortage detection
```

Dashboard example:

```text
Tomorrow

Plumbing     27
Electrical   19
Cleaning     15
Carpentry    10
```

---

# CHUNK 17 — Workforce Agent

Build:

```text
Demand
 +
Worker capacity
 +
Skills
 +
Workload
 +
Zones
 ↓
Recommended allocation
```

Admin sees:

```text
Zone A
+4 plumbers
+1 technician
```

Admin must approve.

---

# CHUNK 18 — Welfare Agent

Build:

```text
Worker data
 ↓
Welfare Agent
 ↓
Workload/underutilization detection
 ↓
Recommendation
```

Do not let it automatically change assignments.

---

# CHUNK 19 — Emergency Agent Mode

Detect:

```text
emergency
urgent
danger
no electricity
water burst
```

Change matching priorities:

```text
Response time ↑
Distance ↑
Availability ↑
Verified skill = mandatory
```

Show:

```text
Nearest qualified verified worker
ETA
```

---

# CHUNK 20 — Multilingual

Add:

```text
English
Hindi
Marathi
```

Translate the critical journey first:

```text
Home
Services
Book
Worker
Payment
Tracking
Dashboard
```

For natural-language AI input, support Hindi/English examples.

---

# CHUNK 21 — Realtime

Only after everything else works.

Add Socket.IO for:

```text
Worker accepts
Worker starts job
Worker completes job
Booking cancellation
```

If time is short, skip realtime and use polling.

---

# CHUNK 22 — Demo Reliability

Build fallback modes:

```env
AI_MODE=demo
MAP_MODE=demo
PAYMENT_MODE=test
```

If an external API fails:

```text
AI API fails
 ↓
Deterministic demo response
```

The judges must never see an API error.

Add:

```text
scripts/demo-reset.js
```

It should reset the database to a known demo state.

---

# CHUNK 23 — Deployment

Deploy:

```text
React → Vercel
Express → cloud backend
MongoDB → Atlas
```

Verify:

- [ ] Production environment variables
- [ ] CORS
- [ ] MongoDB network access
- [ ] API URL
- [ ] Payment test mode
- [ ] AI key
- [ ] Map key
- [ ] Seed/demo data

---

# 19. Demo Scenario

Use one continuous story.

## Customer

Input:

```text
"Mere kitchen ka pipe leak ho gaya hai.
Kal subah plumber chahiye."
```

## Booking Agent

Extracts:

```text
Service: Plumbing
Issue: Kitchen pipe leakage
Date: Tomorrow
Time: Morning
Urgency: Normal
```

## Supervisor

Routes to Matching Agent.

## Matching Agent

Calls:

```text
findNearbyWorkers
getWorkerSkills
getWorkerAvailability
getWorkerWorkload
getWorkerRatings
calculateDistance
```

## Fairness Engine

Finds:

```text
Ramesh
1.1 km
4.9 rating
31 jobs this week

Suresh
1.7 km
4.7 rating
8 jobs this week
```

Recommends Suresh because he qualifies and has substantially lower workload.

## Customer

Confirms worker.

## Worker

Accepts job.

## Payment

Customer performs sandbox payment.

## Service

Worker:

```text
ON_THE_WAY
STARTED
COMPLETED
```

## Rating

Customer gives:

```text
5 stars
```

## Admin

Runs:

```text
AI Forecast
```

Output:

```text
High plumbing demand in Zone A.

Recommended:
+4 plumbers
+1 technician
```

Welfare Agent:

```text
Ramesh is currently overloaded.
Prefer Suresh/Imran for suitable new jobs.
```

This is the complete SIH story.

---

# 20. Key Innovation Features

## Innovation 1 — Fair Work Allocation

Not just nearest-worker matching.

```text
Customer need
+
Worker capability
+
Worker workload
=
Fair allocation
```

## Innovation 2 — Cooperative AI Supervisor

Multiple specialized agents collaborate.

## Innovation 3 — Demand → Workforce Planning

AI doesn't merely predict demand.

It converts:

```text
Forecast
 ↓
Capacity gap
 ↓
Allocation recommendation
```

## Innovation 4 — Explainable AI Matching

Every recommendation has a human-readable reason.

## Innovation 5 — Worker Opportunity Index

Identify skilled workers who are receiving fewer opportunities.

## Innovation 6 — Welfare-Aware Allocation

Avoid continuously assigning work to the same high-performing workers.

## Innovation 7 — Multilingual Natural-Language Booking

Customer can express service needs naturally in Indian languages.

---

# 21. Agent vs Normal Backend Responsibility

| Responsibility | Backend | Agent |
|---|---:|---:|
| Authentication | ✓ | |
| Payment verification | ✓ | |
| Database writes | ✓ | |
| Permission checks | ✓ | |
| Worker search | ✓ | Calls tool |
| Distance | ✓ | Uses result |
| Fairness score | ✓ | Explains |
| Natural language | | ✓ |
| Intent extraction | | ✓ |
| Demand reasoning | | ✓ |
| Workforce recommendation | | ✓ |
| Explanation | | ✓ |
| Final critical action | ✓ | Recommend |

This separation should be explained to judges.

---

# 22. Testing Strategy

Every chunk needs three levels of testing.

## Unit

Example:

```text
fairness scoring
distance calculation
booking state transition
```

## API

Test:

```text
POST /auth/login
POST /matching/find
POST /bookings
```

## End-to-end

Test the complete path:

```text
Customer
 → Booking
 → Match
 → Worker
 → Payment
 → Completion
 → Rating
```

Do not move to advanced agents until the core E2E flow works.

---

# 23. Definition of Done

A chunk is **not done** because code exists.

A chunk is done when:

```text
✓ Code runs
✓ API works
✓ Database works
✓ UI works
✓ Error case handled
✓ Demo data exists
✓ Manual test passed
✓ Git commit created
```

---

# 24. Git Strategy

Use small commits.

```text
feat: initialize monorepo
feat: add mongodb connection
feat: add user models
feat: add authentication
feat: add worker profiles
feat: add geo matching
feat: add fairness engine
feat: add booking lifecycle
feat: add test payment
feat: add ratings
feat: add cooperative dashboard
feat: add ai foundation
feat: add booking agent
feat: add matching agent
feat: add supervisor agent
feat: add forecast agent
feat: add workforce agent
feat: add welfare agent
feat: add multilingual support
feat: add demo mode
```

If something breaks, you can easily return to the last working chunk.

---

# 25. Final Architecture

```text
                         CO-OPSEVA
                             |
                ┌────────────┴────────────┐
                |                         |
             React                     Express
                |                         |
       Customer/Worker/Admin       Business Services
                                          |
                              ┌───────────┴───────────┐
                              |                       |
                           MongoDB               AI Runtime
                                                      |
                                      ┌───────────────┴───────────────┐
                                      |               |               |
                                  Supervisor      Tool Layer       Guardrails
                                      |
                       ┌──────────────┼──────────────┐
                       |              |              |
                   Booking       Matching       Forecast
                     Agent         Agent          Agent
                                      |              |
                                      |          Workforce
                                      |             Agent
                                      |
                                  Welfare
                                   Agent

External:
  MongoDB Atlas
  AI API
  Map provider
  Razorpay Test Mode
```

---

# 26. SIH Presentation Positioning

Do not present it as:

> "A website for booking labour."

Present it as:

> **"An AI-powered cooperative operating system that converts local service demand into fair, intelligent workforce allocation."**

The marketplace is the foundation.

The real innovation is:

```text
Demand
 ↓
AI understanding
 ↓
Geo intelligence
 ↓
Fair worker matching
 ↓
Cooperative booking
 ↓
Worker welfare
 ↓
Demand forecasting
 ↓
Proactive workforce allocation
```

---

# 27. Build Priority

If time becomes limited, prioritize exactly this:

```text
1. MERN foundation
2. MongoDB + seed data
3. Auth
4. Worker verification
5. Services
6. Geo matching
7. Fairness engine
8. Booking lifecycle
9. Payment
10. Rating
11. Cooperative dashboard
12. Booking Agent
13. Matching Agent
14. Supervisor
15. Forecast Agent
16. Workforce Agent
17. Welfare Agent
18. Multilingual
19. Emergency
20. Realtime
```

**Never sacrifice the working booking flow to add another AI feature.**

---

# 28. Immediate Next Step

Start only with:

## CHUNK 0 — Monorepo Foundation

Target result:

```text
coopseva/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── shared/
│   ├── ui/
│   ├── config/
│   └── validation/
├── scripts/
├── docs/
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── README.md
└── plan.md
```

And:

```text
pnpm install
pnpm dev
```

must start both applications.

Then:

```text
GET /api/health
```

must return:

```json
{
  "status": "ok",
  "service": "coopseva-api"
}
```

**Do not start agents, payment, maps, or dashboards until this foundation is working.**


---

# 29. UI/UX Design System — Visual Reference

## 29.1 Design Direction

Co-opSeva should adopt the same broad visual language:

- mobile-first service marketplace
- clean white/light background
- blue primary accent
- compact, rounded cards
- subtle borders and shadows
- icon-led category grid
- horizontal scrolling service rails
- large visual promotional/trust banners
- clear section headings
- generous whitespace
- compact service and worker cards
- strong visual hierarchy
- persistent mobile bottom navigation
- responsive desktop dashboard layouts

### Critical rule

**The design is fixed; the content is data-driven.**

Do not hardcode the reference image's text, inputs, services, prices, location, logo, banners, images, or business metadata. React components should receive content from API responses, MongoDB, configuration, localization files, and AI-generated structured data.

---

# 30. Reference Image → Co-opSeva UX Composition

Preserve the marketplace's visual composition pattern:

```text
Header
  ↓
Location + Search
  ↓
Category Grid
  ↓
Promotion / Trust Banner
  ↓
Popular Services
  ↓
Service Category Rail
  ↓
Trust / Safety Strip
  ↓
Large Visual Banner
  ↓
More Service Rails
  ↓
Join / Worker CTA
  ↓
Footer
  ↓
Mobile Bottom Navigation
```

Co-opSeva adapts this to:

```text
Marketplace
+
Cooperative trust
+
AI booking
+
Verified workers
+
Fair allocation
```

---

# 31. Visual Design Tokens

Create centralized Tailwind/theme tokens.

## Colors

Use a restrained palette:

```text
Primary: cooperative trust blue
Background: white / very-light neutral
Surface: white
Text: dark charcoal
Secondary text: medium gray
Muted text: light gray
Success: green
Warning: amber
Danger: red
Border: very light gray-blue
```

Do not scatter arbitrary colors across components.

## Shape

```text
Cards: 12–16px radius
Buttons: 10–12px radius
Search containers: 10–14px radius
Large banners: 12–16px radius
Avatars: circular
```

Use pills mainly for statuses, tags, verification and filters.

## Elevation

```text
Normal card: subtle border, almost no shadow
Interactive card: small shadow
Floating element: medium shadow
```

The application should feel light, not overly elevated.

---

# 32. Typography

Use one modern sans-serif family.

Hierarchy:

```text
Page title      → large / bold
Section heading → medium-large / semibold
Card title      → medium / semibold
Body            → small-medium / regular
Metadata        → small / muted
Price           → medium-large / bold
Status          → small / semibold
```

Keep typography compact because the marketplace contains many service items.

---

# 33. Global Layout

## Desktop

Use a centered content container around:

```text
1200–1280px max width
```

with responsive horizontal padding.

## Mobile

Use:

```text
100% width
16px horizontal padding
```

## Responsive behavior

```text
Mobile:
1-column layouts
horizontal service rails
bottom navigation

Tablet:
2–3 columns where appropriate

Desktop:
2–4 column grids
dashboard sidebars
larger content container
```

Mobile is the primary visual reference.

---

# 34. Reusable Component System

Create these before building every page independently:

```text
components/
├── layout/
│   ├── AppHeader
│   ├── DesktopHeader
│   ├── MobileHeader
│   ├── BottomNavigation
│   ├── PageContainer
│   └── SectionContainer
│
├── navigation/
│   ├── SearchBar
│   ├── LocationSelector
│   ├── BackButton
│   └── Breadcrumbs
│
├── cards/
│   ├── ServiceCard
│   ├── WorkerCard
│   ├── BookingCard
│   ├── CategoryCard
│   ├── PromotionCard
│   ├── StatCard
│   └── CertificationCard
│
├── status/
│   ├── StatusBadge
│   ├── VerificationBadge
│   ├── RatingDisplay
│   ├── AvailabilityBadge
│   └── WorkloadIndicator
│
├── ai/
│   ├── AICommandBar
│   ├── AIRecommendationCard
│   ├── AgentActivityTimeline
│   ├── ExplainabilityPanel
│   ├── ForecastCard
│   └── AllocationRecommendation
│
├── booking/
│   ├── BookingTimeline
│   ├── WorkerSummary
│   ├── PriceBreakdown
│   └── BookingStatus
│
└── feedback/
    ├── EmptyState
    ├── ErrorState
    ├── LoadingSkeleton
    ├── SuccessState
    └── ConfirmationDialog
```

All pages should reuse these primitives.

---

# 35. Home Page

The home page should visually follow the marketplace composition.

```text
Header
↓
Location + Search
↓
AI Service Request
↓
Service Categories
↓
Promotion / Trust Banner
↓
Popular Services
↓
Category Service Rails
↓
Cooperative Trust Section
↓
More Service Rails
↓
Become a Cooperative Worker CTA
↓
Footer
```

## Header

Mobile:

```text
[Logo]                         [Notification/Profile]
```

Desktop:

```text
[Logo]  Services  Bookings  Cooperatives  How it works  [Profile]
```

Keep it compact.

## Location/Search

Use a compact rounded search/location surface similar in visual density to the reference.

It can support:

```text
current location
saved location
manual location
```

The actual options are data-driven.

## AI request

Add an AI-capable search surface without turning the entire homepage into a chat application.

Visual concept:

```text
┌────────────────────────────────────┐
│ ✨ Describe what you need...       │
│                            [Search]│
└────────────────────────────────────┘
```

The actual placeholder and language come from localization.

---

# 36. Category Grid

The compact icon grid should become a reusable `CategoryGrid`.

Each `CategoryCard` contains:

```text
icon/illustration
category name
optional count
```

Mobile:

```text
3 columns
compact cards
```

Desktop:

```text
6–8 columns depending on viewport
```

Use equal card dimensions so the grid feels organized.

---

# 37. Horizontal Service Rails

This is a major visual characteristic of the marketplace.

Each section:

```text
Section heading                           See all

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ image  │ │ image  │ │ image  │ │ image  │
│        │ │        │ │        │ │        │
├────────┤ ├────────┤ ├────────┤ ├────────┤
│ title  │ │ title  │ │ title  │ │ title  │
└────────┘ └────────┘ └────────┘ └────────┘
                         → horizontal scroll
```

Mobile implementation:

```text
overflow-x: auto
scroll-snap-type: x mandatory
```

Desktop can convert the rail into a normal grid where appropriate.

---

# 38. Service Card

Prioritize imagery.

```text
┌────────────────────┐
│                    │
│       IMAGE        │
│                    │
├────────────────────┤
│ Service title      │
│ rating / metadata  │
└────────────────────┘
```

Optional:

```text
verified badge
starting price
availability
```

Do not overload the card with detailed information.

---

# 39. Promotion / Trust Banners

Use wide visual banners between service sections.

Possible Co-opSeva banner themes:

```text
Verified cooperative workers
Worker-first marketplace
Emergency services
Seasonal services
Transparent pricing
Community impact
```

Structure:

```text
┌─────────────────────────────────────┐
│                                     │
│       Visual / illustration         │
│                                     │
│       Dynamic campaign content      │
│                              CTA    │
└─────────────────────────────────────┘
```

Not every banner should look like an advertisement. Some should communicate trust and social impact.

---

# 40. Trust Strip

Use a compact informational strip similar to the reference:

```text
[✓] Verified workers
[✓] Transparent pricing
[✓] Secure payments
[✓] Cooperative-owned marketplace
```

On mobile, allow horizontal scrolling or a compact 2-column layout.

---

# 41. Worker Discovery Page

Route:

```text
/services/:serviceId/workers
```

Layout:

```text
Header
↓
Service summary
↓
Filter/sort row
↓
Map + worker results
↓
Worker cards
```

Worker card:

```text
┌────────────────────────────────────┐
│ Avatar      Name             ✓     │
│             Skill                  │
│                                    │
│ ★ rating   distance   availability │
│                                    │
│ Workload / fairness indicator      │
│                                    │
│                  [View / Book]     │
└────────────────────────────────────┘
```

Trust should be visually prominent.

---

# 42. Worker Profile Page

Route:

```text
/workers/:workerId
```

Structure:

```text
Profile header
↓
Verification
↓
Skills
↓
Certifications
↓
Experience
↓
Ratings
↓
Service area
↓
Availability
↓
Pricing
↓
Book CTA
```

Use:

```text
VerificationBadge
CertificationCard
RatingDisplay
AvailabilityBadge
```

Do not expose unnecessary sensitive personal information.

---

# 43. AI Booking Experience

The AI booking interface should feel like a **smart command layer**, not a generic chatbot.

```text
┌────────────────────────────────────┐
│ ✨ Describe your service need      │
│                                    │
│ Natural-language request area      │
│                                    │
│                       [Continue]   │
└────────────────────────────────────┘
```

After parsing:

```text
┌────────────────────────────────────┐
│ AI understood your request         │
├────────────────────────────────────┤
│ Service        dynamic             │
│ Issue          dynamic             │
│ Location       dynamic             │
│ Time           dynamic             │
│ Urgency        dynamic             │
├────────────────────────────────────┤
│ [Edit]                  [Continue] │
└────────────────────────────────────┘
```

The displayed fields must be generated from the structured AI intent.

---

# 44. AI Recommendation Card

Never use a raw LLM paragraph as the primary UI.

Use:

```text
AIRecommendationCard
```

Example structure:

```text
┌────────────────────────────────────┐
│ ✨ Recommended worker              │
│                                    │
│ [Avatar] Worker Name       ✓       │
│                                    │
│ Match score                91/100  │
│                                    │
│ ★ 4.8   1.7 km   Available        │
│                                    │
│ Why recommended?                   │
│ ✓ Skill match                      │
│ ✓ Verified                         │
│ ✓ Available                        │
│ ✓ Balanced workload                │
│                                    │
│                 [Select worker]    │
└────────────────────────────────────┘
```

AI should be identifiable but not gimmicky.

---

# 45. Matching Explainability

Add:

```text
Why this match?
```

Desktop:

```text
side panel / modal
```

Mobile:

```text
bottom sheet
```

Show:

```text
Skill match
Distance
Availability
Rating
Workload balance
Fairness
```

Use compact progress bars:

```text
Skill            ██████████ 100
Distance         █████████   90
Availability     ██████████ 100
Rating           █████████   94
Workload balance █████████   90
```

The backend remains responsible for calculating scores.

---

# 46. Booking Checkout

Keep checkout calm and focused:

```text
Service summary
↓
Worker summary
↓
Schedule
↓
Location
↓
Price breakdown
↓
Payment
↓
Confirmation
```

Separate information using cards.

Do not show unnecessary UI during payment.

---

# 47. Booking Tracking

This should be one of the most polished pages.

```text
Booking status
↓
Map
↓
Worker summary
↓
ETA
↓
Booking timeline
```

Map:

```text
┌───────────────────────────────────┐
│               MAP                 │
│                                   │
│       Worker → Customer           │
│                                   │
└───────────────────────────────────┘
```

Timeline:

```text
✓ Booking confirmed
✓ Worker accepted
● Worker on the way
○ Service started
○ Service completed
```

Use clear icons and line connectors.

---

# 48. Completion + Rating

Flow:

```text
Success state
↓
Worker summary
↓
Star rating
↓
Feedback
↓
Invoice
```

Make rating touch-friendly and short.

---

# 49. Customer Dashboard

Route:

```text
/customer
```

Structure:

```text
Header
↓
Active booking
↓
Quick actions
↓
Recent bookings
↓
Saved/frequent services
↓
AI suggestions
```

Quick actions:

```text
Book service
Emergency help
Track booking
Past bookings
```

---

# 50. Worker Dashboard

Route:

```text
/worker
```

Priority:

```text
Today's work
↓
Next booking
↓
Earnings
↓
Workload
↓
Rating
↓
Availability
```

Use compact stat cards and booking cards.

---

# 51. Worker Welfare UI

Route:

```text
/worker/welfare
```

Use a supportive, non-punitive visual style.

Show:

```text
Workload
Working hours
Jobs completed
Estimated earnings
Travel burden
Availability/rest
```

Example:

```text
Workload

████████░░ 80%

High but manageable

Suggested action:
Reduce new assignments where suitable.
```

Avoid surveillance-like wording.

---

# 52. Cooperative Admin Dashboard

Admin UI should have the same design tokens but a more operational layout.

Desktop:

```text
Sidebar
  Dashboard
  Workers
  Bookings
  Cooperatives
  Services
  AI Operations
  Welfare
  Payments
  Reports
  Settings

Main content
```

Mobile uses a compact header and navigation tabs.

---

# 53. Admin Overview

Top:

```text
Workers
Bookings
Transaction value
Average rating
```

Second:

```text
Demand chart
Worker utilization
Service distribution
Zone distribution
```

Third:

```text
AI recommendations
Welfare alerts
Pending verification
```

Use consistent card dimensions and spacing.

---

# 54. AI Operations Dashboard

This is a major SIH showcase screen.

```text
AI Operations
────────────────────────────────

Agent Status

Booking Agent       ● Active
Matching Agent      ● Active
Forecast Agent      ● Active
Workforce Agent     ● Active
Welfare Agent       ● Active

────────────────────────────────

Recent Agent Activity

[Timeline]

────────────────────────────────

Recommendations

[Recommendation cards]
```

Do not imply that agents execute actions they are not authorized to execute.

---

# 55. Agent Activity Timeline

Use a vertical timeline:

```text
09:42
● Booking Agent

Parsed customer request
        │
        ↓
09:42
● Matching Agent

Found 7 eligible workers
        │
        ↓
09:43
● Fairness Engine

Adjusted overloaded-worker priority
        │
        ↓
09:43
● Matching Agent

Recommended worker
```

This makes the agentic workflow understandable to judges.

---

# 56. Demand Forecast Dashboard

Use clean visualizations.

Primary:

```text
Predicted Demand
```

Then:

```text
Service × Zone
```

Good visualizations:

- bar chart
- line chart
- heatmap
- forecast cards

Example:

```text
Plumbing
Expected: 27
Trend: ↑
Confidence: 84%
```

Clearly distinguish historical from predicted data.

---

# 57. Workforce Allocation Dashboard

Show the entire reasoning pipeline:

```text
Forecast
↓
Capacity gap
↓
AI recommendation
↓
Admin approval
```

Example:

```text
Zone A

Predicted demand: 31
Available capacity: 24
Gap: 7

AI recommends:

+4 plumbers
+1 technician

[Review]
```

Review screen:

```text
[Approve]
[Modify]
[Reject]
```

AI must never silently reassign workers.

---

# 58. Worker Opportunity Dashboard

Show cooperative fairness.

```text
Worker Opportunity

Worker       Jobs    Opportunity
Ramesh       31      High
Suresh        8      Low
Imran         6      Low
Asha         19      Balanced
```

Use neutral language.

Purpose:

```text
Identify underutilized skilled workers
+
Improve fair opportunity distribution
```

---

# 59. Cooperative Health Score

Create an explainable score:

```text
COOPERATIVE HEALTH

       87
      /100
```

Break it into:

```text
Worker utilization
Income distribution
Customer satisfaction
Response time
Workload balance
Service coverage
```

Clicking the score opens its calculation.

Do not present an unexplained AI score.

---

# 60. Emergency UX

Emergency mode should be visually distinct but not chaotic.

```text
Emergency request
↓
Location
↓
Problem
↓
Nearest qualified verified worker
↓
ETA
↓
Confirmation
```

Result card:

```text
┌────────────────────────────────────┐
│ Verified emergency-capable worker  │
│                                    │
│ ETA: dynamic                       │
│ Distance: dynamic                  │
│ Skill: dynamic                     │
│                                    │
│              [Request help]        │
└────────────────────────────────────┘
```

Only qualified/verified workers should be returned by backend rules.

---

# 61. Verification UI

Use consistent states:

```text
VERIFIED
PENDING
REJECTED
EXPIRED
```

Display a label/icon in addition to color.

Example:

```text
✓ Verified cooperative worker
```

Clicking the badge can show what verification means.

---

# 62. Loading, Empty and Error States

Every API-driven page needs a proper state.

Skeletons:

```text
ServiceCardSkeleton
WorkerCardSkeleton
DashboardCardSkeleton
ChartSkeleton
ProfileSkeleton
```

Empty states:

```text
No nearby workers
No active bookings
No upcoming jobs
No forecast data
No AI recommendations
```

Error state:

```text
Something went wrong.

We couldn't load the requested information.

[Try again]
```

Never expose raw stack traces or provider errors.

---

# 63. Mobile Bottom Navigation

Customer:

```text
Home
Bookings
AI / Discover
Profile
```

Worker:

```text
Home
Jobs
Earnings
Profile
```

Admin:

```text
Dashboard
Workers
Bookings
AI
More
```

Use icons plus short labels.

The active item gets the primary accent treatment.

---

# 64. Desktop Navigation

Customer:

```text
Logo
Services
Bookings
How it works
Cooperatives
Profile
```

Worker:

```text
Dashboard
Jobs
Availability
Earnings
Welfare
Profile
```

Admin:

```text
Dashboard
Workers
Bookings
Services
AI Operations
Welfare
Reports
Settings
```

---

# 65. Accessibility

Minimum requirements:

- [ ] keyboard navigation
- [ ] visible focus states
- [ ] sufficient contrast
- [ ] touch targets around 44px or larger
- [ ] alt text for meaningful images
- [ ] icons paired with labels where needed
- [ ] status not communicated by color alone
- [ ] reduced-motion-friendly transitions

---

# 66. Animation

Keep animation subtle:

```text
fade
slide
scale
skeleton shimmer
progress transitions
```

Good uses:

- page transitions
- card hover
- booking status changes
- AI recommendation appearance
- chart transitions
- bottom sheets

Avoid excessive animation.

---

# 67. Image Strategy

The marketplace is visually image-heavy.

Co-opSeva should use:

```text
service images
worker images
community/cooperative imagery
illustrations
```

Images must be data-driven.

Use consistent:

```text
aspect ratios
object-fit: cover
border radius
```

Recommended service card ratio:

```text
≈ 4:3
```

Recommended promotional banner:

```text
≈ 3:1 to 16:6 depending on viewport
```

Optimize image sizes for mobile.

---

# 68. Data-Driven UI Rule

Prefer:

```jsx
<ServiceCard service={service} />
<WorkerCard worker={worker} />
<CategoryCard category={category} />
```

Do not create:

```jsx
<PlumberCard />
<CleanerCard />
<ElectricianCard />
```

This allows the same UI to support:

- new services
- new cooperatives
- multilingual content
- AI recommendations
- future geographic expansion

---

# 69. Page-to-Component Mapping

```text
HOME
├── AppHeader
├── LocationSelector
├── SearchBar / AICommandBar
├── CategoryGrid
├── PromotionRail
├── ServiceSection
│   └── ServiceCard
├── TrustStrip
├── PromotionBanner
├── ServiceSection
├── WorkerCTA
├── Footer
└── BottomNavigation

SERVICE DISCOVERY
├── AppHeader
├── ServiceSummary
├── FilterBar
├── Map
├── WorkerList
│   └── WorkerCard
└── BottomNavigation

WORKER PROFILE
├── ProfileHeader
├── VerificationBadge
├── Skills
├── Certifications
├── Rating
├── Availability
├── ServiceArea
└── BookingCTA

AI BOOKING
├── AICommandBar
├── IntentCard
├── MissingInformationPrompt
├── AIRecommendationCard
├── ExplainabilityPanel
└── ConfirmationCTA

BOOKING
├── BookingSummary
├── WorkerSummary
├── ScheduleCard
├── LocationCard
├── PriceBreakdown
├── Payment
└── Confirmation

TRACKING
├── BookingStatus
├── Map
├── WorkerCard
├── BookingTimeline
└── SupportActions

WORKER DASHBOARD
├── Header
├── StatCards
├── NextJob
├── JobList
├── WorkloadCard
├── EarningsCard
└── WelfareCard

ADMIN DASHBOARD
├── Sidebar
├── KPI Cards
├── DemandChart
├── WorkerUtilization
├── BookingAnalytics
├── AIRecommendations
├── WelfareAlerts
└── VerificationQueue

AI OPERATIONS
├── AgentStatus
├── AgentActivityTimeline
├── ForecastCard
├── AllocationRecommendation
├── OpportunityIndex
└── ExplainabilityPanel
```

---

# 70. UI Rules for AI Coding Agents

Whenever an AI coding agent builds a page, give it these constraints:

```text
1. Follow Co-opSeva design tokens.
2. Reuse existing components.
3. Do not invent a new visual style.
4. Do not hardcode service/customer/worker data.
5. Use API/config/i18n data.
6. Keep mobile-first behavior.
7. Use horizontal service rails where appropriate.
8. Use white/light surfaces and the primary blue accent.
9. Use subtle borders and shadows.
10. Keep typography compact and readable.
11. Add loading, empty and error states.
12. Do not make every interaction a modal.
13. Prefer bottom sheets on mobile where appropriate.
14. Use dashboard sidebars on desktop operational pages.
15. Keep AI visually identifiable but restrained.
16. Never expose raw LLM output as the main interface.
17. Show explanations for important AI recommendations.
18. Keep irreversible actions behind confirmation.
19. Never copy branding, text, images or assets from the design system.
20. Preserve the same design language across customer, worker and admin pages.
```

---

# 71. SIH Showcase Screens

Spend the most UI polish on:

```text
1. Home
2. AI Booking
3. Smart Matching
4. Booking Tracking
5. Cooperative Dashboard
6. AI Operations
7. Demand Forecast
8. Workforce Allocation
```

These screens tell the complete story.

---

# 72. Final Visual Principle

The uploaded image controls the **visual grammar**, not the application content.

Correct:

```text
Co-opSeva design system
      ↓
Reusable UI specification
      ↓
Co-opSeva component system
      ↓
MongoDB/API data
      ↓
AI structured output
      ↓
Dynamic UI
```

Incorrect:

```text
Co-opSeva design system
      ↓
Copy screenshot
      ↓
Hardcoded content
```

The final product should feel like a polished modern home-services marketplace while being genuinely driven by the Co-opSeva MERN backend and agentic AI system.

---

# 73. Final UI Definition of Done

Before considering the UI complete:

- [ ] Home follows the marketplace composition
- [ ] All service cards are reusable
- [ ] All worker cards are reusable
- [ ] Horizontal rails work on mobile
- [ ] Responsive desktop layout exists
- [ ] Customer pages are complete
- [ ] Worker pages are complete
- [ ] Admin pages are complete
- [ ] AI booking UI works with structured AI output
- [ ] AI recommendation UI has explanations
- [ ] Agent activity is visible
- [ ] Forecast UI works
- [ ] Workforce recommendation UI works
- [ ] Welfare UI works
- [ ] Loading states exist
- [ ] Empty states exist
- [ ] Error states exist
- [ ] Bottom navigation works
- [ ] Design tokens are centralized
- [ ] Content is data-driven
- [ ] English/Hindi/localized strings are separated
- [ ] No reference branding/assets are copied
- [ ] No raw API/LLM errors are exposed
