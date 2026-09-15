# Expected Q&A — Agada SIH

## Problem & Solution

**Q: What problem are you solving?**
A: Rural healthcare in Maharashtra suffers from three gaps: no clinical decision support at the frontline, referrals that get lost between facilities, and records that vanish when connectivity drops. Agada connects ASHA workers, patients, and doctors through one offline-capable, closed-loop system.

**Q: Why is your solution unique?**
A: Three reasons. One — explainable triage: we don't just return a risk level, we show the exact clinical reasoning. Two — closed-loop referrals: the ASHA sees what happened to her patient after the doctor's review. Three — offline-first: the front-line workflow keeps working with no signal.

**Q: Who is this for?**
A: ASHA workers in rural Maharashtra, PHC/CHC doctors, and district health officers who need real-time visibility.

## Technical

**Q: What is your tech stack?**
A: TypeScript monorepo (Turborepo). Web dashboard in React + Vite + Tailwind. Shared package with typed env, Supabase client, API layer, triage engine, and sync engine. Backend: Supabase (Postgres + Auth). Mobile is Expo + expo-sqlite for future.

**Q: How does the triage engine work?**
A: Rule-based decision engine with WHO/IMCI-aligned thresholds. HIGH triggers include SpO2 < 92, RR > 30 adult / 40 child, chest pain + breathing difficulty, convulsions, temp >= 40 C, systolic >= 180. Every triggered rule surfaces in the UI.

**Q: Why not AI/ML?**
A: Rule-based is the right call for a prototype. It's explainable, auditable, and doesn't need training data. AI can layer on later without changing the interface.

**Q: How does offline sync work?**
A: The ASHA's actions queue locally in a SyncAdapter (currently localStorage; swap for expo-sqlite on mobile with zero code change to the queue). On reconnect, flushQueue applies operations in order with retry, error capture, and a 3-attempt cap. Failed ops surface in a Sync Queue page with per-op retry.

**Q: How do you ensure data integrity?**
A: Row-Level Security on every table. Role-based access — HEALTH_WORKER, DOCTOR, ADMIN. Batched triage inserts run as one server transaction via Supabase.

**Q: Scalability?**
A: Horizontal — Supabase handles the DB layer, stateless web/mobile clients. The sync pattern is designed for high-latency, low-bandwidth networks, which is exactly the rural case.

## Impact & Feasibility

**Q: Cost per user?**
A: Near-zero marginal cost. Supabase free tier handles the pilot. On mobile, the app runs entirely offline except during sync.

**Q: How will you measure impact?**
A: Time-to-referral, referral completion rate, percentage of HIGH-risk patients with recorded outcome, and offline sync success rate.

**Q: What's next after SIH?**
A: Pilot with one PHC. Integrate ABDM/ABHA for patient IDs. Add notification service for referral alerts. Train a risk model on real triage data to augment the rule engine.

## Demo

**Q: What's mocked vs real?**
A: Real: auth, patient CRUD, encounter tracking, triage engine, referral workflow, doctor review, outcome recording, offline sync queue. Mocked: ABDM/eSanjeevani/RCH/HMIS integrations (stubbed interfaces), SMS notifications, teleconsult video.

**Q: Can you show it offline right now?**
A: Yes — click Simulate offline in the top banner.

**Q: What if I asked you to add another symptom to triage?**
A: It's a rule in packages/shared/src/triage/rules.ts. Add a rule entry, rebuild shared, the UI updates automatically.
