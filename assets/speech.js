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

  speak(text, rate = 0.92, onEnd) {
    if (!this.supported) { onEnd && onEnd(); return false; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = rate;
    u.pitch = 1;
    if (germanVoice) u.voice = germanVoice;
    if (onEnd) u.onend = () => onEnd();
    speechSynthesis.speak(u);
    return true;
  },
  stop() { if (this.supported) speechSynthesis.cancel(); },

  // ----- Microphone recording (for pronunciation practice) -----
  recorderSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  },
  // Starts recording; returns { stop() -> Promise<Blob> }. Throws if denied/unsupported.
  async startRecording() {
    if (!this.recorderSupported()) throw new Error('no-recorder');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    const chunks = [];
    mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    const done = new Promise(res => {
      mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); res(new Blob(chunks, { type: mr.mimeType || 'audio/webm' })); };
    });
    mr.start();
    return { stop() { try { mr.stop(); } catch (_) {} return done; } };
  },

  // ----- Speech recognition -----
  recSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },
  // Press to start; keeps listening (auto-restarts) until the returned
  // controller's .stop() is called. Returns { stop } or null if unsupported.
  listen(onResult, onEnd) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { onEnd && onEnd('unsupported'); return null; }
    const rec = new SR();
    rec.lang = 'de-DE';
    rec.interimResults = true;
    rec.continuous = true;        // keep the mic open, don't stop on first pause
    rec.maxAlternatives = 1;
    let final = '';
    let stopped = false;
    let restarts = 0;

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' '; else interim += t;
      }
      onResult(final.trim(), interim);
    };
    rec.onerror = (e) => {
      // 'no-speech' / 'aborted' are recoverable while the user keeps the mic on
      if ((e.error === 'no-speech' || e.error === 'aborted') && !stopped) return;
      stopped = true;
      onEnd && onEnd(e.error, final.trim());
    };
    rec.onend = () => {
      // Chrome auto-ends even in continuous mode; restart until the user stops.
      if (!stopped && restarts < 100) { restarts++; try { rec.start(); return; } catch (_) {} }
      onEnd && onEnd(null, final.trim());
    };
    try { rec.start(); }
    catch (e) { onEnd && onEnd(e.name || 'start-failed'); return null; }
    return { stop() { stopped = true; try { rec.stop(); } catch (_) {} } };
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
