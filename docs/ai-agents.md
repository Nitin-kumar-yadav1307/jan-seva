# Co-opSeva — AI Agents Documentation

## Overview

Co-opSeva uses a multi-agent AI architecture. Each agent has a single responsibility. The Supervisor orchestrates them. The LLM is only used for **reasoning and language tasks**. All data operations go through deterministic backend tools.

```
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

---

## Agent 1 — Booking Agent

**File:** `apps/api/src/ai/agents/booking/bookingAgent.js`

**Responsibility:**
- Understand natural language service requests
- Support English, Hindi (हिन्दी), Marathi
- Extract structured intent from free-form text
- Detect emergency keywords

**Input:**
```json
{
  "prompt": "Mere kitchen ka pipe leak ho gaya hai. Emergency plumber chahiye!",
  "language": "hi",
  "customerLocation": { "coordinates": [77.2167, 28.6328] }
}
```

**Output (normalized):**
```json
{
  "extractedIntent": {
    "serviceCategory": "Plumbing",
    "isEmergency": true,
    "urgency": "HIGH_EMERGENCY",
    "customerProblemSummary": "Kitchen pipe leakage",
    "detectedLanguage": "Hindi (हिन्दी)",
    "scheduleRequested": "Immediate (Within 25 mins)",
    "requiredSkillLevel": "EXPERT",
    "confidence": 0.96
  },
  "suggestedServiceId": "srv_plumb_01",
  "agentMessage": "🚨 Urgent Plumbing emergency detected."
}
```

**Safety:** Never creates bookings autonomously. Only parses intent.

---

## Agent 2 — Matching Agent

**File:** `apps/api/src/ai/agents/matching/matchingAgent.js`

**Responsibility:**
- Consume structured intent from Booking Agent
- Call geo/worker tools to find candidates
- Apply deterministic Fairness Engine
- Return ranked recommendations with explainability

**Tools Used:**
- `findNearbyWorkers()` — geo search
- `calculateDistance()` — Haversine distance + ETA
- `calculateFairnessScore()` — multi-factor scoring

**Fairness Formula:**
```
Match Score =
  Skill Score    × 30%
  Proximity      × 25%
  Availability   × 20%
  Rating         × 10%
  Workload Bal.  × 10%
  Welfare Factor × 5%
```

**Emergency Mode Override:**
When `isEmergency: true`, proximity and ETA are prioritized. Only EXPERT-level verified workers are returned.

---

## Agent 3 — Supervisor Agent

**File:** `apps/api/src/ai/agents/supervisor/supervisorAgent.js`

**Responsibility:**
- Entry point for all user requests
- Routes to appropriate sub-agents
- Combines results into unified response
- Writes AIActionLog records for transparency

**Flow:**
```
User Request → Supervisor → Booking Agent → Matching Agent → AIActionLog → Response
```

---

## Agent 4 — Forecast Agent

**File:** `apps/api/src/ai/agents/forecast/forecastAgent.js`

**Responsibility:**
- Analyze historical booking patterns
- Generate 7-day demand forecasts by zone and category
- Identify shortage zones (demand > capacity)
- Return confidence intervals

**Output Example:**
```json
{
  "forecast": [
    { "category": "Plumbing", "zone": "Zone A", "expectedDemand": 27, "trend": "UP", "confidence": 0.84 }
  ],
  "shortageZones": ["Zone A - Central Delhi"],
  "demandCurve": [...]
}
```

---

## Agent 5 — Workforce Agent

**File:** `apps/api/src/ai/agents/workforce/workforceAgent.js`

**Responsibility:**
- Consume demand forecast + worker capacity data
- Identify capacity gaps per zone/category
- Generate rebalancing recommendations
- Require admin approval before any action

**Human-in-the-loop:** AI recommends, admin approves. Workers are never reassigned silently.

**Output Example:**
```json
{
  "recommendations": [
    {
      "zone": "Zone A - Central Delhi",
      "category": "Plumbing",
      "currentWorkers": 3,
      "recommendedWorkers": 7,
      "gap": 4,
      "reason": "High forecasted demand surge expected"
    }
  ]
}
```

---

## Agent 6 — Welfare Agent

**File:** `apps/api/src/ai/agents/workforce/workforceAgent.js` (exported as `runWelfareAgent`)

**Responsibility:**
- Monitor weekly hours, active jobs, workload scores
- Detect OVERWORKED, UNDERUTILIZED, HIGH_LOAD_TODAY states
- Generate human-readable recommendations
- Never modifies assignments autonomously

**Guardrails:**
- Workers with >40 weekly hours flagged as OVERWORKED
- Matching Agent deprioritizes overloaded workers automatically
- Workers with <10 weekly hours get boosted opportunity scores

---

## Tool Layer

**Location:** `apps/api/src/ai/tools/`

| Tool File | Functions |
|---|---|
| `workerTools.js` | `getWorkerProfile`, `getWorkerSkills`, `getWorkerAvailability`, `getWorkerWorkload` |
| `geoTools.js` | `findNearbyWorkers`, `calculateDistance`, `getZoneStats` |
| `bookingTools.js` | `createBookingDraft`, `getActiveBookings`, `getBookingHistory` |
| `analyticsTools.js` | `getDemandHistory`, `getServiceDistribution`, `getWorkerUtilizationStats`, `getKPISummary` |
| `cooperativeTools.js` | `getCooperativeStats`, `getWorkerWelfareReport` |

**Security:** Tools only read from the in-memory store or MongoDB. The LLM never receives database credentials.

---

## AI Safety Rules

| Action | AI Can? |
|---|---|
| Search nearby workers | ✅ Via tool |
| Analyze demand patterns | ✅ |
| Recommend workers | ✅ |
| Explain recommendations | ✅ |
| Create booking drafts | ✅ (not confirmed) |
| Generate workforce proposals | ✅ (needs admin approval) |
| Transfer money | ❌ |
| Delete or modify users | ❌ |
| Approve worker verification | ❌ |
| Permanently reassign workers | ❌ |
| Access raw DB credentials | ❌ |

---

## AI Client

**File:** `apps/api/src/ai/aiClient.js`

Auto-detects provider from key prefix:
- `gsk_` → Groq (`groq/compound-mini`)
- `AIza` → Google Gemini (`gemini-2.0-flash`)
- `sk-` → OpenAI (`gpt-4o-mini`)
- None/error → Deterministic fallback engine

The fallback ensures **zero visible failures** during SIH demos.
