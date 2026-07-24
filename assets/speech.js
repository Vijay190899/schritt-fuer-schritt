/* Free listening + speaking, using the browser's built-in Web Speech API.
   - Text-to-Speech (German voice): works in Safari, Chrome, Firefox, Edge.
   - Speech recognition (mic): best in Chrome/Edge; Safari support is limited.
*/

let germanVoice = null;
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  germanVoice =
    voices.find(v => /de[-_]DE/i.test(v.lang) && /google|deutsch|anna|petra|markus/i.test(v.name)) ||
    voices.find(v => /^de/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export const Speech = {
  supported: 'speechSynthesis' in window,

  speak(text, rate = 0.92) {
    if (!this.supported) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = rate;
    u.pitch = 1;
    if (germanVoice) u.voice = germanVoice;
    speechSynthesis.speak(u);
    return true;
  },
  stop() { if (this.supported) speechSynthesis.cancel(); },

  // ----- Speech recognition -----
  recSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },
  listen(onResult, onEnd) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { onEnd && onEnd('unsupported'); return null; }
    const rec = new SR();
    rec.lang = 'de-DE';
    rec.interimResults = true;
    rec.continuous = false;
    let final = '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      onResult(final, interim);
    };
    rec.onerror = (e) => onEnd && onEnd(e.error);
    rec.onend = () => onEnd && onEnd(null, final);
    rec.start();
    return rec;
  }
};

/* crude but encouraging pronunciation feedback: word overlap % */
export function compareSpoken(target, spoken) {
  const norm = s => s.toLowerCase().replace(/[.,!?;:„“"']/g, '').split(/\s+/).filter(Boolean);
  const t = norm(target), s = new Set(norm(spoken));
  if (!t.length) return 0;
  const hit = t.filter(w => s.has(w)).length;
  return Math.round((hit / t.length) * 100);
}
