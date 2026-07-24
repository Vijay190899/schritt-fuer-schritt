/* Progress store, everything lives in the browser (localStorage). No login. */
const KEY = 'sfs_progress_v1';

const defaults = () => ({
  name: '',
  createdAt: Date.now(),
  quizzes: {},              // moduleId -> { best: 0..1, attempts: n, passed: bool, lastAttempt }
  visited: {},              // moduleId -> true (grammar opened)
  writing: {},              // taskId -> saved draft
  streak: { count: 0, last: null },
  xp: 0,
  settings: { ttsRate: 0.92 }
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return Object.assign(defaults(), JSON.parse(raw));
  } catch { return defaults(); }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export const Store = {
  get: () => state,
  get name() { return state.name; },
  setName(n) { state.name = (n || '').trim(); save(); },
  hasOnboarded() { return !!state.name; },

  // ---- streak: counts unique days of activity ----
  touchStreak() {
    const today = new Date().toDateString();
    const last = state.streak.last;
    if (last === today) return state.streak.count;
    const yest = new Date(Date.now() - 864e5).toDateString();
    state.streak.count = (last === yest) ? state.streak.count + 1 : 1;
    state.streak.last = today;
    save();
    return state.streak.count;
  },

  visitLesson(id) { state.visited[id] = true; save(); },
  isVisited(id) { return !!state.visited[id]; },

  recordQuiz(id, scoreFrac, threshold) {
    const q = state.quizzes[id] || { best: 0, attempts: 0, passed: false };
    q.attempts += 1;
    q.best = Math.max(q.best, scoreFrac);
    q.lastAttempt = Date.now();
    const passedNow = scoreFrac >= threshold;
    if (passedNow && !q.passed) { state.xp += 50; }
    q.passed = q.passed || passedNow;
    state.quizzes[id] = q;
    state.xp += Math.round(scoreFrac * 10);
    save();
    return q;
  },

  quiz(id) { return state.quizzes[id] || { best: 0, attempts: 0, passed: false }; },
  isPassed(id) { return !!(state.quizzes[id] && state.quizzes[id].passed); },

  saveWriting(taskId, text) { state.writing[taskId] = text; save(); },
  getWriting(taskId) { return state.writing[taskId] || ''; },

  reset() { state = defaults(); save(); },
  exportJSON() { return JSON.stringify(state, null, 2); }
};
