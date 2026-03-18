import {
  useState, useEffect, useCallback, useRef, useMemo, useTransition, memo,
} from "react";

// ─── Global CSS injection ─────────────────────────────────────────────────────
(function injectStyles() {
  if (document.getElementById("lifeos-styles")) return;
  const s = document.createElement("style");
  s.id = "lifeos-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Geist',Georgia,serif;overflow-x:hidden;transition:background-color 0.2s}
    button,input,textarea,select{font-family:inherit}
    div,span,header,footer,nav,main,button,input,textarea,a{
      transition:background-color 0.2s,border-color 0.2s,color 0.2s;
    }
    @keyframes fadeSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes checkBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
    @keyframes msBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
    @keyframes ringOut{from{transform:scale(1);opacity:0.7}to{transform:scale(2.8);opacity:0}}
    @keyframes gradBorder{0%{border-color:#7c5cbf}33%{border-color:#c9a84c}66%{border-color:#1a5c8a}100%{border-color:#7c5cbf}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes debtGrow{from{width:0!important}}
    @keyframes grainShift{0%,100%{transform:translate(0,0)}25%{transform:translate(-1%,-1%)}50%{transform:translate(1%,0)}75%{transform:translate(0,1%)}}
    .view-anim{animation:fadeSlideUp 200ms ease-out}
    .check-bounce{animation:checkBounce 200ms ease-out}
    .ms-bounce{animation:msBounce 200ms ease-out}
    .ring-out{animation:ringOut 400ms ease-out forwards}
    .affirmation{animation:fadeIn 0.5s ease-out 0.5s both,gradBorder 4s linear 0.5s infinite;border:2px solid transparent}
    .debt-bar{animation:debtGrow 1s ease-out 0.3s both}
    .grain-layer{position:fixed;top:-50%;left:-50%;width:200%;height:200%;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity:0.025;pointer-events:none;z-index:998;animation:grainShift 8s steps(10) infinite}
  `;
  document.head.appendChild(s);
})();

// ─── Theme palettes ───────────────────────────────────────────────────────────
const DARK  = { bg:"#0d0d0b", surface:"#111110", border:"#2a2a28", muted:"#8a8880", text:"#e8e4da", gold:"#c9a84c", dim:"#1a1a18" };
const LIGHT = { bg:"#f5f2eb", surface:"#ffffff",  border:"#e0dbd0", muted:"#8a8478", text:"#1a1a16", gold:"#a07830", dim:"#ede9e0" };

// ─── Project colors ───────────────────────────────────────────────────────────
const C = {
  faith:"#7c5cbf", health:"#c4700f", pls:"#1a5c8a", books:"#6d4c3a",
  finlit:"#c49a0f", invest:"#1e7a4e", brand:"#c0392b", writing:"#c0392b",
  garage:"#455a64", selfdev:"#2e7d32", debt:"#8e24aa", rest:"#546e7a",
};

const PROJECTS = [
  { id:"faith",   label:"Faith",          color:C.faith   },
  { id:"health",  label:"Health",         color:C.health  },
  { id:"pls",     label:"LSIT / PLS",     color:C.pls     },
  { id:"books",   label:"Books",          color:C.books   },
  { id:"finlit",  label:"Financial Lit",  color:C.finlit  },
  { id:"invest",  label:"Investing",      color:C.invest  },
  { id:"brand",   label:"Personal Brand", color:C.brand   },
  { id:"writing", label:"Writing",        color:C.writing },
  { id:"garage",  label:"Car Garage",     color:C.garage  },
  { id:"selfdev", label:"Self Dev",       color:C.selfdev },
];

const SCHEDULE = {
  mon: [
    { time:"6:00 AM",  dur:"15 min",  project:"faith",   title:"Fajr · Gratitude · Intention",        body:"No phone. Fajr first. Write 1 gratitude + this week's #1 priority. Monday sets the tone." },
    { time:"6:15 AM",  dur:"25 min",  project:"health",  title:"Physical Training",                   body:"Start the week with movement. 20-min home workout or run. Monday momentum is real." },
    { time:"6:40 AM",  dur:"40 min",  project:"pls",     title:"LSIT — New Topic Monday",             body:"Start a fresh topic. Monday brain is sharpest. Treat this like your first class of the week." },
    { time:"7:20 AM",  dur:"20 min",  project:"books",   title:"Reading — 20 Pages",                  body:"Read while eating breakfast. 20 pages/day = 12–24 books/year." },
    { time:"7:40 AM",  dur:"20 min",  project:"selfdev", title:"Commute — Self Dev Audio",            body:"GovCon, surveying, finance, or entrepreneurship podcast. Set Monday mindset on the drive." },
    { time:"8:00 AM",  dur:"~8 hrs",  project:"debt",    title:"Job #1 — Be Excellent",               body:"Lunch: PLS study session — 20 focused minutes. Every dollar earned goes to the mission. Be the sharpest person in the room." },
    { time:"4:00 PM",  dur:"45 min",  project:"rest",    title:"Commute + Transition Snack",          body:"Commute home with podcast. Eat a proper snack before Job #2. This is halftime." },
    { time:"5:00 PM",  dur:"3–4 hrs", project:"debt",    title:"Job #2 — Evening Shift",              body:"100% of this income → debt snowball. Name which debt you're attacking tonight." },
    { time:"9:00 PM",  dur:"20 min",  project:"writing", title:"Writing Sprint — Weekly Intention",   body:"Draft a post, intention thread, or bid narrative opener. Monday sets your content tone for the week." },
    { time:"9:20 PM",  dur:"15 min",  project:"finlit",  title:"Financial Lit — Debt Mechanics",      body:"Study: interest rates, compounding, and how debt works against you. Know your enemy." },
    { time:"9:35 PM",  dur:"25 min",  project:"faith",   title:"Isha · Journal · Tomorrow",           body:"Write: 'Today I ___.' Set Tuesday's top 3. Pray Isha. Lay out clothes. Pack bag." },
    { time:"10:00 PM", dur:"60 min",  project:"rest",    title:"Wind Down — No Screens After 10:30",  body:"Light leisure only. Lights out by 11 PM. Sleep is your #1 performance tool." },
  ],
  tue: [
    { time:"6:00 AM",  dur:"15 min",  project:"faith",   title:"Fajr · Gratitude · Intention",        body:"No phone. Fajr first. Tuesday = execute. Write 1 gratitude and your top 3 for today." },
    { time:"6:15 AM",  dur:"25 min",  project:"health",  title:"Physical Training",                   body:"Consistent beats perfect. Show up even on tired Tuesday. Your streak depends on it." },
    { time:"6:40 AM",  dur:"40 min",  project:"pls",     title:"LSIT — Practice Problems",            body:"Work problems, not just notes. Tuesday = drill. Identify what you still don't understand." },
    { time:"7:20 AM",  dur:"20 min",  project:"books",   title:"Reading — 20 Pages",                  body:"Carry the book. 20 pages before you're out the door. No skipping." },
    { time:"7:40 AM",  dur:"20 min",  project:"selfdev", title:"Commute — Self Dev Audio",            body:"GovCon, entrepreneurship, or surveying podcast. Fill the dead commute time intentionally." },
    { time:"8:00 AM",  dur:"~8 hrs",  project:"debt",    title:"Job #1 — Be Excellent",               body:"Lunch: SAM.gov research — 20 min on new federal awards, NAICS codes, agency trends. Build the GovCon pipeline." },
    { time:"4:00 PM",  dur:"45 min",  project:"rest",    title:"Commute + Transition Snack",          body:"Commute home. Transition intentionally — this is halftime between jobs." },
    { time:"5:00 PM",  dur:"3–4 hrs", project:"debt",    title:"Job #2 — Evening Shift",              body:"Name the debt. Work the shift. 100% income → snowball." },
    { time:"9:00 PM",  dur:"20 min",  project:"writing", title:"Writing Sprint — Case Study Draft",   body:"Draft a surveying case study, GovCon story, or bid narrative. Real content from real work." },
    { time:"9:20 PM",  dur:"15 min",  project:"finlit",  title:"Financial Lit — Taxes & Deductions",  body:"Study: tax brackets, self-employment taxes, deductions. Surveying and business tax basics." },
    { time:"9:35 PM",  dur:"25 min",  project:"faith",   title:"Isha · Journal · Tomorrow",           body:"Write: 'Today I ___.' Set Wednesday's top 3. Pray Isha. Lay out clothes. Pack bag." },
    { time:"10:00 PM", dur:"60 min",  project:"rest",    title:"Wind Down — No Screens After 10:30",  body:"Light leisure only. Lights out by 11 PM. Rest is productive." },
  ],
  wed: [
    { time:"6:00 AM",  dur:"15 min",  project:"faith",   title:"Fajr · Gratitude · Intention",        body:"No phone. Fajr first. Hump day — you're halfway there. Write 1 gratitude + today's focus." },
    { time:"6:15 AM",  dur:"25 min",  project:"health",  title:"Physical Training",                   body:"Push hard Wednesday. You're in the middle of the week — don't let up now." },
    { time:"6:40 AM",  dur:"40 min",  project:"pls",     title:"LSIT — Weak Areas Focus",             body:"Attack the topics you're least confident in. Discomfort = growth. Wednesday is for grinding." },
    { time:"7:20 AM",  dur:"20 min",  project:"books",   title:"Reading — 20 Pages",                  body:"20 pages, apply 1 concept. Midweek reading keeps the habit unbroken." },
    { time:"7:40 AM",  dur:"20 min",  project:"selfdev", title:"Commute — Self Dev Audio",            body:"Leadership, business, or mindset podcast. Midweek energy injection." },
    { time:"8:00 AM",  dur:"~8 hrs",  project:"debt",    title:"Job #1 — Be Excellent",               body:"Lunch: 200-word writing draft — post, newsletter, or bid. Get words on paper at lunch, polish tonight." },
    { time:"4:00 PM",  dur:"45 min",  project:"rest",    title:"Commute + Transition Snack",          body:"Commute home. Recharge. You've got one more push left tonight." },
    { time:"5:00 PM",  dur:"3–4 hrs", project:"debt",    title:"Job #2 — Evening Shift",              body:"Name the debt. Hump day shift — you can see the weekend from here." },
    { time:"9:00 PM",  dur:"20 min",  project:"writing", title:"Writing Sprint — Long-Form Draft",    body:"Newsletter draft, LinkedIn article, or technical explainer. Wednesday = your writing day." },
    { time:"9:20 PM",  dur:"15 min",  project:"finlit",  title:"Financial Lit — Credit & Score",      body:"Study: credit utilization, payment history, score factors. Your credit is a tool — learn it." },
    { time:"9:35 PM",  dur:"25 min",  project:"faith",   title:"Isha · Journal · Tomorrow",           body:"Write: 'Today I ___.' Set Thursday's top 3. Pray Isha. Lay out clothes. Pack bag." },
    { time:"10:00 PM", dur:"60 min",  project:"rest",    title:"Wind Down — No Screens After 10:30",  body:"Light leisure only. Lights out by 11 PM." },
  ],
  thu: [
    { time:"6:00 AM",  dur:"15 min",  project:"faith",   title:"Fajr · Gratitude · Intention",        body:"No phone. Fajr first. Tomorrow is Jumu'ah — prepare your heart. Write 1 gratitude + today's focus." },
    { time:"6:15 AM",  dur:"25 min",  project:"health",  title:"Physical Training",                   body:"Strong Thursday. One more push day before the weekend. Keep the streak alive." },
    { time:"6:40 AM",  dur:"40 min",  project:"pls",     title:"LSIT — Review & Reinforce",           body:"Go back over this week's material. What stuck? What didn't? Thursday = consolidation day." },
    { time:"7:20 AM",  dur:"20 min",  project:"books",   title:"Reading — 20 Pages",                  body:"20 pages. Write 1 insight to apply. You're close to finishing another book this week." },
    { time:"7:40 AM",  dur:"20 min",  project:"selfdev", title:"Commute — Self Dev Audio",            body:"Investing or entrepreneurship audio. Prep your mind for Friday's energy and Jumu'ah." },
    { time:"8:00 AM",  dur:"~8 hrs",  project:"debt",    title:"Job #1 — Be Excellent",               body:"Lunch: Investing research — 1 ETF, 1 stock, or 1 concept. Build knowledge now before the money arrives." },
    { time:"4:00 PM",  dur:"45 min",  project:"rest",    title:"Commute + Transition Snack",          body:"Commute home. Tomorrow is Jumu'ah — let Thursday's evening be intentional and calm." },
    { time:"5:00 PM",  dur:"3–4 hrs", project:"debt",    title:"Job #2 — Evening Shift",              body:"Name the debt. Thursday shift — you're almost at Friday. Finish strong." },
    { time:"9:00 PM",  dur:"20 min",  project:"writing", title:"Writing Sprint — Insight Post",       body:"Surveying insight, GovCon tip, or lessons-learned post. Thursday is for real-talk content." },
    { time:"9:20 PM",  dur:"15 min",  project:"finlit",  title:"Financial Lit — Cash Flow",           body:"Study: cash flow statements, budgeting, income vs. expenses. Know where every dollar goes." },
    { time:"9:35 PM",  dur:"25 min",  project:"faith",   title:"Isha · Reflect · Prepare for Jumu'ah", body:"Make niyyah for Jumu'ah. Write: 'Today I ___.' Set Friday's top 3. Pray Isha. Sleep early." },
    { time:"10:00 PM", dur:"60 min",  project:"rest",    title:"Wind Down — Sleep by 10:30",          body:"Sleep early tonight. Jumu'ah is the most important appointment of the week." },
  ],
  fri: [
    { time:"6:00 AM",  dur:"15 min",  project:"faith",   title:"Fajr · Sunnah · Surah Al-Kahf",       body:"Blessed Friday. Read Surah Al-Kahf or first/last 10 ayat. Send salawat on the Prophet ﷺ. Begin this day with light." },
    { time:"6:15 AM",  dur:"25 min",  project:"health",  title:"Physical Training — Friday Energy",   body:"Light-to-moderate workout. Be sharp for Jumu'ah, not drained. Niyyah: health is an amanah." },
    { time:"6:40 AM",  dur:"40 min",  project:"pls",     title:"LSIT — Mock Questions",               body:"Friday = test yourself. 15–20 timed questions. Track your score. Grade honestly." },
    { time:"7:20 AM",  dur:"20 min",  project:"books",   title:"Reading — 20 Pages",                  body:"Finish your reading streak for the week. 20 pages before commute." },
    { time:"7:40 AM",  dur:"20 min",  project:"selfdev", title:"Commute — Friday Mindset",            body:"Recite dhikr or listen to a khutbah recording. Prepare your heart and mind for Jumu'ah." },
    { time:"8:00 AM",  dur:"~4 hrs",  project:"debt",    title:"Job #1 — Morning Block",              body:"Work hard before midday. Cover your morning strong. Jumu'ah at noon belongs to Allah — protect it." },
    { time:"12:00 PM", dur:"45 min",  project:"faith",   title:"Jumu'ah Prayer at the Masjid",        body:"The most important appointment of the week. Be early. Listen fully to the khutbah. Make sincere du'a after salah." },
    { time:"1:00 PM",  dur:"~3 hrs",  project:"debt",    title:"Job #1 — Afternoon Block",            body:"Back to work. Lunch: Garage business check — bookings, revenue, admin. Finish the afternoon strong." },
    { time:"4:00 PM",  dur:"45 min",  project:"rest",    title:"Commute + Transition Snack",          body:"Jumu'ah mubarak. Commute home reflecting on the khutbah. Fuel up before Job #2." },
    { time:"5:00 PM",  dur:"3–4 hrs", project:"debt",    title:"Job #2 — Friday Night Shift",         body:"End the workweek strong. Name the debt. This Friday shift = real freedom getting closer." },
    { time:"9:00 PM",  dur:"20 min",  project:"writing", title:"Writing Sprint — Week in Review",     body:"What happened this week? What did you learn? Draft a reflection, post, or lesson thread." },
    { time:"9:35 PM",  dur:"30 min",  project:"faith",   title:"Isha · Weekly Gratitude · Du'a",      body:"Long du'a tonight. Thank Allah for the week. What did He provide? Set intentions for Saturday." },
    { time:"10:05 PM", dur:"55 min",  project:"rest",    title:"Wind Down — Earned Rest",             body:"Friday night rest is earned. Light leisure. No screens after 10:30. Lights out by 11 PM." },
  ],
  sat: [
    { time:"6:00 AM",  dur:"30 min",    project:"faith",   title:"Fajr · Weekly Reflection",              body:"Longer prayer and dhikr. Reflect on the week. Write 3 weekly wins and shortcomings to improve." },
    { time:"6:30 AM",  dur:"50 min",    project:"health",  title:"Full Workout — Best of the Week",       body:"Gym, run, basketball. Push hardest on Saturday. This is your longest training block of the week." },
    { time:"7:30 AM",  dur:"90 min",    project:"pls",     title:"LSIT Deep Study Session",               body:"Longest study block of the week. One full topic deep dive. Track and log weak areas afterward." },
    { time:"9:00 AM",  dur:"60 min",    project:"garage",  title:"Shared Car Garage — Business Session",  body:"Revenue, expenses, co-owner coordination, pricing, bookings, operating agreement." },
    { time:"10:00 AM", dur:"60 min",    project:"brand",   title:"Personal Brand — Weekly Content",       body:"Take week's drafts and publish one piece. LinkedIn, video, newsletter. Ship it — done is better than perfect." },
    { time:"11:00 AM", dur:"30 min",    project:"invest",  title:"Investing — Weekly Research",           body:"Study one ETF, one stock, 401k options, index fund strategy. Build knowledge now before the money arrives." },
    { time:"11:30 AM", dur:"30 min",    project:"finlit",  title:"Weekly Financial Review",               body:"Update debt snowball, check budget, calculate next extra payment. Know your numbers cold." },
    { time:"12:00 PM", dur:"4–6 hrs",   project:"debt",    title:"Job #2 — Saturday Shift",               body:"Name the debt this shift is eliminating before you start. This money has one job." },
    { time:"Evening",  dur:"Rest",      project:"selfdev", title:"Rest + Recharge (Earned)",              body:"Spend Saturday evening with people you love. Joy and connection are part of the plan." },
  ],
  sun: [
    { time:"6:00 AM",  dur:"90 min",    project:"faith",   title:"Fajr at the Masjid · Quran · Reflection", body:"Most important morning of the week. Pray at the Masjid if possible. Read Quran. Let Sunday begin with Allah." },
    { time:"8:00 AM",  dur:"45 min",    project:"books",   title:"Sunday Reading — Long Session",           body:"40+ pages. Write 1 insight to apply this week. No rushing. Let your mind breathe and absorb." },
    { time:"9:00 AM",  dur:"30 min",    project:"selfdev", title:"Weekly Planning — Full Life Review",      body:"Review all 10 projects. 3 wins from the week. 3 priorities for next week. Set your intentions." },
    { time:"9:30 AM",  dur:"30 min",    project:"garage",  title:"Shared Car Garage — Admin",               body:"Check bookings, maintenance, billing, co-owner updates. Keep the business organized." },
    { time:"10:00 AM", dur:"45 min",    project:"pls",     title:"PLS Review — Consolidation Only",         body:"Flashcards, wrong answers, concept video. No new material on Sunday. Reinforce, don't rush." },
    { time:"11:00 AM", dur:"Varies",    project:"debt",    title:"Job #2 — Sunday Shift",                   body:"Last shift of the week. This paycheck has a debt's name on it already. End the week strong." },
    { time:"After",    dur:"60 min",    project:"health",  title:"Meal Prep — Fuel for the Week",           body:"Cook Mon–Wed meals. Saves money and removes decision fatigue during the week ahead." },
    { time:"Evening",  dur:"20 min",    project:"invest",  title:"Investing Mindset — 1 Article/Video",    body:"Roth IRA, index funds, net worth tracking. Keep the long-game vision alive every single week." },
    { time:"9:30 PM",  dur:"30 min",    project:"faith",   title:"Isha · Gratitude · Week Launch Du'a",     body:"Make du'a over the week ahead. 3 gratitudes. Set Monday's intention clearly. Sleep by 10:30 PM." },
  ],
};

const MILESTONES = {
  faith:   ["Daily prayer streak (30 days)", "Join or start a faith community", "Read through one full book of scripture"],
  health:  ["20-day workout streak", "Meal prep every Sunday for 4 weeks", "Drop one unhealthy habit"],
  pls:     ["Buy NCEES FS Study Guide", "Register for FS exam date", "Complete 3 full practice tests", "Pass the FS exam"],
  books:   ["Finish 3 books in 90 days", "Keep a book notes journal", "Apply 1 concept from each book"],
  finlit:  ["Understand your complete debt picture", "Build a zero-based monthly budget", "Learn: interest, taxes, credit, cash flow"],
  invest:  ["Understand index funds vs stocks", "Review 401k / Roth IRA options", "Create an investing plan for post-debt"],
  brand:   ["Optimize LinkedIn profile fully", "Publish 12 posts in 90 days", "Reach 500+ LinkedIn connections"],
  writing: ["Write 200 words every single day", "Publish 1 long-form piece", "Start a simple newsletter"],
  garage:  ["Document operating agreement", "Track revenue + expenses monthly", "Research gov vehicle contracts", "Set a revenue growth target"],
  selfdev: ["Weekly full-life review (12 weeks)", "Identify and cut 1 time-wasting habit", "Find a mentor in surveying or GovCon"],
};

const PLS_TOPICS = [
  "Survey Math & Computations",
  "Coordinate Systems & Projections",
  "Measurement & Error Analysis",
  "Vertical Control & Leveling",
  "Horizontal Control & Traversing",
  "Geodesy & Geodetic Surveys",
  "Photogrammetry & Remote Sensing",
  "Geographic Information Systems",
  "Hydrographic Surveying",
  "Route & Construction Surveying",
  "Topographic Mapping",
  "Subdivision Design & Platting",
  "Boundary Law & Title Research",
  "Land Descriptions & Deeds",
  "Legal Principles of Surveying",
  "Equipment & Field Procedures",
  "Professional Practice & Ethics",
  "Business & Project Management",
];

const PLS_STATUSES = ["Not Started", "Studying", "Weak", "Strong", "Mastered"];
const PLS_STATUS_COLORS = ["#3a3a38", C.pls, "#c0392b", C.invest, "#16a34a"];

const AFFIRMATIONS = [
  "I am disciplined enough to build the life I envision.",
  "Every block completed is a brick in my foundation.",
  "I outwork doubt with action.",
  "Faith first. Everything else follows.",
  "Debt is temporary. Freedom is the destination.",
  "I don't wait for motivation. I create it.",
  "Every exam passed is a door opened.",
  "I am becoming the man my future self is proud of.",
  "Small daily habits compound into extraordinary results.",
  "My consistency is my competitive advantage.",
];

const DAYS_7 = ["mon","tue","wed","thu","fri","sat","sun"];
const DAY_LABELS_7 = { mon:"Monday", tue:"Tuesday", wed:"Wednesday", thu:"Thursday", fri:"Friday", sat:"Saturday", sun:"Sunday" };
const DAY_SHORT_7  = { mon:"Mo", tue:"Tu", wed:"We", thu:"Th", fri:"Fr", sat:"Sa", sun:"Su" };

function getTodayKey() {
  return ["sun","mon","tue","wed","thu","fri","sat"][new Date().getDay()];
}

// ─── Storage ──────────────────────────────────────────────────────────────────
const LS_KEY   = "lifeos_v3";
const LS_THEME = "lifeos_theme";

function lsLoad() {
  try {
    const r = localStorage.getItem(LS_KEY);
    if (!r) return null;
    const s = JSON.parse(r);
    if (!s.plsTopics) s.plsTopics = new Array(PLS_TOPICS.length).fill(0);
    // Migrate from 3-group checks (weekday/saturday/sunday) to 7-day keys
    if (s.checks && (s.checks.weekday !== undefined || !s.checks.mon)) {
      const fresh = {};
      for (const d of DAYS_7) fresh[d] = SCHEDULE[d].map(() => false);
      s.checks = fresh;
    }
    // Ensure all 7 days exist with correct block counts
    for (const d of DAYS_7) {
      if (!s.checks[d] || s.checks[d].length !== SCHEDULE[d].length) {
        s.checks[d] = SCHEDULE[d].map(() => false);
      }
    }
    return s;
  } catch { return null; }
}
function lsSave(s) { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {} }

function buildInitial() {
  const checks = {};
  for (const d of DAYS_7) checks[d] = SCHEDULE[d].map(() => false);
  const milestones = {};
  for (const [pid, items] of Object.entries(MILESTONES)) milestones[pid] = items.map(() => false);
  return {
    checks, milestones, streak:0, lastDate:null,
    debtTotal:"", debtPaid:"", wordsToday:"", pagesRead:"",
    plsTopics: new Array(PLS_TOPICS.length).fill(0),
  };
}

// ─── Apps Script API ──────────────────────────────────────────────────────────
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwatQzCat3HaytrH2VAvpw9vYKiHVwmwVFgm-T27M6pm4B-GZwoZVnt62r-v2b4I399rw/exec";

async function gasGet(path) {
  const url = SCRIPT_URL + "?path=" + path + "&t=" + Date.now();
  const r = await fetch(url, { redirect:"follow" });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}
async function gasPost(path, body) {
  const encoded = encodeURIComponent(JSON.stringify(body));
  const url = SCRIPT_URL + "?path=" + path + "&data=" + encoded + "&t=" + Date.now();
  try {
    const r = await fetch(url, { redirect:"follow" });
    if (r.ok) return r.json();
    throw new Error(r.status);
  } catch (err) {
    // treat opaque CORS responses as success; re-throw real errors
    if (err instanceof TypeError) return { status:"ok" };
    throw err;
  }
}

// ─── Icon ─────────────────────────────────────────────────────────────────────
const ICON_PATHS = {
  check:    "M20 6L9 17l-5-5",
  calendar: "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
  home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  award:    "M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  chart:    "M18 20V10M12 20V4M6 20v-6",
  cloud:    "M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z",
  alert:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  wifi:     "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  moon:     "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  sun:      "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z",
  book:     "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
};

const Icon = ({ name, size=16, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={ICON_PATHS[name] || ICON_PATHS.check} />
  </svg>
);

// ─── SyncBadge ────────────────────────────────────────────────────────────────
const SyncBadge = ({ status, S }) => {
  const cfg = {
    synced:  { color:"#1e7a4e", icon:"cloud", text:"Synced" },
    syncing: { color:"#c49a0f", icon:"wifi",  text:"Saving…" },
    offline: { color:"#666",    icon:"alert", text:"Local only" },
    error:   { color:"#c0392b", icon:"alert", text:"Sync error" },
  }[status] || { color:"#555", icon:"cloud", text:"—" };
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"0.3rem", background:S.dim,
      border:`1px solid ${cfg.color}44`, borderRadius:"6px", padding:"0.25rem 0.6rem" }}>
      <Icon name={cfg.icon} size={11} color={cfg.color} />
      <span style={{ fontSize:"0.52rem", letterSpacing:"0.1em", textTransform:"uppercase", color:cfg.color }}>{cfg.text}</span>
    </div>
  );
};

// ─── ScheduleBlock (memo) ─────────────────────────────────────────────────────
const ScheduleBlock = memo(function ScheduleBlock({ block, index, dayLen, checked, onToggle, S, projColor }) {
  const [bouncing, setBouncing] = useState(false);
  const handleClick = () => {
    if (!checked) { setBouncing(true); setTimeout(() => setBouncing(false), 250); }
    onToggle();
  };
  return (
    <div onClick={handleClick} style={{ display:"grid", gridTemplateColumns:"4px 68px 1fr 34px", alignItems:"stretch",
      borderBottom: index < dayLen - 1 ? `1px solid ${S.dim}` : "none",
      cursor:"pointer", background: checked ? S.dim : S.surface }}>
      <div style={{ background:projColor, opacity:checked ? 0.25 : 1 }} />
      <div style={{ padding:"0.65rem 0.5rem 0.65rem 0.65rem", borderRight:`1px solid ${S.dim}` }}>
        <div style={{ fontFamily:"Impact,sans-serif", fontSize:"0.62rem", letterSpacing:"0.04em",
          color:checked ? S.muted : S.gold, whiteSpace:"nowrap" }}>{block.time}</div>
        <div style={{ fontSize:"0.48rem", color:S.muted, opacity:0.5, marginTop:"1px" }}>{block.dur}</div>
      </div>
      <div style={{ padding:"0.65rem 0.7rem" }}>
        <div style={{ fontSize:"0.78rem", fontWeight:"600", color:checked ? S.muted : projColor,
          marginBottom:"0.12rem", lineHeight:"1.2", textDecoration:checked ? "line-through" : "none" }}>{block.title}</div>
        <div style={{ fontSize:"0.6rem", color:checked ? S.muted : S.muted, opacity:checked ? 0.4 : 0.7, lineHeight:"1.5" }}>{block.body}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div className={bouncing ? "check-bounce" : ""} style={{ width:"19px", height:"19px", borderRadius:"50%",
          border:`2px solid ${checked ? projColor : S.border}`, background:checked ? projColor : "transparent",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {checked && <Icon name="check" size={10} color="#fff" />}
        </div>
      </div>
    </div>
  );
});

// ─── PLSTestForm ──────────────────────────────────────────────────────────────
const PLSTestForm = memo(function PLSTestForm({ S, onSubmit }) {
  const [form, setForm] = useState({ score:"", total:"18", notes:"" });
  const handle = (k) => (e) => setForm(f => ({ ...f, [k]:e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.score) return;
    onSubmit({ date:new Date().toLocaleDateString(), ...form });
    setForm({ score:"", total:"18", notes:"" });
  };
  const inp = { width:"100%", background:"transparent", border:`1px solid ${S.border}`,
    borderRadius:"4px", padding:"0.4rem 0.5rem", color:S.text, fontSize:"0.7rem", outline:"none" };
  return (
    <form onSubmit={submit} style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:"6px", padding:"0.75rem" }}>
      <div style={{ fontSize:"0.52rem", letterSpacing:"0.15em", textTransform:"uppercase", color:C.pls, marginBottom:"0.6rem" }}>Log Practice Test</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginBottom:"0.5rem" }}>
        <div>
          <div style={{ fontSize:"0.48rem", color:S.muted, marginBottom:"0.2rem" }}>Score</div>
          <input style={inp} type="number" placeholder="e.g. 14" value={form.score} onChange={handle("score")} min="0" />
        </div>
        <div>
          <div style={{ fontSize:"0.48rem", color:S.muted, marginBottom:"0.2rem" }}>Out of</div>
          <input style={inp} type="number" placeholder="18" value={form.total} onChange={handle("total")} min="1" />
        </div>
      </div>
      <div style={{ marginBottom:"0.5rem" }}>
        <div style={{ fontSize:"0.48rem", color:S.muted, marginBottom:"0.2rem" }}>Notes / Weak Areas</div>
        <textarea style={{ ...inp, resize:"vertical", minHeight:"52px" }} placeholder="Topics to review…" value={form.notes} onChange={handle("notes")} />
      </div>
      <button type="submit" style={{ width:"100%", padding:"0.5rem", background:C.pls, border:"none", borderRadius:"4px",
        color:"#fff", fontSize:"0.6rem", letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer" }}>
        Save Test Result
      </button>
    </form>
  );
});

// ─── TodayView ────────────────────────────────────────────────────────────────
function TodayView({ state, set, day, setDay, S, isConnected }) {
  const affirmation = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];
  const dateStr = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  const todayChecks = useMemo(() => (state.checks[day] || []).filter(Boolean).length, [state.checks, day]);
  const todayTotal  = (state.checks[day] || []).length;
  const allDone     = todayTotal > 0 && todayChecks === todayTotal;

  const debtPct = useMemo(() => {
    if (!state.debtTotal || !state.debtPaid) return 0;
    return Math.min(100, Math.round((parseFloat(state.debtPaid) / parseFloat(state.debtTotal)) * 100) || 0);
  }, [state.debtTotal, state.debtPaid]);

  const toggleCheck = useCallback((d, i) => {
    set(s => { const c = { ...s.checks, [d]:[...s.checks[d]] }; c[d][i] = !c[d][i]; return { ...s, checks:c }; });
  }, [set]);

  return (
    <div style={{ maxWidth:"640px", margin:"0 auto" }}>
      {/* Affirmation */}
      <div className="affirmation" style={{ background:S.surface, borderRadius:"6px", padding:"0.65rem 0.75rem", marginBottom:"1rem" }}>
        <div style={{ fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase", color:C.faith, marginBottom:"0.2rem" }}>Daily Affirmation</div>
        <div style={{ fontSize:"0.72rem", color:S.text, lineHeight:"1.5", fontStyle:"italic" }}>"{affirmation}"</div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom:"1.2rem" }}>
        <div style={{ fontSize:"0.48rem", letterSpacing:"0.15em", textTransform:"uppercase", color:S.muted, marginBottom:"2px" }}>{dateStr}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"0.4rem" }}>
          <span style={{ fontSize:"0.78rem", color:S.text }}>
            {allDone ? "Day Complete 🔥" : `${todayChecks} of ${todayTotal} blocks completed`}
          </span>
          <span style={{ fontFamily:"Impact,sans-serif", fontSize:"1rem", color:S.gold, letterSpacing:"0.04em" }}>
            {todayTotal ? Math.round((todayChecks / todayTotal) * 100) : 0}%
          </span>
        </div>
        <div style={{ height:"5px", background:S.dim, borderRadius:"3px", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${todayTotal ? (todayChecks/todayTotal)*100 : 0}%`,
            background:`linear-gradient(90deg,${S.gold},#e8a030)`, borderRadius:"3px", transition:"width 0.4s" }} />
        </div>
      </div>

      {/* Day tabs — 7 individual days */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", border:`1px solid ${S.border}`, borderBottom:"none", borderRadius:"6px 6px 0 0", overflow:"hidden" }}>
        {DAYS_7.map((d, i) => {
          const isToday = d === getTodayKey();
          return (
            <button key={d} onClick={() => setDay(d)} style={{
              padding:"0.4rem 0.1rem", background:day===d ? S.text : isToday ? `${S.gold}18` : S.surface,
              color:day===d ? S.bg : isToday ? S.gold : S.muted, border:"none",
              borderRight: i < 6 ? `1px solid ${S.border}` : "none",
              cursor:"pointer", fontSize:"0.52rem", letterSpacing:"0.06em", textTransform:"uppercase",
              display:"flex", flexDirection:"column", alignItems:"center", gap:"1px", lineHeight:1.2,
            }}>
              <span>{DAY_SHORT_7[d]}</span>
              {isToday && <div style={{ width:"4px", height:"4px", borderRadius:"50%", background: day===d ? S.bg : S.gold, marginTop:"1px" }} />}
            </button>
          );
        })}
      </div>

      {/* Schedule blocks */}
      <div style={{ border:`1px solid ${S.border}`, marginBottom:"1.2rem", borderRadius:"0 0 6px 6px", overflow:"hidden" }}>
        {SCHEDULE[day].map((block, i) => {
          const proj = PROJECTS.find(p => p.id === block.project) || { color:"#555" };
          return (
            <ScheduleBlock key={i} block={block} index={i} dayLen={SCHEDULE[day].length}
              checked={state.checks[day]?.[i] || false} onToggle={() => toggleCheck(day, i)}
              S={S} projColor={proj.color} />
          );
        })}
      </div>

      {/* Quick trackers */}
      <div style={{ fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:S.muted, marginBottom:"0.5rem" }}>Quick Trackers</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginBottom:"1.2rem" }}>
        {[
          { key:"wordsToday", label:"Words Written Today",  color:C.writing, placeholder:"0",     goal:"Goal: 200+" },
          { key:"pagesRead",  label:"Pages Read Today",     color:C.books,   placeholder:"0",     goal:"Goal: 20+" },
          { key:"debtTotal",  label:"Total Debt ($)",       color:C.debt,    placeholder:"24000", goal:"Know your number" },
          { key:"debtPaid",   label:"Total Paid Off ($)",   color:C.invest,  placeholder:"0",     goal:"Every dollar counts" },
        ].map(tr => (
          <div key={tr.key} style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:"6px", padding:"0.65rem" }}>
            <div style={{ fontSize:"0.48rem", letterSpacing:"0.12em", textTransform:"uppercase", color:tr.color, marginBottom:"0.3rem" }}>{tr.label}</div>
            <input type="text" value={state[tr.key] || ""} placeholder={tr.placeholder}
              onChange={e => set(s => ({ ...s, [tr.key]:e.target.value }))}
              onClick={e => e.stopPropagation()}
              style={{ width:"100%", background:"transparent", border:"none", outline:"none", color:S.text,
                fontFamily:"Impact,sans-serif", fontSize:"1.2rem", letterSpacing:"0.04em" }} />
            <div style={{ fontSize:"0.46rem", color:S.muted, opacity:0.5, marginTop:"2px" }}>{tr.goal}</div>
          </div>
        ))}
      </div>

      {/* Debt progress */}
      {state.debtTotal && state.debtPaid && (
        <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:"6px", padding:"0.75rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.4rem" }}>
            <span style={{ fontSize:"0.52rem", letterSpacing:"0.15em", textTransform:"uppercase", color:C.debt }}>Debt Freedom Progress</span>
            <span style={{ fontFamily:"Impact,sans-serif", fontSize:"1rem", color:S.gold }}>{debtPct}%</span>
          </div>
          <div style={{ height:"8px", background:S.dim, borderRadius:"4px", overflow:"hidden" }}>
            <div className="debt-bar" style={{ height:"100%", width:`${debtPct}%`,
              background:`linear-gradient(90deg,${C.debt},#c0558a)`, borderRadius:"4px" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"0.35rem" }}>
            <span style={{ fontSize:"0.5rem", color:S.muted }}>${parseFloat(state.debtPaid||0).toLocaleString()} paid off</span>
            <span style={{ fontSize:"0.5rem", color:S.muted }}>${(parseFloat(state.debtTotal||0)-parseFloat(state.debtPaid||0)).toLocaleString()} remaining</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CalendarView ─────────────────────────────────────────────────────────────
function CalendarView({ S }) {
  const todayKey = getTodayKey();
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [weekOffset, setWeekOffset]   = useState(0);

  // Build Monday-anchored week dates
  const weekDates = useMemo(() => {
    const now = new Date();
    // Monday of current week
    const mon = new Date(now);
    const dow = now.getDay(); // 0=Sun
    mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7);
    return DAYS_7.map((_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  }, [weekOffset]);

  const monthRange = useMemo(() => {
    const first = weekDates[0];
    const last  = weekDates[6];
    const fmt = (d) => d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
    const year = first.getFullYear();
    return `${fmt(first)} – ${fmt(last)}, ${year}`;
  }, [weekDates]);

  const blocks = SCHEDULE[selectedDay];
  const selectedDate = weekDates[DAYS_7.indexOf(selectedDay)];
  const isCurrentWeek = weekOffset === 0;

  const navBtn = { background:"transparent", border:`1px solid ${S.border}`, borderRadius:"6px",
    padding:"0.3rem 0.6rem", cursor:"pointer", color:S.muted, fontSize:"0.8rem", lineHeight:1 };

  return (
    <div style={{ maxWidth:"640px", margin:"0 auto" }}>
      {/* Week navigator */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.75rem" }}>
        <button onClick={() => setWeekOffset(w => w - 1)} style={navBtn}>‹</button>
        <span style={{ fontSize:"0.55rem", letterSpacing:"0.15em", textTransform:"uppercase", color:S.muted }}>{monthRange}</span>
        <button onClick={() => setWeekOffset(w => w + 1)} style={navBtn}>›</button>
      </div>

      {/* 7-day pill row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"3px", marginBottom:"1rem" }}>
        {DAYS_7.map((dk, i) => {
          const date = weekDates[i];
          const isToday = isCurrentWeek && dk === todayKey;
          const isSelected = dk === selectedDay;
          const uniqueProjects = [...new Set(SCHEDULE[dk].map(b => b.project))].slice(0, 4);
          return (
            <button key={dk} onClick={() => setSelectedDay(dk)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:"2px",
              padding:"0.45rem 0.1rem", borderRadius:"6px", border: isSelected ? `1px solid ${S.gold}` : `1px solid ${S.border}`,
              cursor:"pointer",
              background: isSelected ? `${S.gold}18` : isToday ? `${S.gold}10` : S.surface,
              color: isSelected ? S.gold : isToday ? S.gold : S.muted,
            }}>
              <span style={{ fontSize:"0.4rem", letterSpacing:"0.08em", textTransform:"uppercase", opacity:0.7 }}>
                {DAY_SHORT_7[dk]}
              </span>
              <span style={{ fontFamily:"Impact,sans-serif", fontSize:"1rem", lineHeight:1,
                color: isSelected ? S.gold : isToday ? S.gold : S.text }}>
                {date.getDate()}
              </span>
              {/* Project color dots */}
              <div style={{ display:"flex", gap:"1.5px", marginTop:"1px" }}>
                {uniqueProjects.map(pid => (
                  <div key={pid} style={{ width:"3px", height:"3px", borderRadius:"1px", background: C[pid] || "#555", opacity: isSelected ? 1 : 0.5 }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <div style={{ display:"flex", alignItems:"baseline", gap:"0.6rem",
        borderBottom:`2px solid ${S.border}`, paddingBottom:"0.4rem", marginBottom:"0.6rem" }}>
        <div style={{ fontFamily:"Impact,sans-serif", fontSize:"1rem", letterSpacing:"0.1em", color:S.gold }}>
          {DAY_LABELS_7[selectedDay].toUpperCase()}
        </div>
        <div style={{ fontSize:"0.58rem", color:S.muted }}>
          {selectedDate.toLocaleDateString("en-US", { month:"long", day:"numeric" })}
          {isCurrentWeek && selectedDay === todayKey && (
            <span style={{ marginLeft:"0.4rem", color:S.gold, fontSize:"0.5rem", letterSpacing:"0.1em" }}>· TODAY</span>
          )}
        </div>
        <div style={{ marginLeft:"auto", fontSize:"0.48rem", color:S.muted, letterSpacing:"0.1em", textTransform:"uppercase" }}>
          {blocks.length} blocks
        </div>
      </div>

      {/* Schedule blocks (read-only) */}
      <div style={{ border:`1px solid ${S.border}`, borderRadius:"6px", overflow:"hidden" }}>
        {blocks.map((b, i) => {
          const proj = PROJECTS.find(p => p.id === b.project) || { color:"#555" };
          return (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"4px 64px 1fr" }}>
              <div style={{ background:proj.color }} />
              <div style={{ padding:"0.5rem 0.4rem", background:S.surface, borderRight:`1px solid ${S.dim}`,
                borderBottom: i < blocks.length - 1 ? `1px solid ${S.dim}` : "none" }}>
                <div style={{ fontFamily:"Impact,sans-serif", fontSize:"0.6rem", color:S.gold, whiteSpace:"nowrap" }}>{b.time}</div>
                <div style={{ fontSize:"0.46rem", color:S.muted, opacity:0.5, marginTop:"1px" }}>{b.dur}</div>
              </div>
              <div style={{ padding:"0.5rem 0.7rem", background:S.surface,
                borderBottom: i < blocks.length - 1 ? `1px solid ${S.dim}` : "none" }}>
                <div style={{ fontSize:"0.75rem", fontWeight:"600", color:proj.color, marginBottom:"0.1rem" }}>{b.title}</div>
                <div style={{ fontSize:"0.58rem", color:S.muted, opacity:0.7, lineHeight:"1.5" }}>{b.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MilestonesView ───────────────────────────────────────────────────────────
function MilestonesView({ state, toggleMilestone, S }) {
  const msDone  = useMemo(() => Object.values(state.milestones).flat().filter(Boolean).length, [state.milestones]);
  const msTotal = useMemo(() => Object.values(state.milestones).flat().length, [state.milestones]);
  const pct     = Math.round((msDone / msTotal) * 100);

  return (
    <div style={{ maxWidth:"640px", margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.6rem" }}>
        <div style={{ fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:S.muted }}>90-Day Milestones</div>
        <div style={{ fontFamily:"Impact,sans-serif", fontSize:"1rem", color:S.gold }}>{msDone}/{msTotal} done</div>
      </div>
      <div style={{ height:"5px", background:S.dim, borderRadius:"3px", overflow:"hidden", marginBottom:"1.2rem" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${S.gold},#e8a030)`, borderRadius:"3px", transition:"width 0.5s" }} />
      </div>
      {PROJECTS.map(proj => {
        const items = MILESTONES[proj.id] || [];
        const done  = (state.milestones[proj.id] || []).filter(Boolean).length;
        return (
          <div key={proj.id} style={{ background:S.surface, border:`1px solid ${S.border}`, marginBottom:"0.5rem", overflow:"hidden", borderRadius:"6px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"0.55rem 0.75rem", background:S.dim, borderBottom:`1px solid ${S.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                <div style={{ width:"6px", height:"6px", borderRadius:"2px", background:proj.color }} />
                <span style={{ fontFamily:"Impact,sans-serif", fontSize:"0.72rem", letterSpacing:"0.06em", color:proj.color }}>{proj.label}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <div style={{ width:"48px", height:"3px", background:S.border, borderRadius:"2px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${items.length ? (done/items.length)*100 : 0}%`, background:proj.color, borderRadius:"2px" }} />
                </div>
                <span style={{ fontSize:"0.55rem", color:S.muted }}>{done}/{items.length}</span>
              </div>
            </div>
            {items.map((ms, i) => {
              const checked = state.milestones[proj.id]?.[i] || false;
              return (
                <MilestoneRow key={i} ms={ms} index={i} itemsLen={items.length} checked={checked}
                  onToggle={() => toggleMilestone(proj.id, i)} S={S} projColor={proj.color} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const MilestoneRow = memo(function MilestoneRow({ ms, index, itemsLen, checked, onToggle, S, projColor }) {
  const [bouncing, setBouncing] = useState(false);
  const [ringing, setRinging] = useState(false);
  const handleClick = () => {
    if (!checked) {
      setBouncing(true); setTimeout(() => setBouncing(false), 250);
      setRinging(true);  setTimeout(() => setRinging(false), 450);
    }
    onToggle();
  };
  return (
    <div onClick={handleClick} style={{ display:"flex", alignItems:"center", gap:"0.65rem", padding:"0.55rem 0.75rem",
      borderBottom: index < itemsLen - 1 ? `1px solid ${S.dim}` : "none",
      cursor:"pointer", background:checked ? S.dim : "transparent", position:"relative" }}>
      <div style={{ position:"relative", flexShrink:0 }}>
        <div className={bouncing ? "ms-bounce" : ""} style={{ width:"16px", height:"16px", borderRadius:"50%",
          border:`2px solid ${checked ? projColor : S.border}`, background:checked ? projColor : "transparent",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          {checked && <Icon name="check" size={9} color="#fff" />}
        </div>
        {ringing && <div className="ring-out" style={{ position:"absolute", inset:"-2px", borderRadius:"50%",
          border:`2px solid ${projColor}`, pointerEvents:"none" }} />}
      </div>
      <span style={{ fontSize:"0.68rem", color:checked ? S.muted : S.text, opacity:checked ? 0.5 : 1,
        textDecoration:checked ? "line-through" : "none", lineHeight:"1.4" }}>{ms}</span>
    </div>
  );
});

// ─── PLSView ──────────────────────────────────────────────────────────────────
function PLSView({ state, set, S, isConnected }) {
  const topics   = state.plsTopics || new Array(PLS_TOPICS.length).fill(0);
  const mastered = useMemo(() => topics.filter(s => s === 4).length, [topics]);
  const mastPct  = Math.round((mastered / PLS_TOPICS.length) * 100);

  const cycleStatus = useCallback((i) => {
    set(s => {
      const t = [...(s.plsTopics || new Array(PLS_TOPICS.length).fill(0))];
      t[i] = (t[i] + 1) % PLS_STATUSES.length;
      return { ...s, plsTopics:t };
    });
  }, [set]);

  const handleTestSubmit = useCallback((data) => {
    if (isConnected) {
      gasPost("pls_test", data).catch(() => {});
    }
  }, [isConnected]);

  return (
    <div style={{ maxWidth:"640px", margin:"0 auto" }}>
      <div style={{ fontFamily:"Impact,sans-serif", fontSize:"0.95rem", letterSpacing:"0.08em", color:C.pls, marginBottom:"0.3rem" }}>LSIT / PLS Tracker</div>
      <div style={{ fontSize:"0.52rem", color:S.muted, marginBottom:"0.8rem" }}>{mastered} of {PLS_TOPICS.length} topics mastered — tap to cycle status</div>

      {/* Mastery progress */}
      <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:"6px", padding:"0.65rem", marginBottom:"1rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.35rem" }}>
          <span style={{ fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", color:C.pls }}>Topics Mastered</span>
          <span style={{ fontFamily:"Impact,sans-serif", fontSize:"0.9rem", color:S.gold }}>{mastPct}%</span>
        </div>
        <div style={{ height:"6px", background:S.dim, borderRadius:"3px", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${mastPct}%`, background:`linear-gradient(90deg,${C.pls},#2980b9)`, borderRadius:"3px", transition:"width 0.4s" }} />
        </div>
        <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.5rem", flexWrap:"wrap" }}>
          {PLS_STATUSES.map((lbl, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.25rem" }}>
              <div style={{ width:"8px", height:"8px", borderRadius:"2px", background:PLS_STATUS_COLORS[i] }} />
              <span style={{ fontSize:"0.46rem", color:S.muted }}>{lbl}: {topics.filter(s=>s===i).length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Topics list */}
      <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:"6px", overflow:"hidden", marginBottom:"1rem" }}>
        {PLS_TOPICS.map((topic, i) => {
          const status = topics[i] || 0;
          return (
            <div key={i} onClick={() => cycleStatus(i)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"0.55rem 0.75rem", borderBottom: i < PLS_TOPICS.length - 1 ? `1px solid ${S.dim}` : "none",
              cursor:"pointer", background: status === 4 ? S.dim : "transparent" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:PLS_STATUS_COLORS[status], flexShrink:0 }} />
                <span style={{ fontSize:"0.68rem", color: status === 4 ? S.muted : S.text,
                  textDecoration: status === 4 ? "line-through" : "none", opacity: status === 4 ? 0.6 : 1 }}>{topic}</span>
              </div>
              <span style={{ fontSize:"0.52rem", color:PLS_STATUS_COLORS[status], letterSpacing:"0.05em",
                background:`${PLS_STATUS_COLORS[status]}22`, padding:"0.15rem 0.4rem", borderRadius:"4px", whiteSpace:"nowrap" }}>
                {PLS_STATUSES[status]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Practice test log */}
      <PLSTestForm S={S} onSubmit={handleTestSubmit} />
    </div>
  );
}

// ─── StatsView ────────────────────────────────────────────────────────────────
function StatsView({ state, set, S, syncStatus, isConnected }) {
  const msDone      = useMemo(() => Object.values(state.milestones).flat().filter(Boolean).length, [state.milestones]);
  const msTotal     = useMemo(() => Object.values(state.milestones).flat().length, [state.milestones]);
  const pct         = Math.round((msDone / msTotal) * 100);
  const projProgress = useMemo(() => PROJECTS.map(p => ({
    ...p,
    done:  (state.milestones[p.id] || []).filter(Boolean).length,
    total: (MILESTONES[p.id] || []).length,
  })), [state.milestones]);

  const handleReset = () => {
    if (!window.confirm("Reset ALL progress? Cannot be undone.")) return;
    const f = buildInitial();
    set(() => f);
    lsSave(f);
    if (isConnected) gasPost("state", { data:f }).catch(() => {});
  };

  return (
    <div style={{ maxWidth:"640px", margin:"0 auto" }}>
      <div style={{ fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase", color:S.muted, marginBottom:"1rem" }}>Dashboard</div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.5rem", marginBottom:"1rem" }}>
        {[
          { label:"Streak",     value:state.streak,        color:S.gold,   suffix:"days"   },
          { label:"Milestones", value:`${msDone}/${msTotal}`, color:C.invest, suffix:"done" },
          { label:"Progress",   value:`${pct}%`,           color:C.pls,    suffix:"life OS" },
        ].map(s => (
          <div key={s.label} style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:"6px",
            padding:"0.75rem 0.5rem", textAlign:"center" }}>
            <div style={{ fontFamily:"Impact,sans-serif", fontSize:"1.5rem", letterSpacing:"0.03em", color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:S.muted, marginTop:"0.2rem" }}>{s.suffix}</div>
            <div style={{ fontSize:"0.48rem", color:S.muted, marginTop:"0.12rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Today trackers summary */}
      <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:"6px", padding:"0.75rem", marginBottom:"1rem" }}>
        {[
          { label:"Words written today", value:state.wordsToday || "—", color:C.writing },
          { label:"Pages read today",    value:state.pagesRead  || "—", color:C.books   },
          { label:"Total debt",          value:state.debtTotal ? `$${parseFloat(state.debtTotal).toLocaleString()}` : "—", color:C.debt   },
          { label:"Paid off",            value:state.debtPaid  ? `$${parseFloat(state.debtPaid).toLocaleString()}`  : "—", color:C.invest },
        ].map((t, i, arr) => (
          <div key={t.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            paddingBottom: i < arr.length-1 ? "0.5rem" : "0", marginBottom: i < arr.length-1 ? "0.5rem" : "0",
            borderBottom: i < arr.length-1 ? `1px solid ${S.dim}` : "none" }}>
            <span style={{ fontSize:"0.6rem", color:S.muted }}>{t.label}</span>
            <span style={{ fontFamily:"Impact,sans-serif", fontSize:"1rem", letterSpacing:"0.04em", color:t.color }}>{t.value}</span>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div style={{ fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:S.muted, marginBottom:"0.5rem" }}>Projects</div>
      <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:"6px", padding:"0.75rem", marginBottom:"1rem" }}>
        {projProgress.map((p, i) => (
          <div key={p.id} style={{ marginBottom: i < projProgress.length-1 ? "0.5rem" : 0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.18rem" }}>
              <span style={{ fontSize:"0.6rem", color:p.color }}>{p.label}</span>
              <span style={{ fontSize:"0.55rem", color:S.muted }}>{p.done}/{p.total}</span>
            </div>
            <div style={{ height:"3px", background:S.dim, borderRadius:"2px", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${p.total ? (p.done/p.total)*100 : 0}%`, background:p.color, borderRadius:"2px", transition:"width 0.4s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Sync status */}
      <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:"6px", padding:"0.65rem",
        display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1rem" }}>
        <SyncBadge status={isConnected ? syncStatus : "offline"} S={S} />
        {isConnected && syncStatus === "synced" && (
          <span style={{ fontSize:"0.58rem", color:C.invest }}>Connected to Google Sheets ✓</span>
        )}
        {isConnected && syncStatus === "error" && (
          <span style={{ fontSize:"0.58rem", color:"#c0392b" }}>Sync failed — data saved locally</span>
        )}
        {!isConnected && (
          <span style={{ fontSize:"0.58rem", color:S.muted }}>Data saved locally — no Sheets URL configured</span>
        )}
      </div>

      <button onClick={handleReset} style={{ width:"100%", padding:"0.6rem", background:"transparent",
        border:`1px solid #3a1a1a`, borderRadius:"6px", color:C.brand, fontSize:"0.6rem",
        letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer" }}>
        Reset All Progress
      </button>
    </div>
  );
}

// ─── Nav tabs config ──────────────────────────────────────────────────────────
const NAV_TABS = [
  { id:"today",      label:"Today",    icon:"calendar" },
  { id:"schedule",   label:"Schedule", icon:"home"     },
  { id:"milestones", label:"Goals",    icon:"award"    },
  { id:"pls",        label:"PLS",      icon:"book"     },
  { id:"stats",      label:"Stats",    icon:"chart"    },
];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view,        setViewRaw] = useState("today");
  const [day,         setDay]     = useState(() => getTodayKey());
  const [syncStatus,  setSyncStatus] = useState("offline");
  const [theme,       setTheme]   = useState(() => localStorage.getItem(LS_THEME) || "dark");
  const [state,       setState]   = useState(() => lsLoad() || buildInitial());
  const [isPending,   startTransition] = useTransition();
  const saveTimer  = useRef(null);
  const isFirstLoad = useRef(true);

  const S = theme === "dark" ? DARK : LIGHT;
  const isConnected = SCRIPT_URL !== "YOUR_APPS_SCRIPT_URL_HERE";

  // View title sync
  useEffect(() => {
    const labels = { today:"Today", schedule:"Schedule", milestones:"Goals", pls:"PLS Tracker", stats:"Stats" };
    document.title = `LifeOS — ${labels[view] || view}`;
  }, [view]);

  // Theme → document attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.style.background = S.bg;
    localStorage.setItem(LS_THEME, theme);
  }, [theme, S.bg]);

  // Initial load from Sheets
  useEffect(() => {
    if (!isConnected) return;
    (async () => {
      setSyncStatus("syncing");
      try {
        const res = await gasGet("state");
        if (res.data) { setState(res.data); lsSave(res.data); }
        setSyncStatus("synced");
      } catch { setSyncStatus("error"); }
    })();
  }, []);

  // Auto-save
  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return; }
    lsSave(state);
    if (!isConnected) return;
    clearTimeout(saveTimer.current);
    setSyncStatus("syncing");
    saveTimer.current = setTimeout(async () => {
      try { await gasPost("state", { data:state }); setSyncStatus("synced"); }
      catch { setSyncStatus("error"); }
    }, 3000);
  }, [state]);

  // Day rollover
  const today = new Date().toDateString();
  useEffect(() => {
    if (state.lastDate !== today) {
      setState(s => {
        const newChecks = {};
        for (const d of DAYS_7) newChecks[d] = SCHEDULE[d].map(() => false);
        if (s.lastDate && isConnected) {
          const totalDone = Object.values(s.checks).flat().filter(Boolean).length;
          const msDone    = Object.values(s.milestones).flat().filter(Boolean).length;
          gasPost("log", { date:s.lastDate, streak:s.streak, blocks_completed:totalDone,
            milestones_done:msDone, words_written:s.wordsToday||"", pages_read:s.pagesRead||"",
            debt_total:s.debtTotal||"", debt_paid:s.debtPaid||"" }).catch(() => {});
        }
        return { ...s, checks:newChecks, lastDate:today, streak:s.lastDate ? s.streak+1 : 1, wordsToday:"", pagesRead:"" };
      });
    }
  }, []);

  const setView = useCallback((id) => startTransition(() => setViewRaw(id)), [startTransition]);
  const set     = useCallback(u => setState(s => u(s)), []);

  const toggleMilestone = useCallback((pid, i) => {
    set(s => {
      const m = { ...s.milestones, [pid]:[...s.milestones[pid]] };
      const was = m[pid][i];
      m[pid][i] = !m[pid][i];
      if (!was && isConnected) gasPost("milestone", { project:pid, milestone:MILESTONES[pid][i], completed:true }).catch(() => {});
      return { ...s, milestones:m };
    });
  }, [set, isConnected]);

  const msDone  = useMemo(() => Object.values(state.milestones).flat().filter(Boolean).length, [state.milestones]);
  const msTotal = useMemo(() => Object.values(state.milestones).flat().length, [state.milestones]);
  const pct     = Math.round((msDone / msTotal) * 100);
  const tabIdx  = NAV_TABS.findIndex(t => t.id === view);

  return (
    <div style={{ minHeight:"100vh", background:S.bg, color:S.text, fontFamily:"'Geist',Georgia,serif", display:"flex", flexDirection:"column" }}>
      {/* Grain overlay (dark mode only) */}
      {theme === "dark" && <div className="grain-layer" />}

      {/* Header */}
      <header style={{ background:S.surface, borderBottom:`1px solid ${S.border}`, padding:"0.8rem 1.2rem",
        display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50 }}>
        <div>
          <div style={{ fontSize:"0.5rem", letterSpacing:"0.25em", textTransform:"uppercase", color:S.muted, marginBottom:"1px" }}>Fahad Mubiru</div>
          <div style={{ fontFamily:"Impact,sans-serif", fontSize:"1.6rem", letterSpacing:"0.08em", lineHeight:1 }}>
            LIFE<span style={{ color:S.gold }}>OS</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:"0.4rem", alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
          <SyncBadge status={isConnected ? syncStatus : "offline"} S={S} />
          <div style={{ background:S.dim, border:`1px solid ${S.border}`, borderRadius:"6px",
            padding:"0.25rem 0.6rem", fontSize:"0.55rem", letterSpacing:"0.1em", color:S.gold }}>🔥 {state.streak}d</div>
          <div style={{ background:S.dim, border:`1px solid ${S.border}`, borderRadius:"6px",
            padding:"0.25rem 0.6rem", fontSize:"0.55rem", letterSpacing:"0.1em", color:C.pls }}>{pct}%</div>
          {/* Theme toggle */}
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            style={{ background:S.dim, border:`1px solid ${S.border}`, borderRadius:"6px",
              padding:"0.3rem 0.4rem", cursor:"pointer", display:"flex", alignItems:"center" }}
            aria-label="Toggle theme">
            <Icon name={theme === "dark" ? "sun" : "moon"} size={14} color={S.gold} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex:1, overflowY:"auto", padding:"1rem 1rem 5.5rem", overflowX:"hidden" }}>
        <div key={view} className="view-anim" style={{ opacity:isPending ? 0.6 : 1, transition:"opacity 0.15s" }}>
          {view === "today" && (
            <TodayView state={state} set={set} day={day} setDay={setDay} S={S} isConnected={isConnected} />
          )}
          {view === "schedule" && <CalendarView S={S} />}
          {view === "milestones" && <MilestonesView state={state} toggleMilestone={toggleMilestone} S={S} />}
          {view === "pls" && <PLSView state={state} set={set} S={S} isConnected={isConnected} />}
          {view === "stats" && (
            <StatsView state={state} set={set} S={S} syncStatus={syncStatus} isConnected={isConnected} />
          )}
        </div>
      </main>

      {/* Bottom nav with sliding pill */}
      <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:S.bg,
        borderTop:`1px solid ${S.border}`, display:"flex", zIndex:50 }}>
        {/* Sliding indicator */}
        <div style={{ position:"absolute", top:0, left:`${(tabIdx / NAV_TABS.length) * 100}%`,
          width:`${100 / NAV_TABS.length}%`, height:"2px", background:S.gold,
          transition:"left 0.25s cubic-bezier(0.4,0,0.2,1)", borderRadius:"0 0 2px 2px" }} />
        {NAV_TABS.map((tab, i) => (
          <button key={tab.id} onClick={() => setView(tab.id)}
            style={{ flex:1, padding:"0.7rem 0.5rem 0.55rem", background:"transparent", border:"none",
              cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.2rem",
              color:view === tab.id ? S.gold : S.muted, opacity:view === tab.id ? 1 : 0.4,
              transition:"color 0.15s, opacity 0.15s", minHeight:"44px" }}>
            <Icon name={tab.icon} size={17} color={view === tab.id ? S.gold : S.muted} />
            <span style={{ fontFamily:"'Geist',Georgia,serif", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase" }}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
