/* =========================================================================
   Ambient animated mesh-gradient background (vector-style, theme-aware).
   Draws slow-drifting soft radial-gradient blobs on a canvas. A light CSS
   blur fuses them into one flowing liquid gradient. Reacts to light/dark
   instantly and honours prefers-reduced-motion.
   ========================================================================= */
(function () {
  const canvas = document.getElementById('dynamic-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PALETTES = {
    light: ['#7FA0FF', '#FFB49A', '#9FE7C8', '#C9B8FF', '#FFD98A'],
    dark:  ['#5B7FFF', '#3E5BD9', '#7949E8', '#1FB47F', '#E8573E'],
  };
  const N = 5;
  let W = 0, H = 0, blobs = [];

  function size() {
    // low internal resolution is fine, it gets blurred anyway (keeps it light)
    W = canvas.width  = Math.max(2, Math.round(window.innerWidth  * 0.5));
    H = canvas.height = Math.max(2, Math.round(window.innerHeight * 0.5));
  }
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function build() {
    size();
    blobs = [];
    for (let i = 0; i < N; i++) {
      blobs.push({
        i,
        r:  (Math.random() * 0.35 + 0.38) * Math.max(W, H),
        x:  Math.random() * W,
        y:  Math.random() * H,
        ax: Math.random() * 0.16 + 0.06,   // drift amplitude (fraction of W/H)
        ay: Math.random() * 0.16 + 0.06,
        sx: (Math.random() * 0.6 + 0.3) * (Math.random() < 0.5 ? 1 : -1),
        sy: (Math.random() * 0.6 + 0.3) * (Math.random() < 0.5 ? 1 : -1),
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(t) {
    const dark = isDark();
    const pal = dark ? PALETTES.dark : PALETTES.light;
    const alpha = dark ? 0.55 : 0.72;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
    for (const b of blobs) {
      const cx = b.x + Math.sin(t * 0.00008 * b.sx + b.px) * b.ax * W;
      const cy = b.y + Math.cos(t * 0.00008 * b.sy + b.py) * b.ay * H;
      const col = pal[b.i % pal.length];
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
      g.addColorStop(0, hexA(col, alpha));
      g.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(t) { draw(t); requestAnimationFrame(loop); }

  build();
  window.addEventListener('resize', build);
  if (reduce) draw(0); else requestAnimationFrame(loop);
})();
