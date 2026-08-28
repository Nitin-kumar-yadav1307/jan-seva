# Co-opSeva — SIH Judge Q&A Preparation

## Q1: What problem does Co-opSeva solve?

India has **450+ million informal and unorganized workers** in the services sector. They lack:
- Steady income and job security
- Fair work distribution
- Access to formal financial systems
- Protection against overwork and exploitation

Co-opSeva creates a **cooperative-owned AI marketplace** where:
1. Workers own the platform through cooperatives
2. AI ensures fair, not just fast, work distribution
3. 85% of every booking goes directly to the worker

---

## Q2: How is this different from Urban Company / other apps?

| Feature | Urban Company | Co-opSeva |
|---|---|---|
| Ownership | VC-funded private | Worker cooperative |
| Worker cut | ~60–70% | 85% directly |
| Matching | Nearest/cheapest | Multi-factor fairness |
| Welfare monitoring | None | AI welfare guardrails |
| Work distribution | Concentration on top workers | Equitable distribution |
| AI safety | Black box | Explainable, human-in-loop |

---

## Q3: How does the AI matching work?

The AI does **not** simply pick the nearest worker. It uses a deterministic fairness engine:

```
Match Score =
  Skill (30%) + Distance (25%) + Availability (20%) +
  Rating (10%) + Workload Balance (10%) + Welfare (5%)
```

**Demo scenario:** Ramesh is 0.24 km away but has 48 weekly hours (overloaded). Suresh is 0.7 km away with 24 weekly hours. The algorithm recommends Suresh — slightly farther, but well-rested and available.

This is the **core innovation**: welfare-aware fairness matching.

---

## Q4: Is the AI safe? Can it take actions autonomously?

No. Co-opSeva follows a strict **Human-in-the-Loop** design:

- AI can **recommend** — it cannot confirm bookings
- AI can **propose** workforce changes — admin must approve
- AI can **flag** overloaded workers — it cannot modify assignments
- All AI recommendations are logged with confidence scores and explanations

The fairness engine is deterministic code, not an LLM rule.

---

## Q5: How does it handle Indian languages?

- The Booking Agent processes English, Hindi, and Marathi input natively
- Demo: `"Mere kitchen ka pipe leak ho gaya"` → extracts Plumbing + Normal urgency
- Demo: `"Emergency bijli nahin hai"` → extracts Electrical + HIGH_EMERGENCY
- UI supports all 3 languages via i18next (`en.json`, `hi.json`, `mr.json`)

---

## Q6: What happens if the internet or AI API goes down during the demo?

Co-opSeva is **demo-proof**:

1. MongoDB falls back to a pre-populated **in-memory store** (22 workers, 9 services, 3 cooperatives)
2. If the Groq API fails, the system automatically switches to a **deterministic response engine** that produces realistic structured output
3. OpenStreetMap works offline (tile cache)
4. No visible error is ever shown to users

---

## Q7: How does the cooperative payment model work?

Every completed booking distributes:
- **85%** to the worker directly
- **10%** to the cooperative welfare fund (insurance, training, emergency support)
- **5%** platform operational fee

This is **transparent and visible** in the price breakdown on every invoice.

---

## Q8: What is the Worker Opportunity Index?

The Opportunity Index identifies skilled workers receiving fewer jobs than their capacity allows:

- Workers with very high job counts → "HIGH" opportunity (already getting work)
- Workers with few jobs despite availability → "LOW" opportunity (being under-assigned)
- The matching engine **boosts assignment probability** for under-assigned workers

This prevents the common gig economy problem of top-rated workers getting all jobs while others stagnate.

---

## Q9: How does emergency booking work?

When the AI detects emergency keywords (burst pipe, no electricity, fire risk):
1. Urgency is set to `HIGH_EMERGENCY`
2. Matching priorities shift: proximity + ETA become dominant
3. Only **EXPERT-level, VERIFIED** workers are returned
4. ETA is displayed prominently
5. The cooperative is notified immediately

---

## Q10: What is the Cooperative Health Score?

A composite 0–100 score built from:
- Worker utilization rate (30%)
- Workload balance / equity (40%)
- Customer satisfaction / rating (30%)

Clicking the score opens a breakdown. No unexplained AI score is shown.

---

## Q11: What technology stack is used?

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (+ in-memory fallback) |
| AI | Groq API (llama/compound models) |
| Maps | OpenStreetMap + Leaflet (no API key needed) |
| Payments | Razorpay Test Mode |
| Auth | JWT + bcrypt |
| i18n | i18next (EN/HI/MR) |

---

## Q12: Is this production-ready?

The current build is a **high-fidelity prototype** designed for SIH demonstration. It includes:
- Full MERN backend with 10+ API endpoints
- Real AI integration (Groq)
- Real map integration (OpenStreetMap)
- Real payment flow (Razorpay test mode)
- 10/10 automated test suites passing
- Production Vite build passing

To deploy to production:
1. Add real MongoDB Atlas URI
2. Deploy API to Render/Railway/GCP
3. Deploy React to Vercel
4. Enable real Razorpay live keys
