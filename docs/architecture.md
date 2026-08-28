# Co-opSeva — System Architecture

## Overview

Co-opSeva is an AI-powered cooperative service marketplace built as a MERN monorepo. It converts local service demand into fair, intelligent workforce allocation using a multi-agent AI layer.

## High-Level Architecture

```
                         CO-OPSEVA
                              |
                 ┌────────────┴────────────┐
                 │                         │
              React (Vite)             Express API
              :5173                     :5000
                 │                         │
        Customer/Worker/Admin       Business Services
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                        In-Memory Store           AI Runtime
                        (MongoDB fallback)             │
                                       ┌───────────────┴───────────────┐
                                       │               │               │
                                   Supervisor      Tool Layer       Guardrails
                                       │
                        ┌──────────────┼──────────────┐
                        │              │              │
                    Booking       Matching       Forecast
                      Agent         Agent          Agent
                                       │              │
                                       │          Workforce
                                       │             Agent
                                       │
                                   Welfare
                                    Agent
```

## Monorepo Structure

```
jan-seva/
├── apps/
│   ├── web/                  # React 18 + Vite + Tailwind
│   └── api/                  # Node.js + Express API
├── packages/
│   ├── shared/               # Constants (ROLES, STATUS enums)
│   └── validation/           # Zod schemas
├── scripts/
│   ├── seed.js               # MongoDB seed
│   ├── demo-reset.js         # Reset to demo state
│   └── verify-all.js         # 10-test validation suite
└── docs/                     # Documentation
```

## Data Flow

```
Customer Request (EN/HI/MR)
  ↓
Booking Agent (NLP → Structured Intent)
  ↓
Supervisor Agent (orchestrates sub-agents)
  ↓
Matching Agent
  ↓
AI Tools: findNearbyWorkers → getWorkerSkills → calculateDistance → calculateFairnessScore
  ↓
Deterministic Fairness Engine (scoring.js)
  ↓
Recommendation → Customer Confirmation
  ↓
Booking State Machine (REQUESTED → COMPLETED)
  ↓
Payment (85% worker / 10% cooperative / 5% platform)
  ↓
Rating → Worker welfare score update
  ↓
Admin Dashboard → Forecast → Workforce rebalancing
```

## Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Monorepo | npm workspaces | Zero config, native Node support |
| Frontend | React 18 + Vite | Fast HMR, production build |
| Styling | Tailwind CSS | Utility-first, design system |
| Data Fetching | Axios + TanStack Query | Caching, background sync |
| Backend | Node.js + Express | Fast, modular |
| Database | MongoDB Atlas (+ in-memory fallback) | Geo queries, flexibility |
| ODM | Mongoose | Schema + validation |
| Auth | JWT + bcrypt | Stateless, secure |
| AI | Groq API (groq/compound-mini) | Fast, free tier, structured JSON |
| Maps | OpenStreetMap + Leaflet | No API key needed, open-source |
| Payments | Razorpay Test Mode | Real SDK, test keys |
| Charts | Recharts | React-native charts |
| Realtime | Polling (Socket.IO ready) | Demo-reliable |
| i18n | i18next | EN/HI/MR support |

## AI Provider Auto-Detection

```
AI_API_KEY starts with "gsk_"  → Groq API (groq/compound-mini)
AI_API_KEY starts with "AIza"  → Google Gemini (gemini-2.0-flash)
AI_API_KEY starts with "sk-"   → OpenAI (gpt-4o-mini)
No key / offline               → Deterministic demo engine
```

## Fairness Algorithm

```
Match Score =
  Skill Score    × 0.30
  Proximity      × 0.25
  Availability   × 0.20
  Rating         × 0.10
  Workload Bal.  × 0.10
  Welfare Factor × 0.05

WorkloadScore = 100 - worker.workloadScore
(Workers with >40 weekly hours are deprioritized)
```

## Payment Distribution

```
Total Booking Amount:    ₹299
Worker Direct Payout:    ₹254.15  (85%)
Cooperative Welfare:     ₹ 29.90  (10%)
Platform Fee:            ₹ 14.95  ( 5%)
```
