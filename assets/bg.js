/* =========================================================================
   Animated park scene background.
   Light mode = sunny day: blue sky, sun, drifting SVG clouds, hills, swaying
   trees, grass, and SVG BUTTERFLIES with flapping wings.
   Dark mode = night: deep sky, moon, twinkling stars, drifting clouds, and
   glowing FIREFLIES.
   Static scenery + creatures are SVG for crisp visuals; the flight PATH of
   each creature runs on its wrapping DOM element, so motion is reliable in
   every browser. Day/night cross-fades with the theme.
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

  /* ---------- SVG creatures on DOM wrappers (path on wrapper = reliable) ---------- */
  const CLOUD = '<svg class="pcloud-b" viewBox="0 0 200 92"><path d="M44 82 Q14 82 14 58 Q14 37 37 37 Q41 15 67 17 Q85 8 97 27 Q109 16 125 25 Q135 10 153 19 Q177 27 171 49 Q191 51 191 67 Q191 82 163 82 Z"/></svg>';
  const BFLY = w =>
    `<svg class="bfly-w" viewBox="-24 -22 48 44" style="--wing:${w}"><g>` +
      '<ellipse class="w wa" cx="-11" cy="-8" rx="12" ry="9" transform="rotate(-18 -11 -8)"/>' +
      '<ellipse class="w wb" cx="-9" cy="9" rx="9" ry="7" transform="rotate(20 -9 9)"/>' +
      '<ellipse class="w wa" cx="11" cy="-8" rx="12" ry="9" transform="rotate(18 11 -8)"/>' +
      '<ellipse class="w wb" cx="9" cy="9" rx="9" ry="7" transform="rotate(-20 9 9)"/>' +
      '<ellipse class="body" cx="0" cy="0" rx="2" ry="11"/>' +
      '<path class="ant" d="M0 -10 C -2 -16 -5 -18 -7 -19"/><path class="ant" d="M0 -10 C 2 -16 5 -18 7 -19"/>' +
    '</g></svg>';

  let clouds = '';
  [ { top: 8,  w: 220, dur: 52, delay: 0,  o: .95 },
    { top: 16, w: 150, dur: 72, delay: 22, o: .85 },
    { top: 5,  w: 260, dur: 60, delay: 40, o: .90 },
    { top: 24, w: 130, dur: 82, delay: 12, o: .72 },
    { top: 13, w: 190, dur: 64, delay: 50, o: .88 } ].forEach(c => {
    clouds += `<div class="pcloud" style="top:${c.top}vh;animation-duration:${c.dur}s;animation-delay:-${c.delay}s;width:${c.w}px;opacity:${c.o}">${CLOUD}</div>`;
  });

  let bflies = '';
  [ { top: 22, size: 34, dur: 20, delay: 0,  w: '#f2a03d' },
    { top: 36, size: 26, dur: 27, delay: 8,  w: '#6aa6f0' },
    { top: 14, size: 40, dur: 23, delay: 15, w: '#ef7fae' },
    { top: 46, size: 24, dur: 30, delay: 4,  w: '#57c9a8' } ].forEach(b => {
    bflies += `<div class="bfly" style="top:${b.top}vh;font-size:${b.size}px;animation-duration:${b.dur}s;animation-delay:-${b.delay}s">${BFLY(b.w)}</div>`;
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
