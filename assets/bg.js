/* =========================================================================
   Animated park scene background.
   Light mode = sunny day: blue sky, sun, drifting clouds, hills, swaying
   trees, grass, and fluttering BUTTERFLIES.
   Dark mode = night: deep sky, moon, twinkling stars, drifting clouds, and
   glowing FIREFLIES.
   Static scenery is SVG; the moving creatures (clouds, butterflies, fireflies)
   are plain DOM elements so their CSS transform animations run reliably in
   every browser (including Safari). Day/night cross-fades with the theme.
   ========================================================================= */
(function () {
  const root = document.getElementById('dynamic-bg');
  if (!root) return;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------- static SVG scenery ---------- */
  let stars = '';
  for (let i = 0; i < 42; i++)
    stars += `<circle class="star" cx="${rnd(30, 1570) | 0}" cy="${rnd(24, 560) | 0}" r="${rnd(1, 2.6).toFixed(1)}" style="animation-delay:-${rnd(0, 3.5).toFixed(1)}s"/>`;

  const trees = [
    { x: 150, y: 812, s: 1.05, d: 0 }, { x: 430, y: 840, s: .78, d: 1.4 },
    { x: 760, y: 852, s: .68, d: 2.2 }, { x: 1010, y: 820, s: 1.16, d: .7 },
    { x: 1320, y: 846, s: .92, d: 1.9 }
  ].map(t =>
    `<g transform="translate(${t.x} ${t.y}) scale(${t.s})"><g class="sway" style="animation-delay:-${t.d}s">` +
      '<rect class="trunk" x="-9" y="-46" width="18" height="72" rx="7"/>' +
      '<circle class="foliage" cx="0" cy="-96" r="40"/>' +
      '<circle class="foliage" cx="-36" cy="-66" r="34"/>' +
      '<circle class="foliage" cx="36" cy="-66" r="34"/>' +
      '<circle class="foliage f2" cx="0" cy="-60" r="44"/>' +
    '</g></g>'
  ).join('');

  const svg =
    '<svg class="scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<radialGradient id="sunGlow"><stop offset="0%" stop-color="#fff3b0" stop-opacity=".9"/><stop offset="55%" stop-color="#ffd86b" stop-opacity=".35"/><stop offset="100%" stop-color="#ffd86b" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="moonGlow"><stop offset="0%" stop-color="#eef1ff" stop-opacity=".5"/><stop offset="60%" stop-color="#cfd6ff" stop-opacity=".14"/><stop offset="100%" stop-color="#cfd6ff" stop-opacity="0"/></radialGradient>' +
    '</defs>' +
    `<g class="stars night-only">${stars}</g>` +
    '<g class="sun-group day-only"><circle class="sun-glow" cx="1290" cy="215" r="190" fill="url(#sunGlow)"/><circle class="sun" cx="1290" cy="215" r="88"/></g>' +
    '<g class="moon-group night-only"><circle class="moon-glow" cx="1300" cy="205" r="170" fill="url(#moonGlow)"/><circle class="moon" cx="1300" cy="205" r="80"/>' +
      '<circle class="crater" cx="1278" cy="186" r="12"/><circle class="crater" cx="1322" cy="224" r="9"/><circle class="crater" cx="1306" cy="182" r="7"/></g>' +
    '<path class="hill hill-back" d="M0 700 C 260 636, 470 706, 720 662 C 970 618, 1220 706, 1600 648 L1600 1000 L0 1000 Z"/>' +
    '<path class="hill hill-front" d="M0 806 C 300 742, 610 812, 900 762 C 1190 712, 1420 806, 1600 772 L1600 1000 L0 1000 Z"/>' +
    trees +
    '<path class="grass" d="M0 872 C 360 826, 720 886, 1060 846 C 1360 810, 1500 872, 1600 852 L1600 1000 L0 1000 Z"/>' +
    '</svg>';

  /* ---------- DOM moving creatures (reliable everywhere) ---------- */
  let clouds = '';
  [ { top: 8, dur: 52, delay: 0,  sc: 1.10, o: .95 },
    { top: 16, dur: 72, delay: 22, sc: .80, o: .85 },
    { top: 5,  dur: 60, delay: 40, sc: 1.28, o: .90 },
    { top: 24, dur: 82, delay: 12, sc: .70, o: .72 },
    { top: 13, dur: 64, delay: 50, sc: 1.00, o: .88 } ].forEach(c => {
    clouds += `<div class="pcloud" style="top:${c.top}vh;animation-duration:${c.dur}s;animation-delay:-${c.delay}s">` +
              `<div class="pcloud-b" style="transform:scale(${c.sc});opacity:${c.o}"></div></div>`;
  });

  let bflies = '';
  [ { top: 20, size: 26, dur: 20, delay: 0 },
    { top: 34, size: 22, dur: 26, delay: 8 },
    { top: 12, size: 30, dur: 23, delay: 15 },
    { top: 44, size: 20, dur: 28, delay: 4 } ].forEach(b => {
    bflies += `<div class="bfly" style="top:${b.top}vh;font-size:${b.size}px;animation-duration:${b.dur}s;animation-delay:-${b.delay}s">` +
              '<span class="bfly-w">🦋</span></div>';
  });

  let ffs = '';
  for (let i = 0; i < 16; i++)
    ffs += `<div class="ff" style="top:${rnd(58, 90) | 0}vh;left:${rnd(4, 96) | 0}vw;animation-duration:${rnd(5, 9).toFixed(1)}s;animation-delay:-${rnd(0, 6).toFixed(1)}s"></div>`;

  root.innerHTML =
    '<div class="sky sky--day"></div><div class="sky sky--night"></div>' +
    svg +
    `<div class="clouds">${clouds}</div>` +
    `<div class="butterflies day-only">${bflies}</div>` +
    `<div class="fireflies night-only">${ffs}</div>`;
})();
