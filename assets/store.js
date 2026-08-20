/* Progress store, everything lives in the browser (localStorage). No login. */
const KEY = 'sfs_progress_v1';
const DAILY_GOAL = 50;

/* Level ladder (feminine titles, for Natasha). */
const LEVELS = [
  { min:0,    title:'Newcomer' },
  { min:100,  title:'Beginner' },
  { min:250,  title:'Explorer' },
  { min:500,  title:'Learner' },
  { min:850,  title:'Rising Star' },
  { min:1300, title:'Achiever' },
  { min:1900, title:'Language Pro' },
  { min:2700, title:'B1 Hero' }
];

const defaults = () => ({
  name: '',
  createdAt: Date.now(),
  quizzes: {},              // moduleId -> { best, attempts, passed, lastAttempt }
  visited: {},              // moduleId -> true (grammar opened)
  writing: {},              // taskId -> saved draft
  flash: { known: {} },     // cardId -> true (permanently learned)
  examples: {},             // German word -> { a2de, a2en, b1de, b1en } (generated once, cached)
  badges: {},               // badgeId -> timestamp
  flags: {},                // micUsed, wroteDraft, perfect, deckDone …
  daily: { date:'', xp:0 }, // resets each calendar day
  streak: { count: 0, last: null },
  xp: 0,
  settings: { ttsRate: 0.92, theme: 'light' }
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return deepMerge(defaults(), JSON.parse(raw));
  } catch { return defaults(); }
}
function deepMerge(base, over) {
  for (const k in over) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]))
      base[k] = deepMerge(base[k] || {}, over[k]);
    else base[k] = over[k];
  }
  return base;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }

export const Store = {
  get: () => state,
  get name() { return state.name; },
  setName(n) { state.name = (n || '').trim(); save(); },
  get theme() { return state.settings.theme || 'light'; },
  setTheme(t) { state.settings.theme = t; save(); },
  get ttsRate() { const r = state.settings.ttsRate; return (typeof r === 'number' && r > 0) ? r : 0.9; },
  setTtsRate(r) { state.settings.ttsRate = r; save(); },
  hasOnboarded() { return !!state.name; },

  /* ---- levels & XP ---- */
  levelInfo() {
    const xp = state.xp; let idx = 0;
    for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) idx = i;
    const cur = LEVELS[idx], nxt = LEVELS[idx + 1];
    const base = cur.min, ceil = nxt ? nxt.min : cur.min;
    const span = nxt ? ceil - base : 1, into = xp - base;
    return {
      idx, level: idx + 1, title: cur.title, xp,
      base, ceil, into, span,
      pct: nxt ? Math.min(100, Math.round(into / span * 100)) : 100,
      nextTitle: nxt ? nxt.title : null, max: !nxt
    };
  },
  addXP(n) {
    const before = this.levelInfo().idx;
    state.xp += n;
    this._touchDaily(n);
    save();
    const after = this.levelInfo().idx;
    return { leveledUp: after > before, title: LEVELS[after].title, level: after + 1 };
  },
  _touchDaily(n) {
    const t = new Date().toDateString();
    if (state.daily.date !== t) state.daily = { date: t, xp: 0 };
    state.daily.xp += n;
  },
  daily() {
    const t = new Date().toDateString();
    if (state.daily.date !== t) return { date: t, xp: 0, goal: DAILY_GOAL };
    return { date: state.daily.date, xp: state.daily.xp, goal: DAILY_GOAL };
  },

  /* ---- streak ---- */
  touchStreak() {
    const today = new Date().toDateString();
    if (state.streak.last === today) return state.streak.count;
    const yest = new Date(Date.now() - 864e5).toDateString();
    state.streak.count = (state.streak.last === yest) ? state.streak.count + 1 : 1;
    state.streak.last = today;
    save();
    return state.streak.count;
  },

  /* ---- lessons & quizzes ---- */
  visitLesson(id) { state.visited[id] = true; save(); },
  isVisited(id) { return !!state.visited[id]; },

  recordQuiz(id, scoreFrac, threshold) {
    const q = state.quizzes[id] || { best: 0, attempts: 0, passed: false };
    q.attempts += 1;
    q.best = Math.max(q.best, scoreFrac);
    q.lastAttempt = Date.now();
    const passedNow = scoreFrac >= threshold;
    let xp = Math.round(scoreFrac * 10);
    if (passedNow && !q.passed) xp += 50;
    if (scoreFrac >= 0.999) { state.flags.perfect = true; xp += 20; }
    q.passed = q.passed || passedNow;
    state.quizzes[id] = q;
    save();
    this.addXP(xp);
    return q;
  },
  quiz(id) { return state.quizzes[id] || { best: 0, attempts: 0, passed: false }; },
  isPassed(id) { return !!(state.quizzes[id] && state.quizzes[id].passed); },

  /* ---- flashcards ---- */
  recordFlash(cardId) {
    if (state.flash.known[cardId]) return { leveledUp: false, isNew: false };
    state.flash.known[cardId] = true;
    save();
    const r = this.addXP(5);
    return { ...r, isNew: true };
  },
  forgetFlash(cardId) { if (state.flash.known[cardId]) { delete state.flash.known[cardId]; save(); } },
  isKnown(id) { return !!state.flash.known[id]; },
  learnedWords() { return Object.keys(state.flash.known).length; },
  getExamples(de) { return state.examples[de] || null; },
  setExamples(de, obj) { state.examples[de] = obj; save(); },

  /* ---- writing ---- */
  saveWriting(taskId, text) { state.writing[taskId] = text; save(); },
  getWriting(taskId) { return state.writing[taskId] || ''; },

  /* ---- flags & badges ---- */
  setFlag(k) { if (!state.flags[k]) { state.flags[k] = true; save(); return true; } return false; },
  flag(k) { return !!state.flags[k]; },
  hasBadge(id) { return !!state.badges[id]; },
  unlockBadge(id) { if (state.badges[id]) return false; state.badges[id] = Date.now(); save(); return true; },

  reset() { state = defaults(); save(); },
  exportJSON() { return JSON.stringify(state, null, 2); }
};
