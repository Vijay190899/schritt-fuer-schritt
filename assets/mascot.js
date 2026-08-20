/* =========================================================================
   Lumikuttan 🦉, the mascot.

   Two brains:
   1) AI brain (when a Worker URL is set in config.js): a general-purpose
      open-source LLM (Llama / Mistral via Cloudflare Workers AI) that answers
      ANY question, not just German ones. For German questions we send along
      "verified notes" retrieved from the built-in knowledge base so the model
      stays accurate and does not invent grammar rules.
   2) OFFLINE brain (fallback, free): a small curated knowledge base that
      answers common German questions and gives encouragement, even with no
      Worker / no internet.
   ========================================================================= */
import { Store } from './store.js?v=2';

const CFG = window.SFS_CONFIG || {};

/* ---- Curated knowledge base: used BOTH as offline answers and as grounding
        context for the AI brain. keyword -> answer (HTML allowed) ---- */
const KB = [
  { keys:['weil','warum','grund','because'], a:'<b>weil</b> nennt einen Grund. Es ist eine Nebensatz-Konjunktion, also steht das Verb am <b>Ende</b>:<br>„Ich lerne Deutsch, <b>weil</b> ich hier <b>leben will</b>.“<br><i>weil = because; the verb goes to the end.</i>' },
  { keys:['weil oder denn','denn'], a:'<b>weil</b> = Nebensatz (Verb am Ende). <b>denn</b> = Hauptsatz (normale Wortstellung):<br>„…, <b>weil</b> ich müde <b>bin</b>.“ vs. „…, <b>denn</b> ich <b>bin</b> müde.“' },
  { keys:['perfekt','partizip','vergangenheit','ge-'], a:'<b>Perfekt</b> = haben/sein + Partizip II.<br>regelmäßig: <b>ge-</b>…<b>-t</b> (gespielt) · unregelmäßig: <b>ge-</b>…<b>-en</b> (gegessen).<br>Bewegung/Änderung → <b>sein</b> (ich bin gefahren). -ieren & nicht-trennbare: <b>kein ge-</b> (studiert, verstanden).' },
  { keys:['wechselpräp','wo','wohin','dativ oder akkusativ','in an auf'], a:'<b>Wechselpräpositionen</b> (in, an, auf, über, unter, vor, hinter, neben, zwischen):<br>• <b>Wo?</b> (Ort, keine Bewegung) → <b>Dativ</b>: „auf <b>dem</b> Tisch“.<br>• <b>Wohin?</b> (Richtung) → <b>Akkusativ</b>: „auf <b>den</b> Tisch“.' },
  { keys:['akkusativ','dativ','fall','fälle','case','der den dem'], a:'Kurz:<br>• <b>Nominativ</b> = Subjekt (wer?) – der/das/die.<br>• <b>Akkusativ</b> = Objekt (wen?) – nur maskulin ändert sich: der→<b>den</b>.<br>• <b>Dativ</b> = wem? – dem/dem/der/den(+n).' },
  { keys:['relativ','der die das satz','relativsatz','who which'], a:'<b>Relativsätze</b> beschreiben ein Nomen. Das Pronomen passt zum Genus, der <b>Kasus</b> kommt aus dem Relativsatz. Verb am Ende:<br>„Der Mann, <b>der</b> kocht …“ (Nom.) · „…, <b>den</b> ich kenne …“ (Akk.) · „…, <b>dem</b> ich helfe …“ (Dat.).' },
  { keys:['konjunktiv','würde','hätte','wäre','könnte','irreal'], a:'<b>Konjunktiv II</b> für Irreales/Höflichkeit: <b>würde</b> + Infinitiv, oder <b>hätte/wäre/könnte</b>.<br>„Wenn ich Zeit <b>hätte</b>, <b>würde</b> ich reisen.“<br>Vergangenheit: hätte/wäre + Partizip („Hätte ich das gewusst!“).' },
  { keys:['passiv','werden','wird'], a:'<b>Passiv</b> = werden + Partizip II (die Handlung ist wichtig, nicht wer):<br>„Das Haus <b>wird</b> gebaut.“ Mit Modalverb: „Das <b>muss</b> gemacht <b>werden</b>.“' },
  { keys:['genitiv','wessen','des','der frau'], a:'<b>Genitiv</b> (wessen?): maskulin/neutral Nomen + <b>-s</b>, Artikel <b>des/eines</b>; feminin/Plural <b>der</b>.<br>„das Auto <b>des</b> Mannes“, „die Farbe <b>der</b> Blume“. Präpositionen: wegen, trotz, während (+ Genitiv).' },
  { keys:['um zu','damit','infinitiv','zu'], a:'Ziel/Absicht: <b>um … zu</b> (gleiches Subjekt) oder <b>damit</b> (anderes Subjekt).<br>„Ich lerne, <b>um</b> die Prüfung <b>zu</b> bestehen.“ · „Ich erkläre es, <b>damit</b> du es verstehst.“' },
  { keys:['als oder wenn','als','wenn'], a:'<b>als</b> = einmal in der Vergangenheit („<b>Als</b> ich klein war…“). <b>wenn</b> = wiederholt oder Gegenwart/Zukunft („<b>Wenn</b> es regnet, …“).' },
  { keys:['dtz','prüfung','exam','wie viele punkte','bestehen'], a:'Der <b>DTZ</b> hat 4 Teile: Hören, Lesen, Schreiben, Sprechen. Für <b>B1</b> brauchst du ca. <b>60%</b>. Sprechen zählt viel – üben wir laut! Du findest Übungen im „Prüfung“-Bereich. 💪' },
  { keys:['schreiben','brief','email','e-mail'], a:'Beim <b>Schreiben</b>: Anrede → warum du schreibst → alle <b>4 Punkte</b> bearbeiten → Gruß. Nutze „ich schreibe Ihnen, weil…“, „könnten Sie bitte…“, „Mit freundlichen Grüßen“. Im „Schreiben“-Trainer gibt es Muster.' }
];

const ENCOURAGE = [
  'That is normal, especially before an exam. Take it one step at a time.',
  'Feeling unsure is part of learning. You have already come a long way.',
  'It is okay to find this hard. Small, regular practice adds up.',
  'Nerves before a test are common. Focus on one thing at a time.',
  'You do not have to be perfect. Steady practice is what counts.'
];

const GREETINGS = (name) => [
  `Hi ${name || 'there'}, I'm Lumikuttan. Ask me anything about German (grammar, vocabulary, the exam) or any other question you have.`,
  `Hi ${name || 'there'}, Lumikuttan here. What would you like to know?`
];

function stripTags(s){ return String(s).replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }

function findKB(text) {
  const q = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const item of KB) {
    let score = 0;
    for (const k of item.keys) if (q.includes(k)) score += k.length;
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return bestScore > 0 ? best.a : null;
}
/* top matching KB notes, as plain text, to ground the AI on German questions */
function retrieve(text) {
  const q = text.toLowerCase();
  const hits = [];
  for (const item of KB) {
    let score = 0;
    for (const k of item.keys) if (q.includes(k)) score += k.length;
    if (score > 0) hits.push({ score, a: item.a });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, 2).map(h => stripTags(h.a)).join('\n');
}

function isEncouragementRequest(text) {
  return /mut|angst|nervös|schaff|kann das nicht|zu schwer|aufgeben|müde|frust|stress|scared|nervous|give up|anxious|worried/i.test(text);
}

/* ---- AI brain via the Worker (Cloudflare Workers AI, open-source model) ---- */
async function ask(question, opts = {}) {
  const url = CFG.MASCOT_WORKER_URL;
  if (!url) throw new Error('no-worker');

  const notes = retrieve(question);
  const ctx = [];
  if (Store.name) ctx.push(`The learner's name is ${Store.name}.`);
  if (opts.lesson) ctx.push(`They are currently on this lesson: ${opts.lesson}.`);
  if (notes) ctx.push(`Verified German notes (use these if relevant):\n${notes}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context: ctx.join('\n'), history: opts.history || [] })
  });
  if (!res.ok) throw new Error('worker-' + res.status);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.answer || '…';
}

/* ---- Generate A2 + B1 example sentences for a vocabulary card ----
   Uses a small, cheap open model and a strict 4-line format. Returns
   { a2de, a2en, b1de, b1en }. The caller caches the result per word. */
async function examples(de, en) {
  const url = CFG.MASCOT_WORKER_URL;
  if (!url) throw new Error('no-worker');
  const q = `Write example sentences for a German vocabulary flashcard. The word is "${de}" and it means "${en}". Use this exact word in both sentences. Reply in EXACTLY four lines, nothing else, no intro:
A2: <one very simple German sentence, present tense>
A2EN: <English translation of the A2 sentence>
B1: <one richer German sentence at B1 level, for example with a connector like weil or deshalb>
B1EN: <English translation of the B1 sentence>`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: q, model: '@cf/mistralai/mistral-small-3.1-24b-instruct' })
  });
  if (!res.ok) throw new Error('worker-' + res.status);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  const out = { a2de: '', a2en: '', b1de: '', b1en: '' };
  for (const raw of String(data.answer || '').split('\n')) {
    const ln = raw.trim(); if (!ln) continue;
    const low = ln.toLowerCase();
    const val = ln.replace(/^[^:]*:\s*/, '').trim();
    if (low.startsWith('a2en') || low.startsWith('a2 en') || low.startsWith('a2-en')) out.a2en = val;
    else if (low.startsWith('a2')) out.a2de = val;
    else if (low.startsWith('b1en') || low.startsWith('b1 en') || low.startsWith('b1-en')) out.b1en = val;
    else if (low.startsWith('b1')) out.b1de = val;
  }
  return out;
}

/* ---- Transcribe a recorded audio blob via the Worker (Whisper) ---- */
async function transcribe(blob) {
  const url = CFG.MASCOT_WORKER_URL;
  if (!url) throw new Error('no-worker');
  const u = url + (url.includes('?') ? '&' : '?') + 'mode=stt';
  const res = await fetch(u, { method: 'POST', headers: { 'Content-Type': blob.type || 'application/octet-stream' }, body: blob });
  if (!res.ok) throw new Error('worker-' + res.status);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return (data.text || '').trim();
}

/* Public API used by the chat UI */
export const Lumikuttan = {
  greeting() { const g = GREETINGS(Store.name); return g[Math.floor(Math.random()*g.length)]; },
  encourage() { return ENCOURAGE[Math.floor(Math.random()*ENCOURAGE.length)]; },

  // offline / no-AI answer: KB grammar hit or gentle encouragement
  answerGrounded(question) {
    if (isEncouragementRequest(question)) return { text: this.encourage() };
    const kb = findKB(question);
    if (kb) return { text: kb };
    return { text: 'For open questions I need my AI brain switched on. In the meantime, try a German topic like “How does the Perfekt work?” or “When do I use Dativ?” and I can help right away. 🦉' };
  },

  aiEnabled() { return !!(CFG.MASCOT_WORKER_URL && (CFG.DEEP_ANSWER_ENABLED ?? true)); },
  ask,
  examples,
  transcribe
};
