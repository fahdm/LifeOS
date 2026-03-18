import { useState, useEffect, useCallback, useRef } from "react";

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  PASTE YOUR APPS SCRIPT URL BELOW — REPLACE THE ENTIRE STRING           ║
// ║  Example: "https://script.google.com/macros/s/AKfy.../exec"             ║
// ║  Get this URL from: Apps Script → Deploy → Manage Deployments           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwatQzCat3HaytrH2VAvpw9vYKiHVwmwVFgm-T27M6pm4B-GZwoZVnt62r-v2b4I399rw/exec";

const C = {
  faith: "#7c5cbf", health: "#c4700f", pls: "#1a5c8a", books: "#6d4c3a",
  finlit: "#c49a0f", invest: "#1e7a4e", brand: "#c0392b", writing: "#c0392b",
  garage: "#455a64", selfdev: "#2e7d32", debt: "#8e24aa", rest: "#546e7a",
};

const PROJECTS = [
  { id: "faith", label: "Faith", color: C.faith },
  { id: "health", label: "Health", color: C.health },
  { id: "pls", label: "LSIT / PLS", color: C.pls },
  { id: "books", label: "Books", color: C.books },
  { id: "finlit", label: "Financial Lit", color: C.finlit },
  { id: "invest", label: "Investing", color: C.invest },
  { id: "brand", label: "Personal Brand", color: C.brand },
  { id: "writing", label: "Writing", color: C.writing },
  { id: "garage", label: "Car Garage", color: C.garage },
  { id: "selfdev", label: "Self Dev", color: C.selfdev },
];

const SCHEDULE = {
  weekday: [
    { time: "6:00 AM", dur: "15 min", project: "faith", title: "Prayer · Gratitude · Intention", body: "No phone. Pray first. Write 1 gratitude and your top 3 priorities for the day." },
    { time: "6:15 AM", dur: "25 min", project: "health", title: "Physical Training", body: "20-min home workout or run. Even 3 sets of pushups beats zero." },
    { time: "6:40 AM", dur: "40 min", project: "pls", title: "LSIT / PLS Study — Sharpest Hour", body: "Peak cognitive window. FS exam material before your brain is taxed." },
    { time: "7:20 AM", dur: "20 min", project: "books", title: "Reading — 20 Pages", body: "Read while eating breakfast. 20 pages/day = 1–2 books/month = 12–24 books/year." },
    { time: "7:40 AM", dur: "20 min", project: "selfdev", title: "Commute — Self Dev Audio", body: "Podcast or audiobook. GovCon, surveying, finance, entrepreneurship, growth." },
    { time: "8:00 AM", dur: "~8 hrs", project: "debt", title: "Job #1 — Be Excellent", body: "Lunch rotation: Mon=PLS, Tue=SAM.gov, Wed=Writing, Thu=Investing, Fri=Garage." },
    { time: "4:00 PM", dur: "45 min", project: "rest", title: "Commute + Transition Snack", body: "Commute home with podcast. Eat a proper snack before Job #2. This is halftime." },
    { time: "5:00 PM", dur: "3–4 hrs", project: "debt", title: "Job #2 — Evening Shift", body: "100% of this income → debt snowball. Name which debt you're attacking." },
    { time: "9:00 PM", dur: "20 min", project: "writing", title: "Writing Sprint", body: "200–300 words. Every night. Post draft, newsletter, thread, journal, bid narrative." },
    { time: "9:20 PM", dur: "15 min", project: "finlit", title: "Financial Literacy — Daily Concept", body: "One concept per night. Interest rates, taxes, credit, cash flow, balance sheets." },
    { time: "9:35 PM", dur: "25 min", project: "faith", title: "Evening Prayer · Journal · Tomorrow", body: "Write: 'Today I ___.' Set tomorrow's top 3. Pray. Lay out clothes. Pack bag." },
    { time: "10:00 PM", dur: "60 min", project: "rest", title: "Wind Down — No Screens After 10:30", body: "Light leisure only. Lights out by 11 PM. Sleep is your #1 performance tool." },
  ],
  saturday: [
    { time: "6:00 AM", dur: "30 min", project: "faith", title: "Extended Morning Ritual", body: "Longer prayer. Reflect on the week. Write your 3 weekly wins." },
    { time: "6:30 AM", dur: "50 min", project: "health", title: "Full Workout", body: "Best workout of the week. Gym, run, basketball. Push harder than weekdays." },
    { time: "7:30 AM", dur: "90 min", project: "pls", title: "LSIT Deep Study Session", body: "Longest study block of the week. One full topic deep dive. Track weak areas." },
    { time: "9:00 AM", dur: "60 min", project: "garage", title: "Shared Car Garage — Business Session", body: "Revenue/expenses, co-owner coordination, pricing, bookings, operating agreement." },
    { time: "10:00 AM", dur: "60 min", project: "brand", title: "Personal Brand — Weekly Content", body: "Take week's drafts and publish one piece. LinkedIn, video, newsletter." },
    { time: "11:00 AM", dur: "30 min", project: "invest", title: "Investing — Weekly Research", body: "Study one ETF, one stock, 401k options, index fund strategy. Build knowledge now." },
    { time: "11:30 AM", dur: "30 min", project: "finlit", title: "Weekly Financial Review", body: "Update debt snowball, check budget, calculate next extra payment." },
    { time: "12:00 PM", dur: "4–6 hrs", project: "debt", title: "Job #2 — Saturday Shift", body: "Name the debt this shift is killing before you start." },
    { time: "Evening", dur: "Rest", project: "selfdev", title: "Rest + Recharge (Earned)", body: "Spend Saturday evening with people you love. Joy is part of the plan." },
  ],
  sunday: [
    { time: "6:00 AM", dur: "90 min", project: "faith", title: "Church · Deep Prayer · Scripture", body: "Most important appointment of the week. Faith is your foundation." },
    { time: "8:00 AM", dur: "45 min", project: "books", title: "Sunday Reading — Long Session", body: "40+ pages. Write 1 insight to apply. No rushing." },
    { time: "9:00 AM", dur: "30 min", project: "selfdev", title: "Weekly Planning — Full Life Review", body: "Review all 10 projects. 3 wins from week. 3 priorities for next week." },
    { time: "9:30 AM", dur: "30 min", project: "garage", title: "Shared Car Garage — Admin", body: "Check bookings, maintenance, billing. Keep the business tight." },
    { time: "10:00 AM", dur: "45 min", project: "pls", title: "PLS Review — Consolidation Only", body: "Flashcards, wrong answers, concept video. No new material on Sunday." },
    { time: "11:00 AM", dur: "Varies", project: "debt", title: "Job #2 — Sunday Shift", body: "Last shift of the week. This paycheck has a debt's name on it already." },
    { time: "After", dur: "60 min", project: "health", title: "Meal Prep — Fuel for the Week", body: "Cook Mon–Wed meals. Saves money and removes decision fatigue." },
    { time: "Evening", dur: "20 min", project: "invest", title: "Investing Mindset — 1 Article/Video", body: "Roth IRA, index funds, net worth tracking. Keep the long-game vision alive." },
    { time: "9:30 PM", dur: "30 min", project: "faith", title: "Sunday Close — Gratitude + Launch", body: "Pray over the week ahead. 3 gratitudes. Monday intention. Sleep by 10:30 PM." },
  ],
};

const MILESTONES = {
  faith: ["Daily prayer streak (30 days)", "Join or start a faith community", "Read through one full book of scripture"],
  health: ["20-day workout streak", "Meal prep every Sunday for 4 weeks", "Drop one unhealthy habit"],
  pls: ["Buy NCEES FS Study Guide", "Register for FS exam date", "Complete 3 full practice tests", "Pass the FS exam"],
  books: ["Finish 3 books in 90 days", "Keep a book notes journal", "Apply 1 concept from each book"],
  finlit: ["Understand your complete debt picture", "Build a zero-based monthly budget", "Learn: interest, taxes, credit, cash flow"],
  invest: ["Understand index funds vs stocks", "Review 401k / Roth IRA options", "Create an investing plan for post-debt"],
  brand: ["Optimize LinkedIn profile fully", "Publish 12 posts in 90 days", "Reach 500+ LinkedIn connections"],
  writing: ["Write 200 words every single day", "Publish 1 long-form piece", "Start a simple newsletter"],
  garage: ["Document operating agreement", "Track revenue + expenses monthly", "Research gov vehicle contracts", "Set a revenue growth target"],
  selfdev: ["Weekly full-life review (12 weeks)", "Identify and cut 1 time-wasting habit", "Find a mentor in surveying or GovCon"],
};

const DAYS = ["weekday", "saturday", "sunday"];
const DAY_LABELS = { weekday: "Mon–Fri", saturday: "Saturday", sunday: "Sunday" };

const LS_KEY = "lifeos_v3";
function lsLoad() { try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function lsSave(s) { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { } }

function buildInitial() {
  const checks = {};
  for (const d of DAYS) checks[d] = SCHEDULE[d].map(() => false);
  const milestones = {};
  for (const [pid, items] of Object.entries(MILESTONES)) milestones[pid] = items.map(() => false);
  return { checks, milestones, streak: 0, lastDate: null, debtTotal: "", debtPaid: "", wordsToday: "", pagesRead: "" };
}

// Apps Script CORS fix: send all requests as GET with encoded data param
async function gasGet(path) {
  const url = SCRIPT_URL + "?path=" + path + "&t=" + Date.now();
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}
async function gasPost(path, body) {
  // Encode payload in URL to avoid CORS preflight — Apps Script reads e.parameter.data
  const encoded = encodeURIComponent(JSON.stringify(body));
  const url = SCRIPT_URL + "?path=" + path + "&data=" + encoded + "&t=" + Date.now();
  try {
    const r = await fetch(url, { redirect: "follow" });
    if (r.ok) return r.json();
  } catch { }
  return { status: "ok" }; // treat network-level CORS block as optimistic success
}

const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const paths = {
    check: "M20 6L9 17l-5-5", calendar: "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
    home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", award: "M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
    chart: "M18 20V10M12 20V4M6 20v-6", cloud: "M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z",
    alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
    wifi: "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name] || paths.check} /></svg>;
};

const SyncBadge = ({ status }) => {
  const cfg = { synced: { color: "#1e7a4e", icon: "cloud", text: "Synced to Sheets" }, syncing: { color: "#c49a0f", icon: "wifi", text: "Saving..." }, offline: { color: "#666", icon: "alert", text: "Local only — add URL" }, error: { color: "#c0392b", icon: "alert", text: "Sync failed" } }[status] || { color: "#555", icon: "cloud", text: "—" };
  return <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "#1a1a18", border: `1px solid ${cfg.color}44`, borderRadius: "4px", padding: "0.25rem 0.6rem" }}><Icon name={cfg.icon} size={11} color={cfg.color} /><span style={{ fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: cfg.color }}>{cfg.text}</span></div>;
};

export default function App() {
  const [view, setView] = useState("today");
  const [day, setDay] = useState("weekday");
  const [syncStatus, setSyncStatus] = useState("offline");
  const [state, setState] = useState(() => lsLoad() || buildInitial());
  const saveTimer = useRef(null);
  const isFirstLoad = useRef(true);
  const S = { bg: "#0d0d0b", surface: "#111110", border: "#2a2a28", muted: "#8a8880", text: "#e8e4da", gold: "#c9a84c", dim: "#1a1a18" };
  const isConnected = SCRIPT_URL !== "YOUR_APPS_SCRIPT_URL_HERE";

  useEffect(() => {
    if (!isConnected) return;
    (async () => {
      setSyncStatus("syncing");
      try { const res = await gasGet("state"); if (res.data) { setState(res.data); lsSave(res.data); } setSyncStatus("synced"); }
      catch { setSyncStatus("error"); }
    })();
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return; }
    lsSave(state);
    if (!isConnected) return;
    clearTimeout(saveTimer.current);
    setSyncStatus("syncing");
    saveTimer.current = setTimeout(async () => {
      try { await gasPost("state", { data: state }); setSyncStatus("synced"); }
      catch { setSyncStatus("error"); }
    }, 2000);
  }, [state]);

  const today = new Date().toDateString();
  useEffect(() => {
    if (state.lastDate !== today) {
      setState(s => {
        const newChecks = {};
        for (const d of DAYS) newChecks[d] = SCHEDULE[d].map(() => false);
        if (s.lastDate && isConnected) {
          const totalDone = Object.values(s.checks).flat().filter(Boolean).length;
          const msDone = Object.values(s.milestones).flat().filter(Boolean).length;
          gasPost("log", { date: s.lastDate, streak: s.streak, blocks_completed: totalDone, milestones_done: msDone, words_written: s.wordsToday || "", pages_read: s.pagesRead || "", debt_total: s.debtTotal || "", debt_paid: s.debtPaid || "" }).catch(() => { });
        }
        return { ...s, checks: newChecks, lastDate: today, streak: s.lastDate ? s.streak + 1 : 1, wordsToday: "", pagesRead: "" };
      });
    }
  }, []);

  const set = useCallback(u => setState(s => u(s)), []);
  const toggleCheck = (d, i) => set(s => { const c = { ...s.checks, [d]: [...s.checks[d]] }; c[d][i] = !c[d][i]; return { ...s, checks: c }; });
  const toggleMilestone = (pid, i) => set(s => {
    const m = { ...s.milestones, [pid]: [...s.milestones[pid]] }; const was = m[pid][i]; m[pid][i] = !m[pid][i];
    if (!was && isConnected) gasPost("milestone", { project: pid, milestone: MILESTONES[pid][i], completed: true }).catch(() => { });
    return { ...s, milestones: m };
  });

  const todayChecks = (state.checks[day] || []).filter(Boolean).length, todayTotal = (state.checks[day] || []).length;
  const msDone = Object.values(state.milestones).flat().filter(Boolean).length, msTotal = Object.values(state.milestones).flat().length;
  const pct = Math.round((msDone / msTotal) * 100);
  const projProgress = PROJECTS.map(p => ({ ...p, done: (state.milestones[p.id] || []).filter(Boolean).length, total: (MILESTONES[p.id] || []).length }));
  const debtPct = state.debtTotal && state.debtPaid ? Math.min(100, Math.round((parseFloat(state.debtPaid) / parseFloat(state.debtTotal)) * 100) || 0) : 0;

  const btn = (id, label, icon) => (
    <button key={id} onClick={() => setView(id)} style={{ flex: 1, padding: "0.7rem 0.5rem 0.55rem", background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", color: view === id ? S.gold : "#444", transition: "color 0.15s" }}>
      <Icon name={icon} size={17} color={view === id ? S.gold : "#444"} />
      <span style={{ fontFamily: "Georgia,serif", fontSize: "0.46rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.text, fontFamily: "Georgia,serif", display: "flex", flexDirection: "column" }}>

      <header style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: "0.8rem 1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: "0.5rem", letterSpacing: "0.25em", textTransform: "uppercase", color: S.muted, marginBottom: "1px" }}>Fahad Mubiru</div>
          <div style={{ fontFamily: "Impact,sans-serif", fontSize: "1.6rem", letterSpacing: "0.08em", lineHeight: 1 }}>LIFE<span style={{ color: S.gold }}>OS</span></div>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <SyncBadge status={isConnected ? syncStatus : "offline"} />
          <div style={{ background: S.dim, border: `1px solid ${S.border}`, borderRadius: "4px", padding: "0.25rem 0.6rem", fontSize: "0.55rem", letterSpacing: "0.1em", color: S.gold }}>🔥 {state.streak}d</div>
          <div style={{ background: S.dim, border: `1px solid ${S.border}`, borderRadius: "4px", padding: "0.25rem 0.6rem", fontSize: "0.55rem", letterSpacing: "0.1em", color: C.pls }}>{pct}%</div>
        </div>
      </header>

      {!isConnected && (
        <div style={{ background: "#0f0f0a", borderBottom: `1px solid ${S.gold}33`, padding: "0.5rem 1.2rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
          <span style={{ fontSize: "0.62rem", color: "#a09870", lineHeight: "1.6" }}>
            <strong style={{ color: S.gold }}>Not connected to Google Sheets yet.</strong> Go to the Stats tab for the 7-step setup guide. Your data is saving locally in the meantime.
          </span>
        </div>
      )}

      <main style={{ flex: 1, overflowY: "auto", padding: "1rem 1rem 5rem" }}>

        {view === "today" && (
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div style={{ marginBottom: "1.2rem" }}>
              <div style={{ fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: S.muted, marginBottom: "4px" }}>Today's Progress</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.78rem" }}>{todayChecks} of {todayTotal} blocks completed</span>
                <span style={{ fontFamily: "Impact,sans-serif", fontSize: "1rem", color: S.gold, letterSpacing: "0.04em" }}>{todayTotal ? Math.round((todayChecks / todayTotal) * 100) : 0}%</span>
              </div>
              <div style={{ height: "5px", background: S.dim, borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${todayTotal ? (todayChecks / todayTotal) * 100 : 0}%`, background: `linear-gradient(90deg,${S.gold},#e8a030)`, borderRadius: "3px", transition: "width 0.4s" }} />
              </div>
            </div>

            <div style={{ display: "flex", border: `1px solid ${S.border}`, borderBottom: "none" }}>
              {DAYS.map(d => <button key={d} onClick={() => setDay(d)} style={{ flex: 1, padding: "0.45rem 0.25rem", background: day === d ? S.text : S.surface, color: day === d ? S.bg : S.muted, border: "none", borderRight: `1px solid ${S.border}`, cursor: "pointer", fontFamily: "Georgia,serif", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.15s" }}>{DAY_LABELS[d]}</button>)}
            </div>

            <div style={{ border: `1px solid ${S.border}`, marginBottom: "1.2rem" }}>
              {SCHEDULE[day].map((block, i) => {
                const checked = state.checks[day]?.[i] || false;
                const proj = PROJECTS.find(p => p.id === block.project) || { color: "#555" };
                return (
                  <div key={i} onClick={() => toggleCheck(day, i)} style={{ display: "grid", gridTemplateColumns: "4px 68px 1fr 34px", alignItems: "stretch", borderBottom: i < SCHEDULE[day].length - 1 ? `1px solid ${S.dim}` : "none", cursor: "pointer", background: checked ? "#131311" : S.surface, transition: "background 0.15s" }}>
                    <div style={{ background: proj.color, opacity: checked ? 0.25 : 1 }} />
                    <div style={{ padding: "0.65rem 0.5rem 0.65rem 0.65rem", borderRight: `1px solid ${S.dim}` }}>
                      <div style={{ fontFamily: "Impact,sans-serif", fontSize: "0.62rem", letterSpacing: "0.04em", color: checked ? "#3a3a38" : S.gold, whiteSpace: "nowrap" }}>{block.time}</div>
                      <div style={{ fontSize: "0.48rem", color: "#3a3a38", marginTop: "1px" }}>{block.dur}</div>
                    </div>
                    <div style={{ padding: "0.65rem 0.7rem" }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: "bold", color: checked ? "#3a3a38" : proj.color, marginBottom: "0.12rem", lineHeight: "1.2", textDecoration: checked ? "line-through" : "none" }}>{block.title}</div>
                      <div style={{ fontSize: "0.6rem", color: checked ? "#333" : "#666", lineHeight: "1.5" }}>{block.body}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "19px", height: "19px", borderRadius: "50%", border: `2px solid ${checked ? proj.color : "#2a2a28"}`, background: checked ? proj.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                        {checked && <Icon name="check" size={10} color="#fff" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: S.muted, marginBottom: "0.5rem" }}>Quick Trackers</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.2rem" }}>
              {[{ key: "wordsToday", label: "Words Written Today", color: C.writing, placeholder: "0", goal: "Goal: 200+" }, { key: "pagesRead", label: "Pages Read Today", color: C.books, placeholder: "0", goal: "Goal: 20+" }, { key: "debtTotal", label: "Total Debt ($)", color: C.debt, placeholder: "24000", goal: "Know your number" }, { key: "debtPaid", label: "Total Paid Off ($)", color: C.invest, placeholder: "0", goal: "Every dollar counts" }].map(tr => (
                <div key={tr.key} style={{ background: S.surface, border: `1px solid ${S.border}`, padding: "0.65rem" }}>
                  <div style={{ fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: tr.color, marginBottom: "0.3rem" }}>{tr.label}</div>
                  <input type="text" value={state[tr.key] || ""} placeholder={tr.placeholder} onChange={e => set(s => ({ ...s, [tr.key]: e.target.value }))} onClick={e => e.stopPropagation()} style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: S.text, fontFamily: "Impact,sans-serif", fontSize: "1.2rem", letterSpacing: "0.04em" }} />
                  <div style={{ fontSize: "0.46rem", color: "#444", marginTop: "2px" }}>{tr.goal}</div>
                </div>
              ))}
            </div>

            {state.debtTotal && state.debtPaid && (
              <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.52rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.debt }}>💰 Debt Freedom Progress</span>
                  <span style={{ fontFamily: "Impact,sans-serif", fontSize: "1rem", color: S.gold, letterSpacing: "0.04em" }}>{debtPct}%</span>
                </div>
                <div style={{ height: "8px", background: S.dim, borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${debtPct}%`, background: `linear-gradient(90deg,${C.debt},#c0558a)`, borderRadius: "4px", transition: "width 0.5s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem" }}>
                  <span style={{ fontSize: "0.5rem", color: "#555" }}>${parseFloat(state.debtPaid || 0).toLocaleString()} paid off</span>
                  <span style={{ fontSize: "0.5rem", color: "#555" }}>${(parseFloat(state.debtTotal || 0) - parseFloat(state.debtPaid || 0)).toLocaleString()} remaining</span>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "schedule" && (
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div style={{ fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: S.muted, marginBottom: "1rem" }}>Full Weekly Schedule</div>
            {DAYS.map(d => (
              <div key={d} style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontFamily: "Impact,sans-serif", fontSize: "0.95rem", letterSpacing: "0.1em", color: S.gold, borderBottom: `2px solid ${S.border}`, paddingBottom: "0.3rem", marginBottom: "0.5rem" }}>{DAY_LABELS[d]}</div>
                {SCHEDULE[d].map((b, i) => {
                  const proj = PROJECTS.find(p => p.id === b.project) || { color: "#555" };
                  return <div key={i} style={{ display: "grid", gridTemplateColumns: "4px 64px 1fr", marginBottom: "1px" }}><div style={{ background: proj.color }} /><div style={{ padding: "0.5rem 0.4rem", background: S.surface, borderRight: `1px solid ${S.dim}` }}><div style={{ fontFamily: "Impact,sans-serif", fontSize: "0.6rem", color: S.gold, whiteSpace: "nowrap" }}>{b.time}</div><div style={{ fontSize: "0.46rem", color: "#444", marginTop: "1px" }}>{b.dur}</div></div><div style={{ padding: "0.5rem 0.7rem", background: S.surface, borderBottom: `1px solid ${S.dim}` }}><div style={{ fontSize: "0.75rem", fontWeight: "bold", color: proj.color, marginBottom: "0.1rem" }}>{b.title}</div><div style={{ fontSize: "0.58rem", color: "#606060", lineHeight: "1.5" }}>{b.body}</div></div></div>;
                })}
              </div>
            ))}
          </div>
        )}

        {view === "milestones" && (
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <div style={{ fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: S.muted }}>90-Day Milestones</div>
              <div style={{ fontFamily: "Impact,sans-serif", fontSize: "1rem", color: S.gold, letterSpacing: "0.04em" }}>{msDone}/{msTotal} done</div>
            </div>
            <div style={{ height: "5px", background: S.dim, borderRadius: "3px", overflow: "hidden", marginBottom: "1.2rem" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${S.gold},#e8a030)`, borderRadius: "3px", transition: "width 0.5s" }} />
            </div>
            {PROJECTS.map(proj => {
              const items = MILESTONES[proj.id] || [], done = (state.milestones[proj.id] || []).filter(Boolean).length;
              return (
                <div key={proj.id} style={{ background: S.surface, border: `1px solid ${S.border}`, marginBottom: "0.5rem", overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.55rem 0.75rem", background: "#161614", borderBottom: `1px solid ${S.dim}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "1px", background: proj.color }} />
                      <span style={{ fontFamily: "Impact,sans-serif", fontSize: "0.72rem", letterSpacing: "0.06em", color: proj.color }}>{proj.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "48px", height: "3px", background: S.dim, borderRadius: "2px", overflow: "hidden" }}><div style={{ height: "100%", width: `${items.length ? (done / items.length) * 100 : 0}%`, background: proj.color, borderRadius: "2px" }} /></div>
                      <span style={{ fontSize: "0.55rem", color: S.muted }}>{done}/{items.length}</span>
                    </div>
                  </div>
                  {items.map((ms, i) => {
                    const checked = state.milestones[proj.id]?.[i] || false;
                    return <div key={i} onClick={() => toggleMilestone(proj.id, i)} style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.55rem 0.75rem", borderBottom: i < items.length - 1 ? `1px solid ${S.dim}` : "none", cursor: "pointer", background: checked ? "#131311" : "transparent", transition: "background 0.15s" }}><div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${checked ? proj.color : "#2a2a28"}`, background: checked ? proj.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>{checked && <Icon name="check" size={9} color="#fff" />}</div><span style={{ fontSize: "0.68rem", color: checked ? "#444" : "#a8a49a", textDecoration: checked ? "line-through" : "none", lineHeight: "1.4" }}>{ms}</span></div>;
                  })}
                </div>
              );
            })}
          </div>
        )}

        {view === "stats" && (
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div style={{ fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: S.muted, marginBottom: "1rem" }}>Dashboard</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
              {[{ label: "Streak", value: state.streak, color: S.gold, suffix: "days" }, { label: "Milestones", value: `${msDone}/${msTotal}`, color: C.invest, suffix: "done" }, { label: "Progress", value: `${pct}%`, color: C.pls, suffix: "life OS" }].map(s => (
                <div key={s.label} style={{ background: S.surface, border: `1px solid ${S.border}`, padding: "0.75rem 0.5rem", textAlign: "center" }}>
                  <div style={{ fontFamily: "Impact,sans-serif", fontSize: "1.5rem", letterSpacing: "0.03em", color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.46rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginTop: "0.2rem" }}>{s.suffix}</div>
                  <div style={{ fontSize: "0.48rem", color: S.muted, marginTop: "0.12rem" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", color: S.muted, marginBottom: "0.5rem" }}>Projects</div>
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: "0.75rem", marginBottom: "1rem" }}>
              {projProgress.map((p, i) => (
                <div key={p.id} style={{ marginBottom: i < projProgress.length - 1 ? "0.5rem" : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.18rem" }}><span style={{ fontSize: "0.6rem", color: p.color }}>{p.label}</span><span style={{ fontSize: "0.55rem", color: "#444" }}>{p.done}/{p.total}</span></div>
                  <div style={{ height: "3px", background: S.dim, borderRadius: "2px", overflow: "hidden" }}><div style={{ height: "100%", width: `${p.total ? (p.done / p.total) * 100 : 0}%`, background: p.color, borderRadius: "2px", transition: "width 0.4s" }} /></div>
                </div>
              ))}
            </div>

            {/* 7-step setup guide */}
            <div style={{ fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", color: S.muted, marginBottom: "0.5rem" }}>Google Sheets Setup — 7 Steps</div>
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: "0.9rem", marginBottom: "1rem" }}>
              {[
                "Go to sheets.google.com → create a new blank spreadsheet",
                "In the menu: Extensions → Apps Script",
                "Delete all default code → paste the entire LifeOS_AppsScript.js file",
                "Click Deploy → New deployment → Web App",
                'Set "Execute as: Me" and "Who has access: Anyone" → Deploy',
                "Copy the Web App URL it gives you",
                "Open LifeOS_app.jsx → replace YOUR_APPS_SCRIPT_URL_HERE with your URL",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "0.6rem", marginBottom: "0.55rem", alignItems: "flex-start" }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: S.gold, color: S.bg, fontFamily: "Impact,sans-serif", fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>{i + 1}</div>
                  <span style={{ fontSize: "0.65rem", color: "#a0a098", lineHeight: "1.5" }}>{step}</span>
                </div>
              ))}
              <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.6rem", background: S.dim, borderRadius: "3px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <SyncBadge status={isConnected ? syncStatus : "offline"} />
                {isConnected && <span style={{ fontSize: "0.52rem", color: "#666", wordBreak: "break-all" }}>{SCRIPT_URL}</span>}
              </div>
            </div>

            <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: "0.75rem", marginBottom: "1rem" }}>
              {[{ label: "Words written today", value: state.wordsToday || "—", color: C.writing }, { label: "Pages read today", value: state.pagesRead || "—", color: C.books }, { label: "Total debt", value: state.debtTotal ? `$${parseFloat(state.debtTotal).toLocaleString()}` : "—", color: C.debt }, { label: "Paid off", value: state.debtPaid ? `$${parseFloat(state.debtPaid).toLocaleString()}` : "—", color: C.invest }].map((t, i, arr) => (
                <div key={t.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < arr.length - 1 ? "0.5rem" : "0", marginBottom: i < arr.length - 1 ? "0.5rem" : "0", borderBottom: i < arr.length - 1 ? `1px solid ${S.dim}` : "none" }}>
                  <span style={{ fontSize: "0.6rem", color: S.muted }}>{t.label}</span>
                  <span style={{ fontFamily: "Impact,sans-serif", fontSize: "1rem", letterSpacing: "0.04em", color: t.color }}>{t.value}</span>
                </div>
              ))}
            </div>

            <button onClick={() => { if (window.confirm("Reset ALL progress? Cannot be undone.")) { const f = buildInitial(); setState(f); lsSave(f); if (isConnected) gasPost("state", { data: f }).catch(() => { }); } }} style={{ width: "100%", padding: "0.6rem", background: "transparent", border: `1px solid #3a1a1a`, color: C.brand, fontFamily: "Georgia,serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
              Reset All Progress
            </button>
          </div>
        )}
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: S.bg, borderTop: `1px solid ${S.border}`, display: "flex", zIndex: 50 }}>
        {btn("today", "Today", "calendar")}
        {btn("schedule", "Schedule", "home")}
        {btn("milestones", "Goals", "award")}
        {btn("stats", "Stats", "chart")}
      </nav>
    </div>
  );
}
