/* =========================================================================
   Schritt für Schritt, application core
   ========================================================================= */
import { Store } from './store.js';
import { SYLLABUS, SKILLS, EXAM_INFO, PHONETIK } from './data.js';
import { Speech, compareSpoken } from './speech.js';
import { Lumikuttan } from './mascot.js';

const CFG = window.SFS_CONFIG || { PASS_THRESHOLD:0.7, QUESTIONS_PER_QUIZ:7 };
const THRESHOLD = CFG.PASS_THRESHOLD ?? 0.7;
const N_Q = CFG.QUESTIONS_PER_QUIZ ?? 7;

/* ---------- tiny utils ---------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hl  = s => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');            // *word* -> highlight
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];} return a; };
const go = hash => { location.hash = hash; };

/* ---------- module index + unlock logic ---------- */
const ALL = [];
SYLLABUS.forEach((ph, pi) => ph.modules.forEach(m => ALL.push(Object.assign({}, m, { phaseIndex:pi, phaseName:ph.phase, phaseColor:ph.color }))));
const B1_ORDER = ALL.filter(m => m.phaseIndex >= 1).map(m => m.id);
const byId = id => ALL.find(m => m.id === id);

function isUnlocked(m) {
  if (m.phaseIndex === 0) return true;                 // A2 recap: always open
  const i = B1_ORDER.indexOf(m.id);
  if (i <= 0) return true;                              // first B1 module open
  return Store.isPassed(B1_ORDER[i - 1]);
}
function nextModule(id) {
  const i = ALL.findIndex(m => m.id === id);
  return ALL[i + 1] || null;
}

/* ---------- shell ---------- */
function shell(inner, active='') {
  const s = Store.get();
  const streak = s.streak.count;
  return `
  <header class="topbar"><div class="topbar__in">
    <div class="brand" data-nav="#/"><span class="logo">🦉</span> Schritt für Schritt</div>
    <nav class="nav">
      <a data-nav="#/" class="${active==='home'?'active':''}">Start</a>
      <a data-nav="#/roadmap" class="${active==='roadmap'?'active':''}">Roadmap</a>
      <a data-nav="#/pruefung" class="${active==='pruefung'?'active':''}">Prüfung</a>
    </nav>
    ${streak>0?`<span class="streak" title="Lern-Serie">🔥 ${streak} Tag${streak>1?'e':''}</span>`:''}
  </div></header>
  <main>${inner}</main>
  <footer class="footer"><div class="wrap">
    Mit 💛 für deine Deutschprüfung gebaut · Fortschritt wird nur in deinem Browser gespeichert ·
    <a href="#" data-action="reset">Fortschritt zurücksetzen</a>
  </div></footer>`;
}
function render(inner, active) {
  $('#app').innerHTML = shell(inner, active);
  $$('[data-nav]').forEach(b => b.onclick = () => go(b.dataset.nav));
  const rst = $('[data-action=reset]');
  if (rst) rst.onclick = e => { e.preventDefault(); if (confirm('Wirklich allen Fortschritt löschen?')) { Store.reset(); go('#/'); location.reload(); } };
  window.scrollTo(0,0);
}

/* ---------- progress helpers ---------- */
function overallProgress() {
  const done = ALL.filter(m => Store.isPassed(m.id)).length;
  return { done, total: ALL.length, pct: Math.round(done/ALL.length*100) };
}

/* =====================================================================
   VIEW: Dashboard / Home
   ===================================================================== */
function viewHome() {
  const name = Store.name;
  const p = overallProgress();
  const s = Store.get();
  // find current recommended module = first unlocked, not passed
  const current = ALL.find(m => isUnlocked(m) && !Store.isPassed(m.id)) || ALL[ALL.length-1];
  const inner = `
  <div class="wrap">
    <section class="hero"><div class="hero__grid">
      <div>
        <p class="eyebrow">Dein Weg zur B1-Prüfung</p>
        <h1>Willkommen zurück${name?`, ${esc(name)}`:''}. 🌟</h1>
        <p class="lead">Ganz ruhig. Wir gehen das <b>Schritt für Schritt</b> an, ohne Eile. Heute ein kleiner Schritt, morgen der nächste. Ich bleibe die ganze Zeit an deiner Seite.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px">
          <button class="btn btn--accent" data-nav="#/lesson/${current.id}">▶︎ Weiterlernen: ${esc(current.title)}</button>
          <button class="btn btn--ghost" data-nav="#/roadmap">Ganze Roadmap ansehen</button>
        </div>
        <div class="stats">
          <div class="stat"><div class="n prim">${p.done}/${p.total}</div><div class="l">Kapitel geschafft</div></div>
          <div class="stat"><div class="n accent">${s.xp}</div><div class="l">XP gesammelt</div></div>
          <div class="stat"><div class="n good">${s.streak.count}</div><div class="l">Tage in Folge</div></div>
          <div class="stat"><div class="n">${p.pct}%</div><div class="l">Gesamtfortschritt</div></div>
        </div>
      </div>
      <div class="hero__owl">🦉</div>
    </div></section>

    <section class="section">
      <div class="section__head"><div><h2>Deine vier Prüfungsfertigkeiten</h2><p>Der DTZ prüft alle vier. Sprechen ist dabei besonders wichtig.</p></div></div>
      <div class="skillgrid">
        ${Object.entries(SKILLS).map(([k,v])=>`
          <div class="skillcard" style="background:linear-gradient(140deg,${v.color},${v.color}cc)" data-nav="#/skill/${encodeURIComponent(k)}">
            <div class="ic">${v.icon}</div>
            <div><h3>${k}</h3><p>${k==='Hören'?'Hörverstehen trainieren':k==='Lesen'?'Texte verstehen':k==='Schreiben'?'Briefe & E-Mails':'Laut sprechen üben'}</p></div>
          </div>`).join('')}
      </div>
    </section>
  </div>`;
  render(inner, 'home');
  $$('[data-nav]').forEach(b => b.onclick = () => go(b.dataset.nav));
}

/* =====================================================================
   VIEW: Roadmap
   ===================================================================== */
function viewRoadmap() {
  const inner = `
  <div class="wrap">
    <section class="hero" style="padding:36px 0 6px">
      <p class="eyebrow">Deine Roadmap</p>
      <h1>Von A2 bis zur B1-Prüfung</h1>
      <p class="lead">Jedes Kapitel schaltet das nächste frei, sobald du das Quiz mit <b>70%</b> schaffst. Unendlich viele Versuche, jedes Mal neue Fragen. Ganz ohne Druck.</p>
    </section>
    <section class="section">
      ${SYLLABUS.map((ph,pi)=>{
        const mods = ph.modules;
        const done = mods.filter(m=>Store.isPassed(m.id)).length;
        return `
        <div class="phase">
          <div class="phase__label"><span class="dot" style="background:${ph.color}"></span>
            <h3>${esc(ph.phase)}</h3><span class="meta">${done}/${mods.length} geschafft</span></div>
          <div class="road">
            ${mods.map(m=>{
              const mm = byId(m.id);
              const unlocked = isUnlocked(mm);
              const q = Store.quiz(m.id);
              const passed = q.passed;
              const pct = Math.round((q.best||0)*100);
              return `
              <div class="node ${!unlocked?'node--locked':''} ${passed?'node--done':''}" data-open="${unlocked?m.id:''}">
                <div class="node__badge" style="background:linear-gradient(140deg,${m.color},${m.color}bb)">
                  ${m.icon}${!unlocked?'<span class="lock">🔒</span>':''}
                </div>
                <div class="node__body">
                  <h4>${typeof m.lektion==='number'?`L${m.lektion} · `:''}${esc(m.title)}</h4>
                  <p class="sub">${esc(m.subtitle)}</p>
                  <div class="tags">${(m.grammar||[]).slice(0,3).map(g=>`<span class="chip chip--gram">${esc(g.title)}</span>`).join('')}</div>
                </div>
                <div class="node__state">
                  ${passed?`<div class="check">✓</div><div class="lbl">bestanden</div>`
                    : unlocked?`<div class="pct">${pct?pct+'%':'-'}</div><div class="lbl">${q.attempts?'bester Versuch':'starte hier'}</div>`
                    : `<div class="lbl">🔒 gesperrt</div>`}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')}
    </section>
  </div>`;
  render(inner, 'roadmap');
  $$('.node[data-open]').forEach(n=>{
    const id = n.dataset.open;
    if (!id) { n.onclick = ()=> toast('Erst das vorherige Kapitel mit 70% abschließen 🔒','warn'); return; }
    n.onclick = ()=> go('#/lesson/'+id);
  });
}

/* =====================================================================
   VIEW: Lesson (grammar)
   ===================================================================== */
function renderBlock(b){
  switch(b.t){
    case 'p': return `<div class="bilingual"><div class="en"><span class="tag">English</span>${esc(b.en)}</div><div class="de"><span class="tag">Deutsch</span>${esc(b.de)}</div></div>`;
    case 'table': return `<table class="gtable"><thead><tr>${b.head.map(h=>`<th>${hl(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r=>`<tr>${r.map(c=>`<td>${hl(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    case 'ex': return `<div class="example"><div class="de">${hl(b.de)}</div>${b.en?`<div class="en">${esc(b.en)}</div>`:''}</div>`;
    case 'tip': return `<div class="tipbox"><div class="ic">💡</div><div><div class="h">${esc(b.h)}</div>${hl(b.body)}</div></div>`;
    case 'warn': return `<div class="tipbox callout-danger"><div class="ic">⚠️</div><div><div class="h">${esc(b.h)}</div>${hl(b.body)}</div></div>`;
    case 'list': return `<ul>${b.items.map(i=>`<li>${hl(i)}</li>`).join('')}</ul>`;
    default: return '';
  }
}
function viewLesson(id){
  const m = byId(id);
  if(!m){ go('#/roadmap'); return; }
  if(!isUnlocked(m)){ toast('Dieses Kapitel ist noch gesperrt 🔒','warn'); go('#/roadmap'); return; }
  Store.visitLesson(id); Store.touchStreak();
  const q = Store.quiz(id);
  const inner = `
  <div class="wrap lesson">
    <div class="lesson__hero" style="background:linear-gradient(135deg,${m.color},${m.color}cc)">
      <div class="kicker">${esc(m.phaseName)} ${typeof m.lektion==='number'?'· Lektion '+m.lektion:''}</div>
      <h1>${m.icon} ${esc(m.title)}</h1>
      <p class="lead">${esc(m.subtitle)}</p>
      <div class="goals">${(m.goals||[]).map(g=>`<span class="chip">🎯 ${esc(g)}</span>`).join('')}</div>
    </div>

    ${m.wortfelder?`<p style="color:var(--ink-soft)"><b>Wortfelder:</b> ${m.wortfelder.map(esc).join(' · ')}</p>`:''}

    ${m.grammar.length>1?`<div class="gtoc">${m.grammar.map((g,i)=>`<button data-jump="c${i}" class="${i===0?'active':''}">${esc(g.title)}</button>`).join('')}</div>`:''}

    ${m.grammar.map((g,i)=>`
      <div class="concept" id="c${i}">
        <h3><span class="num">${i+1}</span> ${esc(g.title)}</h3>
        <p style="color:var(--ink-faint);margin:-4px 0 10px"><b>EN:</b> ${esc(g.en)} &nbsp;·&nbsp; <b>DE:</b> ${esc(g.de)}</p>
        ${g.blocks.map(renderBlock).join('')}
      </div>`).join('')}

    <div class="card pad" style="text-align:center;margin-top:20px">
      <h3 style="margin-top:0">Bereit für ein kleines Quiz? 🧠</h3>
      <p style="color:var(--ink-soft)">${q.passed?'Du hast dieses Quiz schon bestanden, aber Wiederholung schadet nie. Neue Fragen warten.':'Keine Sorge, du hast unendlich viele Versuche und jedes Mal neue Fragen. Du brauchst 70%.'}</p>
      <button class="btn btn--accent" data-nav="#/quiz/${id}">Quiz starten →</button>
    </div>
  </div>`;
  render(inner);
  $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
  $$('[data-jump]').forEach(b=>b.onclick=()=>{
    $$('.gtoc button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    $('#'+b.dataset.jump).scrollIntoView({behavior:'smooth'});
  });
}

/* =====================================================================
   VIEW: Quiz  (randomized set, 70% gate, infinite retries)
   ===================================================================== */
function buildQuizSet(m){
  const bank = shuffle(m.quiz);
  const picked = bank.slice(0, Math.min(N_Q, bank.length));
  return picked.map(q=>{
    if(q.type==='mc'){
      const order = shuffle(q.options.map((o,i)=>({o,i})));
      return { ...q, _opts:order.map(x=>x.o), _answer:order.findIndex(x=>x.i===q.answer) };
    }
    return { ...q };
  });
}
function viewQuiz(id){
  const m = byId(id);
  if(!m || !isUnlocked(m)){ go('#/roadmap'); return; }
  const set = buildQuizSet(m);
  let idx=0, correct=0; const answers=[];

  function paint(){
    const q=set[idx];
    const inner=`
    <div class="wrap quiz">
      <div class="quiz__top">
        <button class="btn btn--ghost btn--sm" data-nav="#/lesson/${id}">← zurück</button>
        <span class="chip chip--wash">Frage ${idx+1} / ${set.length}</span>
      </div>
      <div class="quiz__meter"><span style="width:${(idx/set.length)*100}%"></span></div>
      <div class="q">
        <div class="q__prompt">${esc(q.q)}</div>
        ${q.en?`<div class="q__hint">🇬🇧 ${esc(q.en)}</div>`:''}
        ${q.type==='mc'
          ? `<div class="opts">${q._opts.map((o,i)=>`<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`
          : `<input class="fillin" placeholder="Deine Antwort…" autocomplete="off" autocapitalize="off" /><div style="margin-top:12px"><button class="btn btn--primary" data-check>Prüfen</button></div>`}
        <div class="explain" id="ex" style="display:none"></div>
        <div id="nextwrap" style="display:none;margin-top:16px;text-align:right">
          <button class="btn btn--accent" data-next>${idx+1<set.length?'Nächste Frage →':'Ergebnis ansehen →'}</button>
        </div>
      </div>
    </div>`;
    render(inner);
    $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));

    const showResult=(ok, userAns)=>{
      answers.push({q:q.q, ok});
      if(ok) correct++;
      const ex=$('#ex'); ex.style.display='block';
      ex.className='explain '+(ok?'good':'bad');
      ex.innerHTML=`<div class="h">${ok?'✅ Richtig!':'💛 Fast! Kein Problem, so lernt man.'}</div>${esc(q.explain||'')}`;
      $('#nextwrap').style.display='block';
    };

    if(q.type==='mc'){
      $$('.opt').forEach(btn=>btn.onclick=()=>{
        if($('#nextwrap').style.display==='block') return;
        const i=+btn.dataset.i, ok=i===q._answer;
        $$('.opt').forEach(b=>b.style.pointerEvents='none');
        btn.classList.add(ok?'correct':'wrong');
        if(!ok) $$('.opt')[q._answer].classList.add('correct');
        showResult(ok);
      });
    } else {
      const input=$('.fillin');
      const check=()=>{
        if($('#nextwrap').style.display==='block') return;
        const acc=Array.isArray(q.answer)?q.answer:[q.answer];
        const val=(input.value||'').trim().toLowerCase();
        const ok=acc.some(a=>String(a).trim().toLowerCase()===val);
        input.style.borderColor=ok?'var(--success)':'var(--accent)';
        if(!ok) $('#ex'); // fallthrough
        showResult(ok);
        if(!ok){ const ex=$('#ex'); ex.innerHTML+=`<div style="margin-top:6px"><b>Richtig:</b> ${esc(acc[0])}</div>`; }
      };
      input.addEventListener('keydown',e=>{if(e.key==='Enter')check();});
      $('[data-check]').onclick=check;
      input.focus();
    }
    $('[data-next]').onclick=()=>{
      idx++;
      if(idx<set.length) paint(); else finish();
    };
  }

  function finish(){
    const frac=correct/set.length;
    const pct=Math.round(frac*100);
    const rec=Store.recordQuiz(id, frac, THRESHOLD);
    Store.touchStreak();
    const passed=frac>=THRESHOLD;
    const nxt=nextModule(id);
    const emoji=passed?(pct===100?'🏆':'🎉'):'🌱';
    const heading=passed?(pct===100?'Perfekt! Alles richtig!':'Geschafft! Bestanden!'):'Noch nicht ganz, und das ist völlig okay.';
    const msg=passed
      ? `Du hast ${correct} von ${set.length} richtig (${pct}%). ${nxt&&isUnlocked(byId(nxt.id))?`Das nächste Kapitel <b>„${esc(nxt.title)}“</b> ist jetzt freigeschaltet! 🔓`:'Du kommst super voran!'}`
      : `Du hast ${correct} von ${set.length} richtig (${pct}%). Du brauchst 70%, und das schaffst du beim nächsten Mal locker. <b>Neue Fragen, neuer Versuch.</b> Ich glaube an dich.`;

    const inner=`
    <div class="wrap quiz"><div class="q result">
      <div class="result__emoji">${emoji}</div>
      <h2>${heading}</h2>
      <p class="msg">${msg}</p>
      <div class="result__actions">
        ${passed
          ? (nxt&&isUnlocked(byId(nxt.id))
              ? `<button class="btn btn--accent" data-nav="#/lesson/${nxt.id}">Weiter zu „${esc(nxt.title)}“ →</button>`
              : `<button class="btn btn--accent" data-nav="#/roadmap">Zur Roadmap →</button>`)
          : `<button class="btn btn--accent" data-retry>Nochmal versuchen (neue Fragen) 🔁</button>`}
        <button class="btn btn--ghost" data-nav="#/lesson/${id}">Grammatik nochmal ansehen</button>
      </div>
    </div></div>`;
    render(inner);
    $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
    const r=$('[data-retry]'); if(r) r.onclick=()=>viewQuiz(id);
    if(passed) confetti();
    if(!passed) setTimeout(()=>toast(Lumikuttan.encourage()), 500);
  }

  paint();
}

/* =====================================================================
   VIEW: Prüfung overview
   ===================================================================== */
function viewPruefung(){
  const inner=`
  <div class="wrap">
    <section class="hero" style="padding:36px 0 6px">
      <p class="eyebrow">Prüfungstraining</p>
      <h1>${esc(EXAM_INFO.title)}</h1>
      <div class="bilingual" style="margin-top:14px"><div class="en"><span class="tag">English</span>${esc(EXAM_INFO.intro_en)}</div><div class="de"><span class="tag">Deutsch</span>${esc(EXAM_INFO.intro_de)}</div></div>
    </section>
    <section class="section">
      <div class="section__head"><div><h2>Die vier Teile</h2><p>Klicke, um jede Fertigkeit zu trainieren.</p></div></div>
      <div class="skillgrid">
        ${Object.entries(SKILLS).map(([k,v])=>`
          <div class="skillcard" style="background:linear-gradient(140deg,${v.color},${v.color}cc)" data-nav="#/skill/${encodeURIComponent(k)}">
            <div class="ic">${v.icon}</div>
            <div><h3>${k}</h3><p>${esc((EXAM_INFO.parts.find(p=>p.k===k)||{}).desc||'')}</p>
            <span class="chip" style="background:rgba(255,255,255,.2);border:none;color:#fff;margin-top:8px">${(EXAM_INFO.parts.find(p=>p.k===k)||{}).points||''}</span></div>
          </div>`).join('')}
      </div>
    </section>
    <section class="section">
      <div class="section__head"><div><h2>Aussprache-Spickzettel 🗣️</h2><p>Aus dem Arbeitsbuch. Hör dir jedes Beispiel an.</p></div></div>
      <div class="card pad">
        ${PHONETIK.map(([h,d])=>`<div style="display:flex;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)">
          <button class="btn btn--ghost btn--sm" data-say="${esc(d.replace(/["]/g,''))}">🔊</button>
          <div><b>${esc(h)}</b>, ${esc(d)}</div></div>`).join('')}
      </div>
    </section>
  </div>`;
  render(inner,'pruefung');
  $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
  $$('[data-say]').forEach(b=>b.onclick=()=>Speech.speak(b.dataset.say, Store.get().settings.ttsRate));
}

/* =====================================================================
   VIEW: individual skill trainer
   ===================================================================== */
function viewSkill(name){
  const v=SKILLS[name];
  if(!v){ go('#/pruefung'); return; }
  Store.touchStreak();
  let body='';
  if(name==='Hören') body=v.tasks.map(t=>`
    <div class="task">
      <span class="chip chip--wash">${t.level}</span>
      <h3>${esc(t.title)}</h3>
      <div class="player">
        <button data-say="${esc(t.script)}">▶︎</button>
        <div style="flex:1"><b>Hörtext abspielen</b><br><small style="color:var(--ink-faint)">Klicke so oft du willst. Erst hören, dann antworten.</small></div>
        <button class="btn btn--ghost btn--sm" data-reveal="script-${t.id}">Text zeigen</button>
      </div>
      <div id="script-${t.id}" style="display:none" class="explain">${esc(t.script)}</div>
      <div class="q" style="box-shadow:none;border:1px dashed var(--line);margin-top:12px">
        <div class="q__prompt" style="font-size:1.05rem">${esc(t.q.q)}</div>
        <div class="opts">${t.q.options.map((o,i)=>`<button class="opt" data-q="${t.id}" data-i="${i}" data-a="${t.q.answer}">${esc(o)}</button>`).join('')}</div>
        <div class="explain" id="hex-${t.id}" style="display:none"></div>
      </div>
    </div>`).join('');

  if(name==='Lesen') body=v.tasks.map(t=>`
    <div class="task">
      <span class="chip chip--wash">${t.level}</span>
      <h3>${esc(t.title)}</h3>
      <div class="explain" style="background:var(--surface-2)">${esc(t.text)}</div>
      <div class="q" style="box-shadow:none;border:1px dashed var(--line);margin-top:12px">
        <div class="q__prompt" style="font-size:1.05rem">${esc(t.q.q)}</div>
        <div class="opts">${t.q.options.map((o,i)=>`<button class="opt" data-q="${t.id}" data-i="${i}" data-a="${t.q.answer}">${esc(o)}</button>`).join('')}</div>
        <div class="explain" id="hex-${t.id}" style="display:none"></div>
      </div>
    </div>`).join('');

  if(name==='Schreiben'){
    body=`
    <div class="card pad" style="margin-bottom:18px">
      <h3 style="margin-top:0">🧰 ${esc(v.phrases.title)}</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px">
        ${v.phrases.groups.map(g=>`<div><b style="color:var(--primary-ink)">${esc(g.h)}</b><ul style="margin:6px 0 0;padding-left:18px">${g.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}
      </div>
    </div>
    ${v.tasks.map(t=>`
    <div class="task">
      <span class="chip chip--wash">${t.level}</span>
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.prompt_de)}</p>
      <b>Bearbeite alle 4 Punkte:</b>
      <ul>${t.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
      <textarea class="writing-area" data-w="${t.id}" placeholder="Schreib deinen Brief hier… (mind. ca. 40 Wörter)">${esc(Store.getWriting(t.id))}</textarea>
      <div class="wordcount" id="wc-${t.id}">0 Wörter</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn--ghost btn--sm" data-savew="${t.id}">💾 Entwurf speichern</button>
        <button class="btn btn--ghost btn--sm" data-model="${t.id}">Musterbrief zeigen</button>
      </div>
      <div id="model-${t.id}" style="display:none" class="explain good"><b>Musterlösung:</b><br>${t.model.split('\n').map(esc).join('<br>')}</div>
    </div>`).join('')}`;
  }

  if(name==='Sprechen'){
    const micNote = Speech.recSupported() ? '' : '<div class="tipbox callout-danger"><div class="ic">⚠️</div><div>Dein Browser unterstützt die Spracherkennung nicht gut. <b>Tipp:</b> Öffne die Seite in <b>Google Chrome</b> für das Mikrofon. Vorlesen & Zuhören klappt aber überall.</div></div>';
    body=`${micNote}${v.tasks.map(t=>`
    <div class="task">
      <span class="chip chip--wash">${t.level}</span>
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.prompt_de)}</p>
      <div><b>Satzanfänge:</b><ul>${t.starters.map(s=>`<li>${esc(s)} <button class="btn btn--ghost btn--sm" data-say="${esc(s)}">🔊</button></li>`).join('')}</ul></div>
      <div style="text-align:center;margin-top:14px">
        <button class="mic" data-mic="${t.id}">🎙️</button>
        <div style="color:var(--ink-faint);font-size:.85rem;margin-top:8px">Tippe & sprich frei. Ich zeige, was ich verstanden habe.</div>
        <div class="explain" id="mic-${t.id}" style="display:none;text-align:left"></div>
      </div>
    </div>`).join('')}`;
  }

  const inner=`
  <div class="wrap lesson">
    <div class="lesson__hero" style="background:linear-gradient(135deg,${v.color},${v.color}cc)">
      <div class="kicker">Prüfungstraining</div>
      <h1>${v.icon} ${esc(name)}</h1>
    </div>
    <div class="bilingual"><div class="en"><span class="tag">English</span>${esc(v.lead_en)}</div><div class="de"><span class="tag">Deutsch</span>${esc(v.lead_de)}</div></div>
    <div style="margin:10px 0"><button class="btn btn--ghost btn--sm" data-nav="#/pruefung">← alle Fertigkeiten</button></div>
    ${body}
  </div>`;
  render(inner);
  $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
  $$('[data-say]').forEach(b=>b.onclick=()=>Speech.speak(b.dataset.say, Store.get().settings.ttsRate));
  $$('[data-reveal]').forEach(b=>b.onclick=()=>{const el=$('#'+b.dataset.reveal);el.style.display=el.style.display==='none'?'block':'none';});

  // Hören/Lesen MC checking
  $$('.opt[data-q]').forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.q; const box=$('#hex-'+id);
    if(box.style.display==='block') return;
    const ok=+btn.dataset.i===+btn.dataset.a;
    $$(`.opt[data-q="${id}"]`).forEach(b=>b.style.pointerEvents='none');
    btn.classList.add(ok?'correct':'wrong');
    if(!ok) $$(`.opt[data-q="${id}"]`)[+btn.dataset.a].classList.add('correct');
    const task=v.tasks.find(t=>t.id===id);
    box.style.display='block'; box.className='explain '+(ok?'good':'bad');
    box.innerHTML=`<div class="h">${ok?'✅ Richtig!':'💛 Nicht ganz.'}</div>${esc(task.q.explain||'')}`;
  });

  // Schreiben interactions
  $$('.writing-area').forEach(ta=>{
    const id=ta.dataset.w; const wc=$('#wc-'+id);
    const count=()=>{ const n=(ta.value.trim().match(/\S+/g)||[]).length; wc.textContent=n+' Wörter'; };
    ta.addEventListener('input',count); count();
  });
  $$('[data-savew]').forEach(b=>b.onclick=()=>{const id=b.dataset.savew;Store.saveWriting(id,$(`.writing-area[data-w="${id}"]`).value);toast('Entwurf gespeichert 💾','good');});
  $$('[data-model]').forEach(b=>b.onclick=()=>{const el=$('#model-'+b.dataset.model);el.style.display=el.style.display==='none'?'block':'none';});

  // Sprechen mic
  $$('[data-mic]').forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.mic; const out=$('#mic-'+id);
    out.style.display='block'; out.innerHTML='🎧 Ich höre zu… sprich jetzt!';
    btn.classList.add('rec');
    Speech.listen(
      (final,interim)=>{ out.innerHTML='<b>Ich verstehe:</b> '+esc(final||interim); },
      (err,final)=>{ btn.classList.remove('rec');
        if(err==='unsupported'){ out.innerHTML='⚠️ Bitte Google Chrome benutzen fürs Mikrofon.'; return; }
        if(err&&err!=='no-speech'){ out.innerHTML='Hmm, ich konnte nichts hören. Versuch es nochmal 🎙️'; return; }
        out.innerHTML=`<div class="h">Klasse, du hast gesprochen! 🎉</div><b>Verstanden:</b> ${esc(final||'-')}<br><small style="color:var(--ink-faint)">Vergleiche mit den Satzanfängen. Jeder Versuch macht dich sicherer.</small>`;
      }
    );
  });
}

/* =====================================================================
   Mascot chat dock
   ===================================================================== */
let chatOpen=false;
function mountMascotFab(){
  const root=$('#mascot-root');
  root.innerHTML=`<div class="mascot-fab">
    <div class="mascot-fab__bubble" id="lumi-bubble">Hallo, ich bin Lumikuttan. Brauchst du Hilfe? 🦉</div>
    <button class="mascot-fab__btn" id="lumi-open">🦉</button>
  </div>`;
  $('#lumi-open').onclick=openChat;
  setTimeout(()=>{const b=$('#lumi-bubble'); if(b) b.style.display='none';}, 6000);
}
function openChat(){
  if(chatOpen) return; chatOpen=true;
  const root=$('#mascot-root');
  root.innerHTML=`<div class="chat">
    <div class="chat__head"><span class="av">🦉</span><div class="who">Lumikuttan<small>deine Deutsch-Begleiterin</small></div><button class="x" id="lumi-close">×</button></div>
    <div class="chat__body" id="chat-body"></div>
    <div class="chat__quick" id="chat-quick"></div>
    ${Lumikuttan.deepEnabled()?'<div class="deep-hint">„Tiefer erklären“ nutzt KI, nur wenn du es brauchst.</div>':''}
    <div class="chat__foot"><input id="chat-in" placeholder="Frag mich etwas auf Deutsch oder Englisch…" /><button id="chat-send">➤</button></div>
  </div>`;
  $('#lumi-close').onclick=()=>{chatOpen=false;mountMascotFab();};
  const quick=['Wie funktioniert „weil“?','Wann Dativ oder Akkusativ?','Was ist im DTZ dran?','Ich bin nervös 😟'];
  $('#chat-quick').innerHTML=quick.map(q=>`<button data-q="${esc(q)}">${esc(q)}</button>`).join('');
  $$('#chat-quick button').forEach(b=>b.onclick=()=>{ $('#chat-in').value=b.dataset.q; send(); });
  addBot(Lumikuttan.greeting());
  const input=$('#chat-in');
  $('#chat-send').onclick=send;
  input.addEventListener('keydown',e=>{if(e.key==='Enter')send();});
  input.focus();
}
function addBot(html){ const b=$('#chat-body'); if(!b) return; const d=document.createElement('div'); d.className='msg bot'; d.innerHTML=html; b.appendChild(d); b.scrollTop=b.scrollHeight; return d; }
function addMe(text){ const b=$('#chat-body'); const d=document.createElement('div'); d.className='msg me'; d.textContent=text; b.appendChild(d); b.scrollTop=b.scrollHeight; }
function typing(){ return addBot('<span class="typing"><i></i><i></i><i></i></span>'); }
async function send(){
  const input=$('#chat-in'); const text=(input.value||'').trim(); if(!text) return;
  addMe(text); input.value='';
  const t=typing();
  await new Promise(r=>setTimeout(r,350));
  const res=Lumikuttan.answerGrounded(text);
  t.innerHTML=res.text;
  if(res.canDeepen && Lumikuttan.deepEnabled()){
    const wrap=document.createElement('div'); wrap.style.marginTop='8px';
    const btn=document.createElement('button'); btn.className='btn btn--ghost btn--sm'; btn.textContent='🧠 Tiefer erklären';
    btn.onclick=async()=>{ btn.disabled=true; btn.textContent='denke nach…';
      const tt=typing();
      try{ const ctx=byId((location.hash.match(/lesson\/([^/]+)/)||[])[1]);
        const ans=await Lumikuttan.deepAnswer(text, ctx?`Aktuelles Thema: ${ctx.title}: ${(ctx.grammar||[]).map(g=>g.title).join(', ')}`:'');
        tt.innerHTML=esc(ans).replace(/\n/g,'<br>');
      }catch(e){ tt.innerHTML='Die KI-Antwort ist gerade nicht erreichbar. Aber meine Grund-Erklärung oben stimmt! 🦉'; }
      btn.remove();
    };
    wrap.appendChild(btn); $('#chat-body').appendChild(wrap);
  }
}

/* =====================================================================
   Onboarding + toast + confetti
   ===================================================================== */
function onboard(){
  const ov=document.createElement('div'); ov.className='overlay';
  ov.innerHTML=`<div class="modal">
    <div class="owl">🦉</div>
    <h2>Hallo, ich bin Lumikuttan.</h2>
    <p style="color:var(--ink-soft)">Ich begleite dich Schritt für Schritt zu deiner B1-Prüfung, ganz entspannt. Wie darf ich dich nennen?</p>
    <input id="ob-name" placeholder="Dein Vorname…" value="Natasha" maxlength="24" />
    <button class="btn btn--accent btn--block" id="ob-go">Los geht's! 🚀</button>
    <p style="font-size:.8rem;color:var(--ink-faint);margin:14px 0 0">Kein Konto, kein Passwort. Alles bleibt privat auf deinem Laptop.</p>
  </div>`;
  document.body.appendChild(ov);
  const done=()=>{ const n=$('#ob-name').value.trim()||'Natasha'; Store.setName(n); ov.remove(); toast(`Schön, dich kennenzulernen, ${n}!`,'good'); route(); };
  $('#ob-go').onclick=done;
  $('#ob-name').addEventListener('keydown',e=>{if(e.key==='Enter')done();});
  $('#ob-name').focus();
}
function toast(msg,kind=''){ const host=$('#toast-host'); const t=document.createElement('div'); t.className='toast '+kind; t.innerHTML=msg; host.appendChild(t); setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(-8px)';setTimeout(()=>t.remove(),300);},2600); }
function confetti(){ const c=document.createElement('div'); c.className='confetti'; const cols=['#5B7FFF','#FF7A59','#22B981','#F5C451','#EC4899','#8B5CF6']; for(let i=0;i<90;i++){const s=document.createElement('i');s.style.left=Math.random()*100+'vw';s.style.background=cols[i%cols.length];s.style.animationDuration=(2+Math.random()*2)+'s';s.style.animationDelay=(Math.random()*.6)+'s';s.style.transform=`rotate(${Math.random()*360}deg)`;c.appendChild(s);} document.body.appendChild(c); setTimeout(()=>c.remove(),4200); }
window.__toast=toast;

/* =====================================================================
   Router
   ===================================================================== */
function route(){
  if(!Store.hasOnboarded()){ onboard(); return; }
  const h=location.hash||'#/';
  const mLesson=h.match(/^#\/lesson\/(.+)$/);
  const mQuiz=h.match(/^#\/quiz\/(.+)$/);
  const mSkill=h.match(/^#\/skill\/(.+)$/);
  if(mLesson) return viewLesson(mLesson[1]);
  if(mQuiz) return viewQuiz(mQuiz[1]);
  if(mSkill) return viewSkill(decodeURIComponent(mSkill[1]));
  if(h.startsWith('#/roadmap')) return viewRoadmap();
  if(h.startsWith('#/pruefung')) return viewPruefung();
  return viewHome();
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', ()=>{ mountMascotFab(); route(); });
// DOMContentLoaded may have already fired (module is deferred):
if(document.readyState!=='loading'){ mountMascotFab(); route(); }
