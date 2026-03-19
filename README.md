# GigGuard (GG) — AI-Powered Parametric Income Insurance for India's Gig Economy


---

## 1. What Is GigGuard

India has over 5 million food delivery partners working for platforms like Zomato and Swiggy. Every single one of them is one rainstorm, one app crash, or one unfair rating away from losing 20–30% of their weekly income — with zero protection and zero recourse.

**GigGuard (GG)** is an AI-powered parametric income insurance platform built exclusively for food delivery partners. It automatically detects income-disrupting events in real time, validates them against multiple independent data sources, and transfers the worker's lost wages directly to their UPI account — in under 60 seconds, with zero claim filing required.

The worker never opens a form. The worker never calls anyone. The money just arrives.

---

## 2. Persona & Real-World Scenarios

**Target Persona:** Food delivery partners working on Zomato and Swiggy in Tier-1 and Tier-2 Indian cities.

**Income Profile:**

| Metric | Reality |
|---|---|
| Daily earnings | ₹800–₹1,400 |
| Weekly earnings | ₹4,800–₹8,400 |
| At-risk income (disruptions) | ₹960–₹2,520/week |
| Work pattern | 6–8 hrs/day, 6 days/week |
| Platform dependency | 100% — no orders means no income |

**Real Scenarios GigGuard Covers:**

| Worker | City | Disruption | Income Lost | GG Response |
|---|---|---|---|---|
| Rajan | Mumbai | Heavy monsoon rain at 7pm | ₹700 (4 hrs) | ₹560 credited in 60 seconds |
| Priya | Delhi | AQI crosses 400 in her zone | ₹480 (3 hrs) | ₹384 credited automatically |
| Arun | Bangalore | Local bandh — full day | ₹1,100 | ₹880 credited by 10am |
| Suresh | Chennai | Swiggy app down during dinner rush | ₹420 (2.5 hrs) | ₹336 credited instantly |
| Meera | Hyderabad | Restaurant delay caused 2-star rating | ₹340 lost next week | ₹272 compensated |

---

## 3. The 6 Parametric Triggers

Every trigger is fully automated — detected by independent data sources, cross-validated, fraud-checked, and paid out without any human intervention.

---

### Trigger 1 — Heavy Weather & Air Pollution

**What it covers:** Worker cannot safely operate outdoors due to extreme rain, flooding, or toxic air pollution in their delivery zone.

| Signal | Source | Threshold |
|---|---|---|
| Rainfall intensity | OpenWeatherMap API | >35mm/hr sustained 45+ mins |
| Official weather alert | IMD RSS Feed | Flood/storm warning issued for zone |
| Order volume drop | Mock Platform API | >50% drop vs normal in that zone |

**Fraud Risk:** Near zero — government published data, independently verifiable from 3 sources simultaneously.
**Payout Speed:** Under 60 seconds after all 3 signals confirmed.

---

### Trigger 2 — Platform App Outage

**What it covers:** Zomato or Swiggy servers go down during peak earning windows — worker cannot receive or complete orders despite being ready to work.

| Signal | Source | Threshold |
|---|---|---|
| Platform status | Zomato/Swiggy status API | Outage officially declared |
| Public confirmation | DownDetector API | Spike in outage reports |
| Worker connectivity | Device-side signal | Login attempts failing |

**Peak Windows Covered:** 12pm–2pm and 7pm–9pm only.
**Fraud Risk:** Zero — systemic public event, cannot be faked by any individual.
**Payout Speed:** Under 60 seconds after outage crosses 2-hour threshold.

---

### Trigger 3 — Restaurant Preparation Delay → Rating Damage → Income Loss

**What it covers:** Restaurant takes too long to prepare an order. Worker waits helplessly. Delivery arrives late. Customer gives bad rating. Platform algorithm punishes worker with fewer orders the following week. Worker loses income through absolutely zero fault of their own.

| Signal | Source | Threshold |
|---|---|---|
| Restaurant wait time | Platform timestamp logs | Worker waited >15 mins at restaurant |
| Rating damage | Platform rating API | Rating <3 stars within 48hrs of delay |
| Order volume decline | Mock Platform API | Assignments drop >20% vs 4-week baseline |

**Fraud Risk:** Zero — all data from platform's own immutable timestamp logs.
**Payout Speed:** 24–48 hours after algorithmic demotion statistically confirmed.

---

### Trigger 4 — Peak Traffic → Late Delivery → Rating Damage → Income Loss

**What it covers:** Heavy traffic during peak hours causes late delivery. Customer rates poorly. Algorithm demotes worker. Worker loses next week's income — despite the platform's own maps showing the traffic was severe.

| Signal | Source | Threshold |
|---|---|---|
| Traffic congestion | Google Maps Traffic API | Congestion index >75% on delivery route |
| Delivery time overage | Platform timestamp logs | Actual time > estimated time by >15 mins |
| Rating damage | Platform rating API | Rating <3 stars within 2 hours of delay |
| Order volume decline | Mock Platform API | Assignments drop >20% following week |

**Fraud Risk:** Zero — Google Maps, timestamps, and GPS logs are completely independent of worker.
**Payout Speed:** Stage 1 (₹150 flat) within 24 hours. Stage 2 (income delta) within 48 hours.

---

### Trigger 5 — Competitor Zero Delivery Fee Campaign

**What it covers:** Rival platform launches free delivery promotions. Consumers migrate. Worker's platform order volume collapses. Worker sits online and available — but no orders come because customers went elsewhere.

| Signal | Source | Threshold |
|---|---|---|
| Competitor campaign | NewsAPI + social media | Zero delivery fee campaign confirmed |
| Order volume collapse | Mock Platform API | Orders drop >35% vs same day last week |
| Worker was active | Platform online status | Worker logged in and available |
| Other triggers ruled out | All other APIs | No rain, outage, or curfew explains drop |

**Fraud Risk:** Near zero — competitor campaign independently confirmed before trigger opens.
**Payout Speed:** 24 hours after campaign window confirmed and order drop validated.

---

### Trigger 6 — Restaurant Partner Exodus

**What it covers:** Mass restaurant protest causes restaurants to delist from platform overnight. Order supply in worker's zone collapses. Worker is online and ready but there are simply no restaurants generating orders.

**Real Precedent:** Zomato Gold controversy 2019 — hundreds of top restaurants in Delhi and Mumbai simultaneously withdrew overnight, leaving delivery partners with almost no orders.

| Signal | Source | Threshold |
|---|---|---|
| Restaurant count drop | Mock Platform API | Active restaurants in 3km radius drop >65% vs baseline |
| Exodus confirmed | NewsAPI + social scan | Restaurant protest or mass delisting confirmed |
| Order volume collapse | Mock Platform API | Zone orders drop >60% vs same day last week |
| Worker was active | Platform online status | Worker logged in and available |

**Fraud Risk:** Low — zone-wide restaurant collapse is platform-level data worker cannot influence.
**Payout Speed:** 2–4 hours after exodus event confirmed and order collapse validated.

---

### Trigger Summary

| # | Trigger | Category | Fraud Risk | Payout Speed |
|---|---|---|---|---|
| 1 | Heavy Weather & Pollution | Environmental | Near Zero | <60 seconds |
| 2 | Platform App Outage | Technology | Zero | <60 seconds |
| 3 | Restaurant Delay → Rating Damage | Algorithmic Harm | Zero | 24–48 hours |
| 4 | Peak Traffic → Rating Damage | Urban Infrastructure | Zero | 24–48 hours |
| 5 | Competitor Campaign | Market Competition | Near Zero | 24 hours |
| 6 | Restaurant Partner Exodus | Platform Commercial | Low | 2–4 hours |

---

## 4. Weekly Premium Model

**Base Weekly Premium:** ₹49/week

**Dynamic Adjustments (AI-driven per worker zone):**

| Risk Factor | Adjustment |
|---|---|
| Zone historically flood-prone | +₹8 |
| Zone historically safe from waterlogging | -₹5 |
| Worker tenure >6 months, clean record | -₹3 |
| Monsoon season (June–September) | +₹10 |
| High-pollution zone (October–January) | +₹6 |

**Effective Weekly Range:** ₹39–₹72 (average ₹52)
**Annual Cost To Worker:** ~₹2,700
**Maximum Weekly Payout:** ₹2,500

**Payout Formula:**
```
Payout = Worker's avg hourly rate × Disruption hours verified × 0.8

Where:
- Avg hourly rate  = Trailing 4-week average from platform data
- Disruption hours = Hours where trigger active + worker was scheduled online
- 0.8              = 80% income replacement (moral hazard buffer)
```

**Coverage Tiers:**

| Plan | Weekly Premium | Max Weekly Payout | Triggers Covered |
|---|---|---|---|
| GG Basic | ₹29 | ₹800 | Weather + Platform outage |
| GG Standard | ₹52 | ₹2,000 | All 6 triggers |
| GG Pro | ₹89 | ₹4,000 | All 6 + wage delay protection |

---

## 5. AI/ML Integration

### Model 1 — Dynamic Premium Engine
- **Algorithm:** XGBoost (Gradient Boosted Trees)
- **Inputs:** Worker zone (pincode), disruption history, season, worker tenure, platform, claim history
- **Output:** Personalized weekly premium (₹39–₹72)
- **Retraining:** Weekly with new disruption event data

### Model 2 — Fraud Detection Engine
- **Algorithm:** Isolation Forest + Rule-based layer
- **Inputs:** GPS data, timestamps, claim pattern, zone activity, platform data
- **Output:** Fraud confidence score 0–100
  - 0–59 → Auto-approve
  - 60–84 → Flag for manual review
  - 85–100 → Auto-reject
- **Catches:** GPS spoofing, fake weather claims, duplicate submissions, cluster fraud

### Model 3 — Predictive Risk Model
- **Algorithm:** LSTM (time-series neural network)
- **Inputs:** 5 years IMD weather + CPCB AQI + disruption event history per zone
- **Output:** Disruption probability for next 7 days per zone
- **Use case:** Proactive coverage upgrade nudges 48 hours before high-risk events

### Model 4 — Algorithmic Demotion Detector
- **Algorithm:** Z-score anomaly detection on order volume time series
- **Inputs:** Worker's daily order count trailing 4 weeks vs post-rating-damage order count
- **Output:** Demotion confirmed/not confirmed + income impact magnitude

---

## 6. Additional Features

### GG WhatsApp Automation — 3 n8n Workflows

**Workflow 1 — Daily Pre-Shift Briefing**
Every morning at 8:30am every active worker receives a personalized WhatsApp message with today's risk forecast for their zone — rain probability, AQI level, traffic conditions, restaurant availability. Worker starts their shift informed and covered.

**Workflow 2 — Trigger Fire → Payout → Notification**
The moment a trigger fires and payout is processed, worker receives a WhatsApp message with the exact amount credited, what was detected, and what was verified. Worker never needs to open the app. Money arrives with a full explanation.

**Workflow 3 — Weekly Policy Auto-Renewal**
Every Monday at 6am the system auto-renews every worker's policy via Razorpay auto-debit. Success or failure — worker gets a WhatsApp confirmation instantly. 24-hour grace period activated if payment fails.

---

### GG Heat Map
Live Google Maps visualization showing delivery zones color-coded by current risk level — green (safe), yellow (warning), red (active trigger). Updates in real time via Supabase Realtime as trigger states change. Gives workers 30–60 minutes advance warning before a trigger fires.

---

### GG Simulate — "What Would I Have Earned?"
Tool that shows any worker exactly how much GigGuard would have paid them over the last 30 days based on real historical disruption data in their zone. Retroactively runs trigger logic against historical API data and shows the exact payouts that would have been generated. Most powerful conversion tool in the product — the sale makes itself.

---

### GG Passport — Worker Income Passport
A downloadable, verifiable PDF certificate documenting a worker's earnings history, income consistency score, and financial reliability — issued by GigGuard as a third-party verified document. Workers use this to apply for bank loans, rent apartments, and access formal credit — things currently impossible without a salary slip. Generated via jsPDF with QR code verification. Powered by worker-consented bank statement analysis via India's Account Aggregator framework.

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js + Tailwind CSS (PWA) |
| **Backend** | Node.js + Express |
| **ML Services** | Python + FastAPI |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Phone OTP) |
| **Realtime** | Supabase Realtime (GG Heat Map live updates) |
| **Storage** | Supabase Storage (GG Passport PDFs) |
| **Automation** | n8n |
| **Messaging** | WhatsApp Business API (Meta Cloud) |
| **ML Models** | XGBoost + Isolation Forest + SciPy + TensorFlow Lite |
| **Mock Platform API** | Node.js mock server (simulated Zomato/Swiggy data) |
| **Weather** | OpenWeatherMap API + IMD RSS Feed |
| **Air Quality** | CPCB API |
| **Traffic** | Google Maps Traffic API |
| **News** | NewsAPI |
| **Maps** | Google Maps API |
| **Payments** | Razorpay Test Mode |
| **Notifications** | Firebase Cloud Messaging |
| **PDF Generation** | jsPDF |
| **Frontend Deployment** | Vercel |
| **Backend + ML + n8n Deployment** | Railway.app |

**Total External API Cost: ₹0** — all free tiers used throughout.

---

## 8. Platform Choice — PWA

GigGuard is built as a **Progressive Web App (PWA)** — deliberately chosen over a native app.

- Zero app store friction — worker opens a WhatsApp link and the app works instantly
- Every WhatsApp notification is a direct entry point into the app
- Works on ₹5,000 Android devices with low RAM
- Offline policy viewing without internet connection
- One codebase for both worker mobile experience and admin dashboard
- Installable from browser — feels completely native on Android

---

## 9. Development Plan

### Phase 1 — Ideation & Foundation (March 4–20)
- Persona research and scenario definition completed
- 6 parametric triggers designed and justified
- Weekly premium model and payout formula defined
- AI/ML integration plan documented
- Full tech stack finalized
- Repository and README established

### Phase 2 — Automation & Protection (March 21–April 4)
- Worker onboarding flow (3-step, under 3 minutes)
- Supabase schema and database set up
- XGBoost premium calculation model built and deployed
- Triggers 1 and 2 fully automated (weather + platform outage)
- Razorpay payout integration working end to end
- Basic worker PWA dashboard live
- n8n workflows 1, 2, 3 connected and tested
- Mock platform API built with realistic zone data

### Phase 3 — Scale & Optimise (April 5–17)
- Triggers 3, 4, 5, 6 built and tested
- Isolation Forest fraud detection engine deployed
- Full worker dashboard complete
- Admin/insurer dashboard complete (loss ratios, fraud queue, predictive map)
- GG Heat Map live with real-time Supabase updates
- GG Simulate feature built
- GG Passport generation working
- 5-minute final demo video recorded
- Final pitch deck prepared

---

## 10. Repository Structure

```
gigguard/
├── frontend/          → React.js PWA → deployed on Vercel
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           → Node.js + Express → deployed on Railway
│   ├── api/
│   ├── triggers/
│   ├── mock-platform/
│   └── package.json
├── ml/                → Python FastAPI → deployed on Railway
│   ├── models/
│   ├── main.py
│   └── requirements.txt
├── n8n/               → Workflow definitions → deployed on Railway
│   └── workflows/
└── README.md
```

---

## 11. Why GigGuard Is Different

Most teams will build a weather insurance app with a rain API and a payout button.

**GigGuard covers six completely different disruption categories:**

| Category | Industry Standard | GigGuard |
|---|---|---|
| Environmental | ✅ Weather only | ✅ Weather + AQI + extreme heat |
| Technology | ❌ Not covered | ✅ Platform app outage |
| Algorithmic Harm | ❌ Never been done anywhere | ✅ Rating damage from restaurant delays |
| Urban Infrastructure | ❌ Not covered | ✅ Rating damage from peak traffic |
| Market Competition | ❌ Never been done anywhere | ✅ Competitor campaign income protection |
| Platform Commercial | ❌ Never been done anywhere | ✅ Restaurant partner exodus coverage |

**GigGuard is not a weather insurance app.**
**GigGuard is the first financial safety net built for the actual realities of platform-based work in India.**

---

**Thank you for exploring GigGuard. Every delivery partner deserves a financial safety net — and we built one.**
