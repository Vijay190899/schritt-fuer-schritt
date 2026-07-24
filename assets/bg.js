/* =========================================================================
   Animated park scene background.
   Light mode = sunny day (blue sky, sun, drifting clouds, hills, swaying
   trees, grass, gliding birds). Dark mode = the same park at night (deep
   sky, moon, twinkling stars, fireflies). Day/night cross-fade with the
   theme toggle. All vector SVG + CSS animation; honours reduced motion.
   ========================================================================= */
(function () {
  const root = document.getElementById('dynamic-bg');
  if (!root) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);

  const cloud = '<g class="cloud-shape">' +
    '<ellipse cx="42" cy="6" rx="44" ry="30"/>' +
    '<ellipse cx="96" cy="-14" rx="56" ry="42"/>' +
    '<ellipse cx="156" cy="4" rx="50" ry="35"/>' +
    '<ellipse cx="208" cy="12" rx="34" ry="24"/>' +
    '<rect x="20" y="12" width="200" height="30" rx="15"/></g>';

  // drifting clouds: {y, dur, delay, opacity}
  const clouds = [
    { y: 150, dur: 78, delay: 0,  o: .96 },
    { y: 240, dur: 104, delay: 34, o: .85 },
    { y: 110, dur: 120, delay: 66, o: .90 },
    { y: 320, dur: 92, delay: 18, o: .72 }
  ].map(c =>
    `<g transform="translate(0 ${c.y})"><g class="cloud-move" style="animation-duration:${c.dur}s;animation-delay:-${c.delay}s;opacity:${c.o}">${cloud}</g></g>`
  ).join('');

  // swaying trees on the hills: {x, y(base), scale, delay}
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

  // twinkling stars (night)
  let stars = '';
  for (let i = 0; i < 40; i++)
    stars += `<circle class="star" cx="${rnd(30, 1570) | 0}" cy="${rnd(24, 560) | 0}" r="${rnd(1, 2.6).toFixed(1)}" style="animation-delay:-${rnd(0, 3.5).toFixed(1)}s"/>`;

  // gliding birds (day)
  const birds = [
    { y: 180, dur: 27, delay: 0 }, { y: 250, dur: 34, delay: -13 }, { y: 140, dur: 30, delay: -22 }
  ].map(b =>
    `<g class="bird day-only" style="animation-duration:${b.dur}s;animation-delay:${b.delay}s"><g transform="translate(0 ${b.y})">` +
      '<path class="wing" d="M0 0 Q10 -9 20 0 Q30 -9 40 0"/></g></g>'
  ).join('');

  // fireflies (night)
  let flies = '';
  for (let i = 0; i < 14; i++)
    flies += `<circle class="firefly" cx="${rnd(70, 1530) | 0}" cy="${rnd(600, 900) | 0}" r="2.6" style="animation-duration:${rnd(5, 9).toFixed(1)}s;animation-delay:-${rnd(0, 6).toFixed(1)}s"/>`;

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
    clouds + birds +
    '<path class="hill hill-back" d="M0 700 C 260 636, 470 706, 720 662 C 970 618, 1220 706, 1600 648 L1600 1000 L0 1000 Z"/>' +
    '<path class="hill hill-front" d="M0 806 C 300 742, 610 812, 900 762 C 1190 712, 1420 806, 1600 772 L1600 1000 L0 1000 Z"/>' +
    trees +
    '<path class="grass" d="M0 872 C 360 826, 720 886, 1060 846 C 1360 810, 1500 872, 1600 852 L1600 1000 L0 1000 Z"/>' +
    `<g class="night-only">${flies}</g>` +
    '</svg>';

  root.innerHTML =
    '<div class="sky sky--day"></div><div class="sky sky--night"></div>' + svg;

  if (reduce) root.classList.add('no-motion');
})();
