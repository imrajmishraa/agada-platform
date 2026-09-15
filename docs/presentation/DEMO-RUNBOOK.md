# Agada — SIH Demo Runbook

Total time target: 6 minutes.

---

## Before you go on stage (5-minute checklist)

- [ ] `npm run build` — 16/16 green
- [ ] `npm run dev --workspace=@agada/web-dashboard` running on http://localhost:3000
- [ ] Two browser windows: one normal, one incognito
- [ ] Both windows not logged in yet
- [ ] WiFi on (or mobile hotspot)
- [ ] Supabase project not paused — open dashboard once to warm it
- [ ] Screen recording of a full successful run ready as fallback
- [ ] Battery above 50%, charger plugged in
- [ ] Notifications silenced on laptop + phone
- [ ] Run the reset script below

### Reset script (fresh demo state)

Open Supabase SQL Editor and run:

    delete from public.referral_events;
    delete from public.clinical_notes;
    delete from public.diagnoses;
    delete from public.referrals;
    delete from public.triage_responses;
    delete from public.triage_assessments;
    delete from public.patient_vitals;
    delete from public.encounters;
    delete from public.patients where phone is null;

    select count(*) as patients from public.patients;

Expected: patients count = 5.

---

## Demo script

### Part 1 — Problem (30 sec, no screen)

"In rural Maharashtra, ASHA workers make critical triage decisions with no clinical decision support, referrals get lost between facilities, and patient records disappear when connectivity drops. Agada fixes all three."

### Part 2 — ASHA login + patient (60 sec)

1. Normal window: http://localhost:3000
2. Login as asha@agada.test / AgadaAsha!2026
3. Land on ASHA Dashboard — point at the stat cards
4. Click Patients, search "Rajan", click Rajan Patil
5. Point at his profile: continuous history, encounters, no paper

### Part 3 — Encounter + Triage (90 sec)

6. Click HOME VISIT, then click the encounter — opens EncounterDetailPage
7. Enter vitals: SpO2 88, temp 38.5
8. Check symptoms: Breathing difficulty, Chest pain
9. Click Run Triage Assessment
10. HIGH RISK card appears — read the "Why" section out loud
11. Say: "Notice the system doesn't just tell her HIGH — it explains why."

### Part 4 — Create referral (45 sec)

12. Click Create Referral (red button on the HIGH risk card)
13. Select Primary Health Centre, Shirur
14. Show the auto-filled reason
15. Click Create Referral — referral appears in list

### Part 5 — Doctor handles referral (90 sec)

16. Incognito window: http://localhost:3000
17. Login as doctor@agada.test / AgadaDoc!2026
18. Doctor dashboard shows the referral with EMERGENCY badge
19. Click it — clinical snapshot with vitals + triage reasoning
20. Click Start Review
21. Write notes: "Acute hypoxia. Started oxygen. Referring to CHC for X-ray."
22. Diagnosis: "Acute respiratory distress"
23. Click Complete Referral

### Part 6 — Closed loop (30 sec)

24. Normal window: refresh the ASHA referral page
25. Doctor Outcome card appears with notes + diagnosis
26. Say: "The loop is closed. The ASHA now knows exactly what happened to her patient."

### Part 7 — Offline (60 sec)

27. Normal window: click Simulate offline
28. Banner turns amber
29. Open another patient, new encounter, bad vitals
30. Run Triage — result appears with Saved locally badge
31. Point at banner: "1 pending"
32. Click Go online — auto-syncs — 0 pending
33. Say: "This is what makes Agada work in villages with 2G, or no signal at all."

### Part 8 — Facility view (20 sec)

34. Log out, login as admin@agada.test / AgadaAdmin!2026
35. Click Facility Dashboard
36. Point at High Risk + Referral Pipeline counts
37. Say: "District officers see the same data in real time."

### Closing line

"Complete patient journey. Closed-loop referral. Offline-first. That's Agada."

---

## Fallback plan

If something breaks mid-demo:

1. Login fails: check Supabase is up. Refresh. Try the incognito account.
2. Triage result doesn't appear: check console. Fall back to the screenshot in docs/presentation/screenshots/.
3. Sync doesn't clear: click Sync now manually. If still stuck, show the sync queue screenshot.
4. Network dies: keep going. Offline mode still works.
5. Anything else: switch to the pre-recorded video, ready in a tab.

---

## Judge Q&A quick reference

See docs/presentation/EXPECTED-QA.md.
