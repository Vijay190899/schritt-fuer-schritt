/* =========================================================================
   Schritt für Schritt, application core
   ========================================================================= */
import { Store } from './store.js?v=2';
import { SYLLABUS, SKILLS, EXAM_INFO, PHONETIK, VOCAB, ACHIEVEMENTS, IDIOMS, SOUNDS } from './data.js?v=7';
import { Speech, compareSpoken } from './speech.js?v=6';
import { Lumikuttan } from './mascot.js?v=9';

const CFG = window.SFS_CONFIG || { PASS_THRESHOLD:0.7, QUESTIONS_PER_QUIZ:7 };
const THRESHOLD = CFG.PASS_THRESHOLD ?? 0.7;
const N_Q = CFG.QUESTIONS_PER_QUIZ ?? 7;

document.documentElement.setAttribute('data-theme', Store.theme);

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

/* =====================================================================
   GAME LAYER: decks, levels, badges, celebrations
   ===================================================================== */
const deckById = id => VOCAB.find(d => d.id === id);
const deckForModule = mid => VOCAB.find(d => d.moduleId === mid);
const cardId = (deck, i) => deck.id + ':' + i;
function deckProgress(deck) {
  const known = deck.cards.filter((_, i) => Store.isKnown(cardId(deck, i))).length;
  return { known, total: deck.cards.length, pct: Math.round(known / deck.cards.length * 100) };
}

function computeStats() {
  const passed = ALL.filter(m => Store.isPassed(m.id)).length;
  return {
    passed, total: ALL.length,
    words: Store.learnedWords(),
    streak: Store.get().streak.count,
    perfect: Store.flag('perfect'),
    micUsed: Store.flag('micUsed'),
    wroteDraft: Store.flag('wroteDraft'),
    a2done: SYLLABUS[0].modules.every(m => Store.isPassed(m.id)),
    b11done: SYLLABUS[1].modules.every(m => Store.isPassed(m.id)),
    firstStep: Object.keys(Store.get().visited).length > 0,
    deckDone: VOCAB.some(d => deckProgress(d).known === d.cards.length)
  };
}
function badgeUnlocked(id, st) {
  switch (id) {
    case 'first_step': return st.firstStep;
    case 'first_pass': return st.passed >= 1;
    case 'perfect':    return st.perfect;
    case 'words25':    return st.words >= 25;
    case 'words100':   return st.words >= 100;
    case 'deck_done':  return st.deckDone;
    case 'streak3':    return st.streak >= 3;
    case 'streak7':    return st.streak >= 7;
    case 'speaker':    return st.micUsed;
    case 'writer':     return st.wroteDraft;
    case 'a2done':     return st.a2done;
    case 'b11done':    return st.b11done;
    case 'half':       return st.passed / st.total >= 0.5;
    case 'graduate':   return st.passed === st.total;
    default: return false;
  }
}
function syncBadges() {
  const st = computeStats(); const newly = [];
  for (const a of ACHIEVEMENTS)
    if (!Store.hasBadge(a.id) && badgeUnlocked(a.id, st)) { Store.unlockBadge(a.id); newly.push(a); }
  return newly;
}
function celebrateBadges(list) {
  list.forEach((a, i) => setTimeout(() => { toast(`${a.icon} New badge: <b>${esc(a.title)}</b>!`, 'good'); confetti(); }, i * 900));
}
/* Call after any state change; pass the level index captured BEFORE an XP gain to detect level-ups. */
function gameCheck(prevLevelIdx) {
  if (typeof prevLevelIdx === 'number') {
    const now = Store.levelInfo();
    if (now.idx > prevLevelIdx)
      setTimeout(() => { toast(`⭐ Level ${now.level}! You are now <b>${esc(now.title)}</b>.`, 'good'); confetti(); }, 300);
  }
  const newly = syncBadges();
  if (newly.length) celebrateBadges(newly);
}

/* ---------- shell ---------- */
function shell(inner, active='') {
  const s = Store.get();
  const streak = s.streak.count;
  const lv = Store.levelInfo();
  return `
  <header class="topbar"><div class="topbar__in">
    <div class="brand" data-nav="#/"><span class="logo">🦉</span> Schritt für Schritt</div>
    <nav class="nav">
      <a data-nav="#/" class="${active==='home'?'active':''}">Home</a>
      <a data-nav="#/roadmap" class="${active==='roadmap'?'active':''}">Roadmap</a>
      <a data-nav="#/vokabeln" class="${active==='vokabeln'?'active':''}">Vocabulary</a>
      <a data-nav="#/feel" class="${active==='feel'?'active':''}">Feel 🎲</a>
      <a data-nav="#/pruefung" class="${active==='pruefung'?'active':''}">Exam</a>
      <a data-nav="#/phrases" class="${active==='phrases'?'active':''}">Phrases</a>
      <a data-nav="#/belohnungen" class="${active==='belohnungen'?'active':''}">Rewards</a>
      <button class="theme-toggle" id="theme-toggle" title="Toggle dark mode">${Store.theme==='dark'?'☀️':'🌙'}</button>
    </nav>
    <span class="lvchip" data-nav="#/belohnungen" title="Your level"><b>Lv ${lv.level}</b><span class="lvbar"><span style="width:${lv.pct}%"></span></span></span>
    ${streak>0?`<span class="streak" title="Day streak">🔥 ${streak}</span>`:''}
  </div></header>
  <main>${inner}</main>
  <footer class="footer"><div class="wrap">
    Your progress is saved only in this browser ·
    <a href="#" data-action="reset">Reset progress</a>
  </div></footer>`;
}
function render(inner, active) {
  $('#app').innerHTML = shell(inner, active);
  $$('[data-nav]').forEach(b => b.onclick = () => go(b.dataset.nav));
  const tt = $('#theme-toggle');
  if (tt) {
    tt.onclick = () => {
      const nxt = Store.theme === 'dark' ? 'light' : 'dark';
      Store.setTheme(nxt);
      document.documentElement.setAttribute('data-theme', nxt);
      tt.textContent = nxt === 'dark' ? '☀️' : '🌙';
    };
  }
  const rst = $('[data-action=reset]');
  if (rst) rst.onclick = e => { e.preventDefault(); if (confirm('Really erase all your saved progress?')) { Store.reset(); go('#/'); location.reload(); } };
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
  const lv = Store.levelInfo();
  const daily = Store.daily();
  const words = Store.learnedWords();
  const badgeCount = ACHIEVEMENTS.filter(a => Store.hasBadge(a.id)).length;
  const current = ALL.find(m => isUnlocked(m) && !Store.isPassed(m.id)) || ALL[ALL.length-1];
  const curDeck = deckForModule(current.id) || VOCAB[0];
  const dpct = Math.min(100, Math.round(daily.xp / daily.goal * 100));
  const ring = `conic-gradient(var(--success) ${dpct*3.6}deg, var(--bg-tint) 0)`;
  const inner = `
  <div class="wrap">
    ${Store.flag('seen_update_speak') ? '' : `
    <div class="update-banner" id="update-banner">
      <div>
        <span class="update-banner__tag">✨ New update</span>
        <ul class="update-banner__list">
          <li>New <b>Pronunciation trainer</b>: hear a word, record yourself, compare, and get a gentle AI check on what you said. <button class="btn btn--ghost btn--sm" data-nav="#/aussprache">Try it →</button></li>
          <li>New <b>Sprachgefühl</b> game: a no-pressure way to train your gut feeling for <b>der / die / das</b>. <button class="btn btn--ghost btn--sm" data-nav="#/feel">Play →</button></li>
        </ul>
      </div>
      <button class="update-banner__x" data-dismiss-update title="Got it">×</button>
    </div>`}
    <section class="hero"><div class="hero__grid">
      <div>
        <p class="eyebrow">Your path to the B1 exam</p>
        <h1>Welcome back${name?`, ${esc(name)}`:''}. 🌟</h1>
        <p class="lead">Take it easy. We go <b>one step at a time</b>, no rush. A small step today, the next one tomorrow. I'll be right beside you the whole way.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px">
          <button class="btn btn--accent" data-nav="#/lesson/${current.id}">▶︎ Keep learning: ${esc(current.title)}</button>
          <button class="btn btn--ghost" data-nav="#/flash/${curDeck.id}">🃏 Practice vocabulary</button>
          <button class="btn btn--ghost" data-nav="#/feel">🎲 Sprachgefühl game</button>
        </div>
      </div>
      <div class="hero__owl"><span class="owl__bird">🦉</span></div>
    </div></section>

    <section class="section">
      <div class="gband">
        <div class="gcard glevel" data-nav="#/belohnungen">
          <div class="gcard__top"><span>Level ${lv.level}</span><b>${esc(lv.title)}</b></div>
          <div class="progressbar"><span style="width:${lv.pct}%"></span></div>
          <div class="gcard__sub">${lv.max?`${lv.xp} XP · top level!`:`${lv.into}/${lv.span} XP to “${esc(lv.nextTitle)}”`}</div>
        </div>
        <div class="gcard gdaily">
          <div class="ring" style="background:${ring}"><div class="ring__in">${dpct}%</div></div>
          <div><b>Daily goal</b><div class="gcard__sub">${daily.xp}/${daily.goal} XP today</div></div>
        </div>
        <div class="gcard gmini" data-nav="#/vokabeln"><div class="n prim">${words}</div><div class="l">Words learned</div></div>
        <div class="gcard gmini" data-nav="#/roadmap"><div class="n good">${p.done}/${p.total}</div><div class="l">Chapters done</div></div>
        <div class="gcard gmini" data-nav="#/belohnungen"><div class="n accent">${badgeCount}/${ACHIEVEMENTS.length}</div><div class="l">Badges</div></div>
      </div>
    </section>

    <section class="section">
      <div class="section__head"><div><h2>Your exam skills</h2><p>The exam tests reading, listening, writing and speaking. Speaking matters most, so practise it often.</p></div></div>
      <div class="skillgrid">
        ${Object.entries(SKILLS).map(([k,v])=>`
          <div class="skillcard" style="background:linear-gradient(140deg,${v.color},${v.color}cc)" data-nav="#/skill/${encodeURIComponent(k)}">
            <div class="ic">${v.icon}</div>
            <div><h3>${k}</h3><p>${k==='Hören'?'Listening practice':k==='Lesen'?'Reading practice':k==='Schreiben'?'Letters & emails':'Speak out loud'}</p></div>
          </div>`).join('')}
        <div class="skillcard" style="background:linear-gradient(140deg,#8B5CF6,#8B5CF6cc)" data-nav="#/aussprache">
          <div class="ic">🗣️</div>
          <div><h3>Aussprache</h3><p>Pronunciation: hear, record, compare</p></div>
        </div>
      </div>
    </section>
  </div>`;
  render(inner, 'home');
  $$('[data-nav]').forEach(b => b.onclick = () => go(b.dataset.nav));
  const ub = $('[data-dismiss-update]');
  if (ub) ub.onclick = () => { Store.setFlag('seen_update_speak'); const el = $('#update-banner'); if (el) el.remove(); };
}

/* =====================================================================
   VIEW: Roadmap
   ===================================================================== */
function viewRoadmap() {
  const inner = `
  <div class="wrap">
    <section class="hero" style="padding:36px 0 6px">
      <p class="eyebrow">Your roadmap</p>
      <h1>From A2 to the B1 exam</h1>
      <p class="lead">Each chapter unlocks the next one as soon as you score <b>70%</b> on its quiz. Unlimited tries, with fresh questions every time. No pressure at all.</p>
    </section>
    <section class="section">
      ${SYLLABUS.map((ph,pi)=>{
        const mods = ph.modules;
        const done = mods.filter(m=>Store.isPassed(m.id)).length;
        return `
        <div class="phase">
          <div class="phase__label"><span class="dot" style="background:${ph.color}"></span>
            <h3>${esc(ph.phase)}</h3><span class="meta">${done}/${mods.length} done</span></div>
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
                  ${passed?`<div class="check">✓</div><div class="lbl">passed</div>`
                    : unlocked?`<div class="pct">${pct?pct+'%':'-'}</div><div class="lbl">${q.attempts?'best score':'start here'}</div>`
                    : `<div class="lbl">🔒 locked</div>`}
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
    if (!id) { n.onclick = ()=> toast('Finish the previous chapter with 70% first 🔒','warn'); return; }
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
  if(!isUnlocked(m)){ toast('This chapter is still locked 🔒','warn'); go('#/roadmap'); return; }
  Store.visitLesson(id); Store.touchStreak();
  const q = Store.quiz(id);
  const deck = deckForModule(id);
  const dp = deck ? deckProgress(deck) : null;
  const deckHtml = deck ? `
    <div class="card pad" style="display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-top:20px">
      <div><h3 style="margin:0">🃏 Vocabulary: ${esc(deck.title)}</h3><p style="color:var(--ink-soft);margin:4px 0 0">${dp.known}/${dp.total} learned. Quick flip cards.</p></div>
      <button class="btn btn--ghost" data-nav="#/flash/${deck.id}">Practice cards →</button>
    </div>` : '';
  const inner = `
  <div class="wrap lesson">
    <div class="lesson__hero" style="background:linear-gradient(135deg,${m.color},${m.color}cc)">
      <div class="kicker">${esc(m.phaseName)} ${typeof m.lektion==='number'?'· Lesson '+m.lektion:''}</div>
      <h1>${m.icon} ${esc(m.title)}</h1>
      <p class="lead">${esc(m.subtitle)}</p>
      <div class="goals">${(m.goals||[]).map(g=>`<span class="chip">🎯 ${esc(g)}</span>`).join('')}</div>
    </div>

    ${m.wortfelder?`<p style="color:var(--ink-soft)"><b>Vocabulary topics:</b> ${m.wortfelder.map(esc).join(' · ')}</p>`:''}

    ${m.grammar.length>1?`<div class="gtoc">${m.grammar.map((g,i)=>`<button data-jump="c${i}" class="${i===0?'active':''}">${esc(g.title)}</button>`).join('')}</div>`:''}

    ${m.grammar.map((g,i)=>`
      <div class="concept" id="c${i}">
        <h3><span class="num">${i+1}</span> ${esc(g.title)}</h3>
        <p style="color:var(--ink-faint);margin:-4px 0 10px"><b>EN:</b> ${esc(g.en)} &nbsp;·&nbsp; <b>DE:</b> ${esc(g.de)}</p>
        ${g.blocks.map(renderBlock).join('')}
      </div>`).join('')}

    ${deckHtml}

    <div class="card pad" style="text-align:center;margin-top:20px">
      <h3 style="margin-top:0">Ready for a short quiz? 🧠</h3>
      <p style="color:var(--ink-soft)">${q.passed?'You already passed this quiz, but a little review never hurts. Fresh questions are waiting.':'No worries: unlimited tries, new questions each time. You need 70% to move on.'}</p>
      <button class="btn btn--accent" data-nav="#/quiz/${id}">Start quiz →</button>
    </div>
  </div>`;
  render(inner);
  $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
  $$('[data-jump]').forEach(b=>b.onclick=()=>{
    $$('.gtoc button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    $('#'+b.dataset.jump).scrollIntoView({behavior:'smooth'});
  });
  gameCheck();
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
        <button class="btn btn--ghost btn--sm" data-nav="#/lesson/${id}">← back</button>
        <span class="chip chip--wash">Question ${idx+1} / ${set.length}</span>
      </div>
      <div class="quiz__meter"><span style="width:${(idx/set.length)*100}%"></span></div>
      <div class="q">
        <div class="q__prompt">${esc(q.q)}</div>
        ${q.en?`<div class="q__hint">🇬🇧 ${esc(q.en)}</div>`:''}
        ${q.type==='mc'
          ? `<div class="opts">${q._opts.map((o,i)=>`<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`
          : `<input class="fillin" placeholder="Your answer…" autocomplete="off" autocapitalize="off" /><div style="margin-top:12px"><button class="btn btn--primary" data-check>Check</button></div>`}
        <div class="explain" id="ex" style="display:none"></div>
        <div id="nextwrap" style="display:none;margin-top:16px;text-align:right">
          <button class="btn btn--accent" data-next>${idx+1<set.length?'Next question →':'See result →'}</button>
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
      ex.innerHTML=`<div class="h">${ok?'✅ Correct!':'💛 Almost! No problem, that is how we learn.'}</div>${esc(q.explain||'')}`;
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
        if(!ok){ const ex=$('#ex'); ex.innerHTML+=`<div style="margin-top:6px"><b>Correct answer:</b> ${esc(acc[0])}</div>`; }
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
    const prevIdx=Store.levelInfo().idx;
    const rec=Store.recordQuiz(id, frac, THRESHOLD);
    Store.touchStreak();
    const passed=frac>=THRESHOLD;
    const nxt=nextModule(id);
    const emoji=passed?(pct===100?'🏆':'🎉'):'🌱';
    const heading=passed?(pct===100?'Perfect! All correct!':'You did it! Passed!'):'Not quite yet, and that is completely okay.';
    const msg=passed
      ? `You got ${correct} of ${set.length} right (${pct}%). ${nxt&&isUnlocked(byId(nxt.id))?`The next chapter <b>“${esc(nxt.title)}”</b> is now unlocked! 🔓`:'You are doing great!'}`
      : `You got ${correct} of ${set.length} right (${pct}%). You need 70%, and you will get there next time easily. <b>New questions, new try.</b> I believe in you.`;

    const inner=`
    <div class="wrap quiz"><div class="q result">
      <div class="result__emoji">${emoji}</div>
      <h2>${heading}</h2>
      <p class="msg">${msg}</p>
      <div class="result__actions">
        ${passed
          ? (nxt&&isUnlocked(byId(nxt.id))
              ? `<button class="btn btn--accent" data-nav="#/lesson/${nxt.id}">Continue to “${esc(nxt.title)}” →</button>`
              : `<button class="btn btn--accent" data-nav="#/roadmap">To the roadmap →</button>`)
          : `<button class="btn btn--accent" data-retry>Try again (new questions) 🔁</button>`}
        <button class="btn btn--ghost" data-nav="#/lesson/${id}">Review the grammar</button>
      </div>
    </div></div>`;
    render(inner);
    $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
    const r=$('[data-retry]'); if(r) r.onclick=()=>viewQuiz(id);
    if(passed) confetti();
    if(!passed) setTimeout(()=>toast(Lumikuttan.encourage()), 500);
    gameCheck(prevIdx);
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
      <p class="eyebrow">Exam training</p>
      <h1>${esc(EXAM_INFO.title)}</h1>
      <div class="bilingual" style="margin-top:14px"><div class="en"><span class="tag">English</span>${esc(EXAM_INFO.intro_en)}</div><div class="de"><span class="tag">Deutsch</span>${esc(EXAM_INFO.intro_de)}</div></div>
    </section>
    <section class="section">
      <div class="section__head"><div><h2>The four parts</h2><p>Tap a skill to train it.</p></div></div>
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
      <div class="section__head"><div><h2>Pronunciation cheat sheet 🗣️</h2><p>From the workbook. Tap 🔊 to hear each example.</p></div><button class="btn btn--accent btn--sm" data-nav="#/aussprache">Open the pronunciation trainer →</button></div>
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
        <div style="flex:1"><b>Play the audio</b><br><small style="color:var(--ink-faint)">Play it as often as you like. Listen first, then answer.</small></div>
        <button class="btn btn--ghost btn--sm" data-reveal="script-${t.id}">Show text</button>
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
      <div class="explain" style="background:var(--surface-2);line-height:1.65">${esc(t.text).replace(/\n/g,'<br>')}</div>
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
      <b>Cover all four points:</b>
      <ul>${t.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
      <textarea class="writing-area" data-w="${t.id}" placeholder="Write your letter here… (about 40+ words)">${esc(Store.getWriting(t.id))}</textarea>
      <div class="wordcount" id="wc-${t.id}">0 words</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn--ghost btn--sm" data-savew="${t.id}">💾 Save draft</button>
        <button class="btn btn--ghost btn--sm" data-model="${t.id}">Show model letter</button>
      </div>
      <div id="model-${t.id}" style="display:none" class="explain good"><b>Model answer:</b><br>${t.model.split('\n').map(esc).join('<br>')}</div>
    </div>`).join('')}`;
  }

  if(name==='Sprechen'){
    const micNote = Speech.recSupported() ? '' : '<div class="tipbox callout-danger"><div class="ic">⚠️</div><div>Your browser does not support speech recognition well. <b>Tip:</b> open the page in <b>Google Chrome</b> for the mic. Reading aloud and listening work everywhere.</div></div>';
    body=`${micNote}${v.tasks.map(t=>`
    <div class="task">
      <span class="chip chip--wash">${t.level}</span>
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.prompt_de)}</p>
      <div><b>Sentence starters:</b><ul>${t.starters.map(s=>`<li>${esc(s)} <button class="btn btn--ghost btn--sm" data-say="${esc(s)}">🔊</button></li>`).join('')}</ul></div>
      <div style="text-align:center;margin-top:14px">
        <button class="mic" data-mic="${t.id}">🎙️</button>
        <div style="color:var(--ink-faint);font-size:.85rem;margin-top:8px">Press to start, then speak. Press again to stop. I'll show what I heard.</div>
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
    <div style="margin:10px 0"><button class="btn btn--ghost btn--sm" data-nav="#/pruefung">← all skills</button></div>
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
    box.innerHTML=`<div class="h">${ok?'✅ Correct!':'💛 Not quite.'}</div>${esc(task.q.explain||'')}`;
  });

  // Schreiben interactions
  $$('.writing-area').forEach(ta=>{
    const id=ta.dataset.w; const wc=$('#wc-'+id);
    const count=()=>{ const n=(ta.value.trim().match(/\S+/g)||[]).length; wc.textContent=n+' words'; };
    ta.addEventListener('input',count); count();
  });
  $$('[data-savew]').forEach(b=>b.onclick=()=>{const id=b.dataset.savew;Store.saveWriting(id,$(`.writing-area[data-w="${id}"]`).value);Store.setFlag('wroteDraft');toast('Draft saved 💾','good');gameCheck();});
  $$('[data-model]').forEach(b=>b.onclick=()=>{const el=$('#model-'+b.dataset.model);el.style.display=el.style.display==='none'?'block':'none';});

  // Sprechen mic (press to start, press again to stop)
  $$('[data-mic]').forEach(btn=>{
    let controller=null;
    btn.onclick=()=>{
      const id=btn.dataset.mic; const out=$('#mic-'+id);
      if(controller){ controller.stop(); controller=null; return; }  // second press = stop
      out.style.display='block'; out.innerHTML='🎧 Listening… speak now, then press 🎙️ again to stop.';
      btn.classList.add('rec');
      controller=Speech.listen(
        (final,interim)=>{ out.innerHTML='<b>I hear:</b> '+esc(final||interim||'…'); },
        (err,final)=>{ btn.classList.remove('rec'); controller=null;
          if(err==='unsupported'||err==='not-allowed'||err==='service-not-allowed'){
            out.innerHTML='⚠️ The mic needs permission and works best in <b>Google Chrome</b>. If a mic icon in the address bar is blocked, click it and choose <b>Allow</b>.'; return; }
          if(err==='network'){ out.innerHTML='⚠️ Speech recognition needs internet. Check your connection and try again.'; return; }
          if(err){ out.innerHTML='Hmm, the mic stopped unexpectedly. Press 🎙️ to try again.'; return; }
          if(!final){ out.innerHTML='I did not catch anything. Press 🎙️ and speak a little louder 🙂'; return; }
          out.innerHTML=`<div class="h">Nice, you spoke! 🎉</div><b>I heard:</b> ${esc(final)}<br><small style="color:var(--ink-faint)">Compare it with the sentence starters. Every try makes you more confident.</small>`;
          Store.setFlag('micUsed'); gameCheck();
        }
      );
      if(!controller) btn.classList.remove('rec');
    };
  });
}

/* =====================================================================
   Mascot chat dock
   ===================================================================== */
let chatOpen=false;
let chatHistory=[];
function mountMascotFab(){
  const root=$('#mascot-root');
  root.innerHTML=`<div class="mascot-fab">
    <div class="mascot-fab__bubble" id="lumi-bubble">Hi, I'm Lumikuttan. Need a hand? 🦉</div>
    <button class="mascot-fab__btn" id="lumi-open" title="Ask Lumikuttan">🦉</button>
  </div>`;
  $('#lumi-open').onclick=openChat;
  setTimeout(()=>{const b=$('#lumi-bubble'); if(b) b.style.display='none';}, 6000);
}
function openChat(){
  if(chatOpen) return; chatOpen=true;
  const root=$('#mascot-root');
  const ai=Lumikuttan.aiEnabled();
  root.innerHTML=`<div class="chat">
    <div class="chat__head"><span class="av">🦉</span><div class="who">Lumikuttan<small>${ai?'your buddy · open-source AI':'your German study buddy'}</small></div><button class="x" id="lumi-close">×</button></div>
    <div class="chat__body" id="chat-body"></div>
    <div class="chat__quick" id="chat-quick"></div>
    ${ai?'<div class="deep-hint">Powered by an open-source LLM. Ask anything.</div>':'<div class="deep-hint">Offline mode: German grammar + encouragement. Turn on the AI brain for open questions.</div>'}
    <div class="chat__foot"><input id="chat-in" placeholder="Ask me anything, in English or German…" /><button id="chat-send">➤</button></div>
  </div>`;
  $('#lumi-close').onclick=()=>{chatOpen=false;mountMascotFab();};
  chatHistory=[];
  const quick=ai
    ? ['How does “weil” work?','Give me a quick study tip 🌟','What is on the DTZ exam?','I feel nervous 😟']
    : ['How does “weil” work?','Dativ or Akkusativ?','What is on the exam?','I feel nervous 😟'];
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
function lessonContext(){
  const ctx=byId((location.hash.match(/lesson\/([^/]+)/)||[])[1]);
  return ctx?`${ctx.title} (${(ctx.grammar||[]).map(g=>g.title).join(', ')})`:'';
}
async function send(){
  const input=$('#chat-in'); const text=(input.value||'').trim(); if(!text) return;
  addMe(text); input.value='';
  const t=typing();

  if(Lumikuttan.aiEnabled()){
    try{
      const ans=await Lumikuttan.ask(text, { lesson: lessonContext(), history: chatHistory.slice(-6) });
      t.innerHTML=esc(ans).replace(/\n/g,'<br>');
      chatHistory.push({role:'user',content:text},{role:'assistant',content:ans});
    }catch(e){
      const res=Lumikuttan.answerGrounded(text);
      t.innerHTML=res.text+'<br><small style="color:var(--ink-faint)">(offline answer, the AI brain is unreachable right now)</small>';
    }
    return;
  }

  // offline mode: curated German answers + encouragement
  await new Promise(r=>setTimeout(r,300));
  t.innerHTML=Lumikuttan.answerGrounded(text).text;
}

/* =====================================================================
   Onboarding + toast + confetti
   ===================================================================== */
function onboard(){
  if(document.querySelector('.overlay')) return;      // never stack two welcome cards
  const ov=document.createElement('div'); ov.className='overlay';
  ov.innerHTML=`<div class="modal">
    <div class="owl">🦉</div>
    <h2>Hi, I'm Lumikuttan.</h2>
    <p style="color:var(--ink-soft)">I'll guide you to your B1 exam, one small step at a time. Nice and calm. What should I call you?</p>
    <input id="ob-name" placeholder="Your first name…" value="Natasha" maxlength="24" />
    <button class="btn btn--accent btn--block" id="ob-go">Let's go! 🚀</button>
    <p style="font-size:.8rem;color:var(--ink-faint);margin:14px 0 0">No account, no password. Everything stays private on your laptop.</p>
  </div>`;
  document.body.appendChild(ov);
  const nameInput=ov.querySelector('#ob-name');
  const done=()=>{ const n=(nameInput.value||'').trim()||'Natasha'; Store.setName(n); ov.remove(); toast(`Nice to meet you, ${n}!`,'good'); route(); };
  ov.querySelector('#ob-go').onclick=done;
  nameInput.addEventListener('keydown',e=>{ if(e.key==='Enter') done(); });
  nameInput.focus();
}
function toast(msg,kind=''){ const host=$('#toast-host'); const t=document.createElement('div'); t.className='toast '+kind; t.innerHTML=msg; host.appendChild(t); setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(-8px)';setTimeout(()=>t.remove(),300);},2600); }
function confetti(){ const c=document.createElement('div'); c.className='confetti'; const cols=['#5B7FFF','#FF7A59','#22B981','#F5C451','#EC4899','#8B5CF6']; for(let i=0;i<90;i++){const s=document.createElement('i');s.style.left=Math.random()*100+'vw';s.style.background=cols[i%cols.length];s.style.animationDuration=(2+Math.random()*2)+'s';s.style.animationDelay=(Math.random()*.6)+'s';s.style.transform=`rotate(${Math.random()*360}deg)`;c.appendChild(s);} document.body.appendChild(c); setTimeout(()=>c.remove(),4200); }
window.__toast=toast;

/* =====================================================================
   VIEW: Vocabulary decks list
   ===================================================================== */
function viewVokabeln(){
  const known=Store.learnedWords();
  const total=VOCAB.reduce((s,d)=>s+d.cards.length,0);
  const inner=`
  <div class="wrap">
    <section class="hero" style="padding:36px 0 6px">
      <p class="eyebrow">Vocabulary</p>
      <h1>Vocabulary trainer 🃏</h1>
      <p class="lead">Flip cards: German on the front, translation on tap. The app remembers what you know. <b>${known}/${total}</b> words learned.</p>
    </section>
    <section class="section">
      <div class="deckgrid">
      ${VOCAB.map(d=>{ const dp=deckProgress(d); const done=dp.known===dp.total;
        return `<div class="deckcard ${done?'deckcard--done':''}" data-nav="#/flash/${d.id}">
          <div class="deckcard__top"><span class="deckcard__ic">🃏</span>${done?'<span class="deckcard__badge">✓ complete</span>':`<span class="deckcard__badge muted">${dp.total} cards</span>`}</div>
          <h3>${esc(d.title)}</h3>
          <div class="progressbar"><span style="width:${dp.pct}%"></span></div>
          <div class="deckcard__sub">${dp.known}/${dp.total} learned</div>
        </div>`;}).join('')}
      </div>
    </section>
  </div>`;
  render(inner,'vokabeln');
  $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
}

/* =====================================================================
   VIEW: Flashcard study session (reveal + Kannte ich / Nochmal)
   ===================================================================== */
/* A2 + B1 example sentences for a flashcard: from the card, the cache, or the AI. */
function renderEx(a2de,a2en,b1de,b1en){
  const row=(lvl,cls,de,en)=>`<div class="fcard__exrow"><span class="fcard__exlvl ${cls}">${lvl}</span><div><div class="fcard__exde">${esc(de||'…')}</div>${en?`<div class="fcard__exen">${esc(en)}</div>`:''}</div></div>`;
  return row('A2','a2',a2de,a2en)+row('B1','b1',b1de,b1en);
}
function fillExamples(card){
  const box=$('#fex'); if(!box) return;
  box.dataset.forDe=card.de;
  if(card.a2 && card.b1){ box.innerHTML=renderEx(card.a2[0],card.a2[1],card.b1[0],card.b1[1]); return; }
  const cached=Store.getExamples(card.de);
  if(cached){ box.innerHTML=renderEx(cached.a2de,cached.a2en,cached.b1de,cached.b1en); return; }
  if(!Lumikuttan.aiEnabled()){ box.innerHTML='<div class="fcard__exhint">Turn on Lumikuttan\'s AI brain to see A2 &amp; B1 examples.</div>'; return; }
  box.innerHTML='<div class="fcard__exhint">✨ Writing A2 &amp; B1 examples…</div>';
  Lumikuttan.examples(card.de, card.en).then(ex=>{
    if(ex && (ex.a2de||ex.b1de)) Store.setExamples(card.de, ex);
    const b=$('#fex'); if(b && b.dataset.forDe===card.de) b.innerHTML=renderEx(ex.a2de,ex.a2en,ex.b1de,ex.b1en);
  }).catch(()=>{ const b=$('#fex'); if(b && b.dataset.forDe===card.de) b.innerHTML='<div class="fcard__exhint">Examples are unavailable right now. They will appear next time.</div>'; });
}
function viewFlash(deckId){
  const deck=deckById(deckId);
  if(!deck){ go('#/vokabeln'); return; }
  Store.touchStreak();
  const prevIdx=Store.levelInfo().idx;
  // unknown cards first, then the rest, all shuffled within groups
  const idxs=deck.cards.map((_,i)=>i);
  const unknown=shuffle(idxs.filter(i=>!Store.isKnown(cardId(deck,i))));
  const knownAlready=shuffle(idxs.filter(i=>Store.isKnown(cardId(deck,i))));
  let queue=[...unknown,...knownAlready];
  let pos=0, revealed=false, learned=0;

  function sayText(de){ return de.replace(/[¨]/g,'').split(',')[0].trim(); }

  function paintCard(){
    if(pos>=queue.length) return finishDeck();
    const i=queue[pos]; const c=deck.cards[i];
    const doneCount=deck.cards.filter((_,j)=>Store.isKnown(cardId(deck,j))).length;
    const inner=`
    <div class="wrap flash">
      <div class="quiz__top">
        <button class="btn btn--ghost btn--sm" data-nav="#/vokabeln">← All decks</button>
        <span class="chip chip--wash">${esc(deck.title)}</span>
      </div>
      <div class="quiz__meter"><span style="width:${Math.round(doneCount/deck.cards.length*100)}%"></span></div>
      <div class="fcard" data-flip>
        <div class="fcard__hint">Card ${pos+1} / ${queue.length} · ${doneCount}/${deck.cards.length} learned</div>
        <div class="fcard__de">${esc(c.de)} <button class="fcard__say" data-say="${esc(sayText(c.de))}" title="Listen">🔊</button></div>
        <div class="fcard__answer" style="display:${revealed?'block':'none'}">
          <div class="fcard__en">${esc(c.en)}</div>
          <div class="fcard__ex-wrap" id="fex"></div>
        </div>
        ${!revealed?`<button class="btn btn--primary" data-reveal>Show translation</button>`:''}
      </div>
      ${revealed?`<div class="fcard__actions">
        <button class="btn btn--ghost" data-again>Practice again</button>
        <button class="btn btn--accent" data-known>I knew it ✓</button>
      </div>`:`<p class="fcard__tip">Tip: tap the card to flip it.</p>`}
    </div>`;
    render(inner);
    $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
    $$('[data-say]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); Speech.speak(b.dataset.say, Store.get().settings.ttsRate); });
    const reveal=()=>{ revealed=true; paintCard(); };
    const rv=$('[data-reveal]'); if(rv) rv.onclick=reveal;
    const card=$('[data-flip]'); if(card && !revealed) card.onclick=e=>{ if(!e.target.closest('[data-say]')) reveal(); };
    const again=$('[data-again]'); if(again) again.onclick=()=>{ queue.push(i); revealed=false; pos++; paintCard(); };
    const kn=$('[data-known]'); if(kn) kn.onclick=()=>{ const r=Store.recordFlash(cardId(deck,i)); if(r.isNew) learned++; revealed=false; pos++; paintCard(); };
    if(revealed) fillExamples(c);
  }

  function finishDeck(){
    const dp=deckProgress(deck);
    const full=dp.known===dp.total;
    const inner=`
    <div class="wrap quiz"><div class="q result">
      <div class="result__emoji">${full?'🏆':'🎉'}</div>
      <h2>${full?'Deck complete!':'Well done!'}</h2>
      <p class="msg">You learned <b>${learned}</b> new word${learned===1?'':'s'} this round. In total you know <b>${dp.known}/${dp.total}</b> cards in “${esc(deck.title)}”.</p>
      <div class="result__actions">
        <button class="btn btn--accent" data-nav="#/vokabeln">Other decks →</button>
        <button class="btn btn--ghost" data-restart>Go through again 🔁</button>
      </div>
    </div></div>`;
    render(inner);
    $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
    const rs=$('[data-restart]'); if(rs) rs.onclick=()=>viewFlash(deckId);
    if(full) confetti();
    gameCheck(prevIdx);
  }

  paintCard();
}

/* =====================================================================
   VIEW: Belohnungen (rewards / achievements)
   ===================================================================== */
function viewBelohnungen(){
  const lv=Store.levelInfo();
  const daily=Store.daily();
  const p=overallProgress();
  const words=Store.learnedWords();
  const dpct=Math.min(100,Math.round(daily.xp/daily.goal*100));
  const ring=`conic-gradient(var(--success) ${dpct*3.6}deg, var(--bg-tint) 0)`;
  const inner=`
  <div class="wrap">
    <section class="hero" style="padding:36px 0 6px">
      <p class="eyebrow">Rewards</p>
      <h1>Your achievements 🏅</h1>
    </section>
    <section class="section">
      <div class="levelbanner">
        <div class="levelbanner__lv">Lv ${lv.level}</div>
        <div style="flex:1;min-width:200px">
          <div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-family:var(--font-display);font-size:1.2rem">${esc(lv.title)}</b><span class="gcard__sub">${lv.xp} XP</span></div>
          <div class="progressbar" style="margin-top:8px"><span style="width:${lv.pct}%"></span></div>
          <div class="gcard__sub">${lv.max?'Top level reached!':`${lv.into}/${lv.span} XP to “${esc(lv.nextTitle)}”`}</div>
        </div>
        <div class="ring" style="background:${ring}"><div class="ring__in">${dpct}%</div></div>
      </div>
      <div class="gband" style="margin-top:16px">
        <div class="gcard gmini"><div class="n prim">${words}</div><div class="l">Words</div></div>
        <div class="gcard gmini"><div class="n good">${p.done}/${p.total}</div><div class="l">Chapters</div></div>
        <div class="gcard gmini"><div class="n accent">${Store.get().streak.count}</div><div class="l">Day streak</div></div>
        <div class="gcard gmini"><div class="n">${lv.xp}</div><div class="l">Total XP</div></div>
      </div>
    </section>
    <section class="section">
      <div class="section__head"><div><h2>Badges</h2><p>Collect them all on the way to the exam.</p></div></div>
      <div class="badgegrid">
      ${ACHIEVEMENTS.map(a=>{ const has=Store.hasBadge(a.id);
        return `<div class="badge ${has?'badge--on':'badge--off'}">
          <div class="badge__ic">${has?a.icon:'🔒'}</div>
          <div class="badge__t">${esc(a.title)}</div>
          <div class="badge__d">${esc(a.desc)}</div>
        </div>`;}).join('')}
      </div>
    </section>
  </div>`;
  render(inner,'belohnungen');
  $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
}

/* =====================================================================
   VIEW: Redewendungen (impressive idioms)
   ===================================================================== */
function viewIdioms(){
  Store.touchStreak();
  const inner=`
  <div class="wrap">
    <section class="hero" style="padding:36px 0 6px">
      <p class="eyebrow">Redewendungen</p>
      <h1>Cool phrases that impress 🎯</h1>
      <p class="lead">Real German idioms you rarely find in a textbook, but locals love. Drop one at the right moment and an examiner will smile. Tap 🔊 to hear it.</p>
    </section>
    <section class="section">
      <div class="idiomgrid">
      ${IDIOMS.map((it,i)=>`
        <div class="idiom">
          <div class="idiom__head">
            <div class="idiom__de">${esc(it.de)}</div>
            <button class="btn btn--ghost btn--sm" data-say="${esc(it.ex)}" title="Listen">🔊</button>
          </div>
          <div class="idiom__lit">literally: ${esc(it.lit)}</div>
          <div class="idiom__meaning"><b>Meaning:</b> ${esc(it.meaning)}</div>
          <div class="idiom__ex">„${esc(it.ex)}“<br><span class="idiom__ex-en">${esc(it.ex_en)}</span></div>
        </div>`).join('')}
      </div>
    </section>
  </div>`;
  render(inner,'phrases');
  $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
  $$('[data-say]').forEach(b=>b.onclick=()=>Speech.speak(b.dataset.say, Store.get().settings.ttsRate));
}

/* =====================================================================
   VIEW: Sprachgefühl (gentle intuition guessing game)
   ===================================================================== */
// Build a pool of clear single-gender nouns from the existing vocabulary.
function genderPool(){
  const pool=[]; const seen=new Set();
  for(const d of VOCAB) for(const c of d.cards){
    if(/\(Pl\.\)/.test(c.de)) continue;                 // skip plural-only
    const m = c.de.match(/^(der|die|das)\s+([^,()]+)/);  // article + noun segment
    if(!m) continue;
    const noun = m[2].trim();
    if(noun.includes(' ') || noun.length<2) continue;    // single-word nouns only
    if(seen.has(noun)) continue; seen.add(noun);
    pool.push({ art:m[1], noun, en:c.en });
  }
  return pool;
}
// Gentle "rule of thumb" so the feeling has something to grab onto (tendencies, not laws).
function genderHint(noun){
  const n = noun.toLowerCase();
  if(/(ung|heit|keit|schaft|ion|tät|enz|anz)$/.test(n)) return 'Endungen wie -ung, -heit, -keit, -schaft, -ion, -tät sind fast immer die.';
  if(/(ei|ie|ur|ik|age)$/.test(n)) return 'Endungen wie -ei, -ie, -ur, -ik sind meistens die.';
  if(/(chen|lein)$/.test(n)) return 'Verkleinerungen auf -chen und -lein sind immer das.';
  if(/(ment|um|tum|ma)$/.test(n)) return 'Endungen wie -ment, -um, -tum sind oft das.';
  if(/(ling|ismus|ant|ent|ist|eur|or)$/.test(n)) return 'Endungen wie -ling, -ismus, -ant, -ist, -or sind meistens der.';
  if(/e$/.test(n)) return 'Viele Nomen auf -e sind die (aber nicht alle, z. B. der Name).';
  if(/(er|el|en)$/.test(n)) return 'Viele Nomen auf -er, -el, -en sind der (aber nicht immer).';
  return null;
}
function viewFeel(){
  Store.touchStreak();
  const pool = genderPool();
  let recent = [];   // last 12 gut-feelings (soft radar, not a score)
  let round = null, answered = false;

  function distractors(item, n){
    const out=[], used=new Set([item.en]); let g=0;
    while(out.length<n && g++<200){ const x=pool[Math.floor(Math.random()*pool.length)]; if(!used.has(x.en)){ used.add(x.en); out.push(x.en); } }
    return out;
  }
  function nextRound(){
    answered=false;
    const item = pool[Math.floor(Math.random()*pool.length)];
    if(Math.random()<0.28 && pool.length>=6){
      const opts = shuffle([item.en, ...distractors(item,2)]);
      round = { mode:'meaning', item, opts, answer:opts.indexOf(item.en), chosen:-1 };
    } else {
      round = { mode:'gender', item, chosen:'' };
    }
    paint();
  }
  function radar(){
    let dots='';
    for(let k=0;k<12;k++){ const v=recent[recent.length-12+k]; dots+=`<span class="feel__dot ${v===true?'on':v===false?'off':''}"></span>`; }
    return `<div class="feel__radar" title="Your recent gut feeling">${dots}</div>`;
  }
  function paint(){
    const it=round.item; let body='';
    if(round.mode==='gender'){
      const btn=(g)=>{ let cls='feelbtn '+g; if(answered){ if(g===it.art) cls+=' correct'; else if(g===round.chosen) cls+=' wrong'; } return `<button class="${cls}" data-g="${g}" ${answered?'disabled':''}>${g}</button>`; };
      body=`<div class="feel__q">der, die oder das?</div>
        <div class="feel__word">${esc(it.noun)} <button class="fcard__say" data-say="${esc(it.art+' '+it.noun)}" title="Listen">🔊</button></div>
        <div class="feel__opts">${btn('der')}${btn('die')}${btn('das')}</div>`;
    } else {
      const btns=round.opts.map((o,idx)=>{ let cls='feelopt'; if(answered){ if(idx===round.answer) cls+=' correct'; else if(idx===round.chosen) cls+=' wrong'; } return `<button class="${cls}" data-o="${idx}" ${answered?'disabled':''}>${esc(o)}</button>`; }).join('');
      body=`<div class="feel__q">Was bedeutet das?</div>
        <div class="feel__word"><span class="art ${it.art}">${it.art}</span> ${esc(it.noun)} <button class="fcard__say" data-say="${esc(it.art+' '+it.noun)}" title="Listen">🔊</button></div>
        <div class="feel__opts col">${btns}</div>`;
    }
    let reveal='';
    if(answered){
      const ok = round.mode==='gender' ? round.chosen===it.art : round.chosen===round.answer;
      const hint = round.mode==='gender' ? genderHint(it.noun) : null;
      reveal=`<div class="feel__reveal">
        <div class="feel__msg ${ok?'good':''}">${ok?'Genau! 🎉':'Kein Problem 💛'}</div>
        <div class="feel__ans"><span class="art ${it.art}">${it.art}</span> ${esc(it.noun)} <span class="feel__en">= ${esc(it.en)}</span></div>
        ${hint?`<div class="feel__hint">💡 ${esc(hint)}</div>`:''}
      </div>`;
    }
    const inner=`
    <div class="wrap feel">
      <div class="quiz__top">
        <button class="btn btn--ghost btn--sm" data-nav="#/">← Home</button>
        <span class="chip chip--wash">Sprachgefühl</span>
      </div>
      <p class="feel__tag">Kein Punktestand, keine Uhr. Tipp einfach dein Bauchgefühl an. „Falsch“ raten lässt das Gefühl erst wachsen. 🌱<br><span class="feel__tag-en">No score, no timer. Just tap your gut feeling. Guessing wrong is exactly how the feeling grows.</span></p>
      ${radar()}
      <div class="feelcard">${body}${reveal}</div>
      <div class="feel__foot">${answered?`<button class="btn btn--accent" data-next>Weiter →</button>`:`<span class="feel__hintsm">Trust your first thought.</span>`}</div>
    </div>`;
    render(inner,'feel');
    $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
    $$('[data-say]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); Speech.speak(b.dataset.say, Store.get().settings.ttsRate); });
    if(!answered){
      if(round.mode==='gender') $$('.feelbtn').forEach(b=>b.onclick=()=>answer('g', b.dataset.g));
      else $$('.feelopt').forEach(b=>b.onclick=()=>answer('m', +b.dataset.o));
    } else { const nx=$('[data-next]'); if(nx) nx.onclick=nextRound; }
  }
  function answer(kind, val){
    if(answered) return; answered=true;
    let ok;
    if(kind==='g'){ round.chosen=val; ok = val===round.item.art; }
    else { round.chosen=val; ok = val===round.answer; }
    recent.push(ok); if(recent.length>12) recent.shift();
    const prev=Store.levelInfo().idx; Store.addXP(ok?3:2);
    paint();
    gameCheck(prev);
  }
  if(pool.length<3){ render(`<div class="wrap"><div class="card pad" style="margin-top:40px;text-align:center"><h2>Sprachgefühl</h2><p>Add some vocabulary first, then come back to play.</p></div></div>`,'feel'); $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav)); return; }
  nextRound();
}

/* =====================================================================
   VIEW: Aussprache-Training (pronunciation: hear, record, compare, AI check)
   ===================================================================== */
function viewPronounce(){
  Store.touchStreak();
  const rate = Store.get().settings.ttsRate;
  let si=0, wi=0, rec=null, myUrl=null;

  function resetRec(){ if(rec){ try{ rec.stop(); }catch(_){} rec=null; } if(myUrl){ URL.revokeObjectURL(myUrl); myUrl=null; } }
  function showCheck(transcript, word, status){
    const norm=s=>String(s).toLowerCase().replace(/[.,!?;:„“"'`-]/g,'').replace(/\s+/g,' ').trim();
    const stripArt=w=>w.replace(/^(der|die|das)\s+/i,'');
    const target=norm(stripArt(word)), heard=norm(transcript);
    const ok = target && heard && (heard.includes(target) || target.includes(heard));
    const line = ok
      ? `<span class="pron__ok">✅ Clear! I heard: „${esc(transcript)}“</span>`
      : `<span class="pron__soft">💛 I heard: „${esc(transcript||'…')}“. No stress, say it again and lean into the ${esc(SOUNDS[si].label)} sound.</span>`;
    const c=status.querySelector('.pron__check'); if(c) c.outerHTML=line; else status.innerHTML+='<br>'+line;
  }
  function paint(){
    const s=SOUNDS[si]; if(wi>=s.words.length) wi=0;
    const word=s.words[wi]; const canRec=Speech.recorderSupported();
    const inner=`
    <div class="wrap lesson">
      <div class="lesson__hero" style="background:linear-gradient(135deg,#8B5CF6,#8B5CF6cc)">
        <div class="kicker">Aussprache-Training</div>
        <h1>🗣️ Pronunciation</h1>
        <p class="lead">Hear it, say it, record yourself, then compare. ${Lumikuttan.aiEnabled()?'A gentle AI check tells you what it heard.':''} No score, no pressure.</p>
      </div>
      <div class="soundchips">${SOUNDS.map((g,idx)=>`<button class="soundchip ${idx===si?'active':''}" data-si="${idx}">${esc(g.label)}</button>`).join('')}</div>
      <div class="card pad">
        <div class="tipbox"><div class="ic">💡</div><div><div class="h">${esc(s.label)}</div>${esc(s.tip_en)}<br><span style="color:var(--ink-faint)">${esc(s.tip_de)}</span></div></div>
        <div class="pron__word">${esc(word)}</div>
        <div class="pron__actions">
          <button class="btn btn--ghost" data-hear>▶︎ Hear</button>
          ${canRec?`<button class="mic pron__mic" data-mic title="Record">🎙️</button>
          <button class="btn btn--ghost" data-mine disabled>▶︎ You</button>
          <button class="btn btn--ghost" data-compare disabled>▶︎ Compare</button>`:''}
        </div>
        ${canRec?'':'<div class="pron__status">Recording is not available in this browser, but you can still tap ▶︎ Hear and repeat aloud. (Chrome or Safari support recording.)</div>'}
        <div class="pron__status" id="pstatus"></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
        <button class="btn btn--ghost btn--sm" data-prev ${wi<=0?'disabled':''}>← previous</button>
        <span class="chip chip--wash">${wi+1} / ${s.words.length}</span>
        <button class="btn btn--accent btn--sm" data-next>${wi+1<s.words.length?'next word →':'next sound →'}</button>
      </div>
    </div>`;
    render(inner);
    $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
    $$('.soundchip').forEach(b=>b.onclick=()=>{ resetRec(); si=+b.dataset.si; wi=0; paint(); });
    $('[data-hear]').onclick=()=>Speech.speak(word, rate);
    const prev=$('[data-prev]'); if(prev) prev.onclick=()=>{ if(wi>0){ resetRec(); wi--; paint(); } };
    const next=$('[data-next]'); if(next) next.onclick=()=>{ resetRec(); if(wi+1<s.words.length) wi++; else { si=(si+1)%SOUNDS.length; wi=0; } paint(); };
    const status=$('#pstatus'), mine=$('[data-mine]'), compare=$('[data-compare]'), micBtn=$('[data-mic]');
    if(mine) mine.onclick=()=>{ if(myUrl) new Audio(myUrl).play(); };
    if(compare) compare.onclick=()=>{ if(!myUrl) return; Speech.speak(word, rate, ()=>setTimeout(()=>{ if(myUrl) new Audio(myUrl).play(); }, 250)); };
    if(micBtn) micBtn.onclick=async()=>{
      if(rec){
        micBtn.classList.remove('rec');
        let blob; try{ blob=await rec.stop(); }catch(_){}
        rec=null;
        if(!blob){ status.textContent='Hmm, that recording did not work. Please try again.'; return; }
        if(myUrl) URL.revokeObjectURL(myUrl);
        myUrl=URL.createObjectURL(blob);
        if(mine) mine.disabled=false; if(compare) compare.disabled=false;
        status.innerHTML='Recorded ✓ Tap <b>▶︎ Compare</b> to hear the model, then you.';
        if(Lumikuttan.aiEnabled()){
          status.innerHTML+='<br><span class="pron__check">✨ Checking…</span>';
          try{ const t=await Lumikuttan.transcribe(blob); showCheck(t, word, status); }
          catch(e){ const c=status.querySelector('.pron__check'); if(c) c.textContent='(The AI check is unavailable right now, compare by ear.)'; }
        }
        return;
      }
      try{ rec=await Speech.startRecording(); micBtn.classList.add('rec'); status.textContent='🔴 Recording… press 🎙️ again to stop.'; }
      catch(e){ status.innerHTML='⚠️ The microphone needs permission. Allow it (mic icon in the address bar), then try again.'; }
    };
  }
  paint();
}

/* =====================================================================
   Router
   ===================================================================== */
function route(){
  if(!Store.hasOnboarded()){ onboard(); return; }
  const h=location.hash||'#/';
  const mLesson=h.match(/^#\/lesson\/(.+)$/);
  const mQuiz=h.match(/^#\/quiz\/(.+)$/);
  const mSkill=h.match(/^#\/skill\/(.+)$/);
  const mFlash=h.match(/^#\/flash\/(.+)$/);
  if(mLesson) return viewLesson(mLesson[1]);
  if(mQuiz) return viewQuiz(mQuiz[1]);
  if(mSkill) return viewSkill(decodeURIComponent(mSkill[1]));
  if(mFlash) return viewFlash(mFlash[1]);
  if(h.startsWith('#/vokabeln')) return viewVokabeln();
  if(h.startsWith('#/feel')) return viewFeel();
  if(h.startsWith('#/aussprache')) return viewPronounce();
  if(h.startsWith('#/phrases')) return viewIdioms();
  if(h.startsWith('#/belohnungen')) return viewBelohnungen();
  if(h.startsWith('#/roadmap')) return viewRoadmap();
  if(h.startsWith('#/pruefung')) return viewPruefung();
  return viewHome();
}

let booted=false;
function boot(){ if(booted) return; booted=true; mountMascotFab(); route(); }
window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', boot);
// The module is deferred and may run after DOMContentLoaded already fired:
if(document.readyState!=='loading') boot();
