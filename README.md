# Co-opSeva (को-ऑपसेवा) — SIH Agentic AI Cooperative Service Marketplace

> **Empowering Indian artisans, technicians, and gig workers through a federated cooperative marketplace powered by an ethical, multi-agent AI layer and deterministic fairness balancing.**

---

## 🌟 Key Innovations & Differentiators

Unlike traditional aggregators that optimize solely for the "nearest worker" (often creating worker exhaustion, unequal income distributions, and high platform commissions):

1. **85% Direct Worker Wage Payout**: 85% of customer fees flow directly to the worker, 10% to the cooperative healthcare & emergency relief fund, and only 5% to open platform operations.
2. **Deterministic Fairness Engine**: Multi-objective candidate scoring balancing certified skill match, proximity, rating, and worker workload protection (protecting against gig burnout while lifting underutilized workers).
3. **Multi-Agent AI Layer**:
   - **Supervisor Agent**: Master orchestrator delegating intent extraction and candidate matching with immutable audit trails (`AIActionLog`).
   - **Booking Agent**: Natural-language conversational parser supporting English, Hindi (हिन्दी), and Hinglish with automatic emergency classification.
   - **Matching Agent**: Connects backend geo-spatial tools with the fairness engine to generate human-readable explainability breakdowns.
   - **Forecast Agent**: 7-day predictive demand modeling with zone shortage warnings.
   - **Workforce Agent**: Proposes autonomous capacity rebalancing between zones with 1-click cooperative admin approvals.
   - **Welfare Agent**: Realtime worker burnout monitoring and opportunity indexing.
4. **100% Presentation Reliability**: Built-in zero-latency deterministic demo fallbacks ensure judges never experience third-party API rate limits or network drops.
5. **Multilingual Interface**: Full i18n support for English, Hindi (हिन्दी), and Marathi (मराठी).

---

## 🏗️ Monorepo Architecture

```text
jan-seva/
├── apps/
│   ├── web/                    # React 18 + Vite + Tailwind CSS + Lucide + i18next + Recharts
│   │   ├── src/
│   │   │   ├── components/     # Navbar, BottomNav, Footer, Modals
│   │   │   ├── context/        # AuthContext with instant Persona Switcher
│   │   │   ├── features/       # Home, Services, Workers, Booking, AI Drawer, Admin Dashboard
│   │   │   └── locales/        # English, Hindi, Marathi translations
│   └── api/                    # Node.js + Express + Mongoose + Socket.IO
│       └── src/
│           ├── ai/             # Multi-agent implementations & tool registry
│           ├── controllers/    # Domain controllers (Auth, Workers, Bookings, Payments, etc.)
│           ├── matching/       # Haversine spatial & deterministic fairness scoring
│           ├── models/         # MongoDB schemas (User, Worker, Cooperative, Booking, etc.)
│           ├── routes/         # REST API endpoints
│           └── services/       # Persistent In-Memory demo store & fallback engine
├── packages/
│   ├── shared/                 # Enums, roles, status constants, fairness weight tables
│   └── validation/             # Zod validation schemas
├── scripts/
│   ├── seed.js                 # Realistic seed database script
│   ├── demo-reset.js           # 1-click presentation demo state reset
│   └── verify-all.js           # End-to-end chunk validation suite
└── docs/                       # Architecture, AI Agents, Demo Script & Judge Q&A
```

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run All Applications
```bash
npm run dev
```
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Run Validation Suite
```bash
node scripts/verify-all.js
```

### 4. 1-Click Demo Reset
```bash
npm run demo:reset
```

---

## 🎭 Interactive Demo Personas

Use the **Role Switcher** on the top navigation bar to test each perspective:
- **Customer**: `Aditi Sharma` (Book via AI Assistant or Catalogue, track live progress, pay sandbox invoice, rate service)
- **Worker**: `Suresh Kumar` (Master Plumber - View assigned jobs, toggle availability, accept/start/complete jobs, track earnings)
- **Co-op Admin**: `Vikas Mehra` (View demand forecasts, approve AI workforce rebalancing, monitor member welfare)
