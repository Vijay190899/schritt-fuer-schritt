/* =========================================================================
   Lumikuttan 🦉, the mascot.
   Two brains:
   1) GROUNDED BASE (always on, free, offline): answers common German questions
      from a curated knowledge base + gives encouragement. Never hallucinates
      because it only returns hand-written, verified snippets.
   2) DEEP ANSWER (optional): if a Worker URL is set in config.js, the user can
      send the question to an AI model via OpenRouter (key hidden in the Worker).
   ========================================================================= */
import { Store } from './store.js';

const CFG = window.SFS_CONFIG || {};

/* ---- Grounded knowledge base: keyword -> answer (HTML allowed) ---- */
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
  'Du machst das großartig! Jeder kleine Schritt zählt. 🌱',
  'Fehler sind Freunde, so lernt das Gehirn. Weiter so!',
  'Ich bin stolz auf dich. Ernsthaft. 🦉',
  'Atme durch. Du bist weiter, als du denkst.',
  'Sprachenlernen ist ein Marathon, kein Sprint. Und du läufst gut!',
  'Denk dran: Vor einem Monat konntest du das noch nicht. 🚀'
];

const GREETINGS = (name) => [
  `Hallo ${name || 'du'}, ich bin Lumikuttan, deine Deutsch-Begleiterin. 🦉 Frag mich alles über Deutsch: Grammatik, Wörter, oder wenn du kurz etwas Mut brauchst.`,
  `Hi ${name || 'du'}, Lumikuttan hier. 🦉 Ich bin für dich da bei Grammatik, Wörtern und Prüfungsfragen. Womit fangen wir an?`
];

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

function isEncouragementRequest(text) {
  return /mut|angst|nervös|schaff|kann das nicht|zu schwer|aufgeben|müde|frust|stress|scared|nervous|give up/i.test(text);
}

/* ---- Deep answer via Worker (optional) ---- */
async function deepAnswer(question, context) {
  const url = CFG.MASCOT_WORKER_URL;
  if (!url) throw new Error('no-worker');
  const res = await fetch(url, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ question, context })
  });
  if (!res.ok) throw new Error('worker-' + res.status);
  const data = await res.json();
  return data.answer || 'Entschuldige, ich habe gerade keine Antwort.';
}

/* Public API used by the chat UI */
export const Lumikuttan = {
  greeting() { const g = GREETINGS(Store.name); return g[Math.floor(Math.random()*g.length)]; },
  encourage() { return ENCOURAGE[Math.floor(Math.random()*ENCOURAGE.length)]; },

  // returns { text, canDeepen }
  answerGrounded(question) {
    if (isEncouragementRequest(question)) return { text: this.encourage(), canDeepen: false };
    const kb = findKB(question);
    if (kb) return { text: kb, canDeepen: true };
    return {
      text: 'Gute Frage! Dazu habe ich keine feste Erklärung parat. '
          + (CFG.MASCOT_WORKER_URL && CFG.DEEP_ANSWER_ENABLED
              ? 'Tippe auf <b>„Tiefer erklären“</b> und ich denke gründlicher nach. 🧠'
              : 'Versuch, es anders zu formulieren, zum Beispiel „Wie funktioniert das Perfekt?“ oder „Wann benutze ich Dativ?“'),
      canDeepen: true
    };
  },

  deepEnabled() { return !!(CFG.MASCOT_WORKER_URL && CFG.DEEP_ANSWER_ENABLED); },
  deepAnswer
};
