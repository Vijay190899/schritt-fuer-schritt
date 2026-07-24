/* =========================================================================
   Ambient flowing-aurora background.
   Primary: a vanilla WebGL fragment shader, domain-warped fbm noise mapped
   onto a theme palette, slowly flowing, softly cursor-reactive. This is the
   "21st.dev / shader" look: a living liquid gradient, not flat blobs.
   Fallback: an animated radial-gradient mesh on 2D canvas (older browsers).
   Both are theme-aware and honour prefers-reduced-motion.
   ========================================================================= */
(function () {
  const canvas = document.getElementById('dynamic-bg');
  if (!canvas) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

  // Palettes as linear RGB (0..1): base, then three aurora tints, + intensity.
  function palette(dark) {
    return dark
      ? { c0: [0.066, 0.066, 0.094], c1: [0.24, 0.33, 0.72], c2: [0.44, 0.25, 0.72], c3: [0.07, 0.45, 0.34], i: 0.95 }
      : { c0: [0.969, 0.953, 0.925], c1: [0.66, 0.75, 1.00], c2: [1.00, 0.80, 0.71], c3: [0.75, 0.94, 0.85], i: 0.85 };
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

  if (!initWebGL()) init2D();

  /* ----------------------------- WebGL path ----------------------------- */
  function initWebGL() {
    let gl;
    try {
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' })
        || canvas.getContext('experimental-webgl');
    } catch (e) { return false; }
    if (!gl) return false;

    const VS = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';
    const FS = [
      'precision highp float;',
      'uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;',
      'uniform vec3 u_c0,u_c1,u_c2,u_c3; uniform float u_i;',
      'float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }',
      'float noise(vec2 p){ vec2 i=floor(p),f=fract(p); float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));',
      '  vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }',
      'float fbm(vec2 p){ float v=0.,a=.5; for(int k=0;k<5;k++){ v+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }',
      'void main(){',
      '  vec2 uv = gl_FragCoord.xy/u_res; float asp=u_res.x/u_res.y;',
      '  vec2 p = vec2(uv.x*asp, uv.y)*2.2; float t=u_time*0.06;',
      '  vec2 q = vec2(fbm(p+vec2(0.0,t)), fbm(p+vec2(5.2,-t)));',
      '  vec2 r = vec2(fbm(p+3.5*q+vec2(1.7,9.2)+0.15*t), fbm(p+3.5*q+vec2(8.3,2.8)-0.12*t));',
      '  float f = fbm(p+3.0*r);',
      '  vec2 m = vec2(u_mouse.x*asp, u_mouse.y);',
      '  float glow = smoothstep(1.1, 0.0, distance(vec2(uv.x*asp,uv.y), m))*0.22;',
      '  vec3 col = u_c0;',
      '  col = mix(col, u_c1, clamp((f*f)*1.8 + q.x*0.4, 0.0,1.0)*u_i);',
      '  col = mix(col, u_c2, clamp(length(q)*0.75, 0.0,1.0)*u_i);',
      '  col = mix(col, u_c3, clamp(r.y*0.7, 0.0,1.0)*u_i*0.9);',
      '  col += u_c1*glow;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    const prog = makeProgram(gl, VS, FS);
    if (!prog) return false;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // full-screen triangle
    const aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    const U = n => gl.getUniformLocation(prog, n);
    const uRes = U('u_res'), uTime = U('u_time'), uMouse = U('u_mouse'), uI = U('u_i');
    const uC = [U('u_c0'), U('u_c1'), U('u_c2'), U('u_c3')];

    canvas.style.filter = 'saturate(1.06)';   // shader is already smooth, no heavy blur

    function resize() {
      const s = 0.6;
      canvas.width = Math.max(2, Math.round(window.innerWidth * s));
      canvas.height = Math.max(2, Math.round(window.innerHeight * s));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    const mouse = [0.5, 0.5], target = [0.5, 0.5];
    window.addEventListener('pointermove', e => {
      target[0] = e.clientX / window.innerWidth;
      target[1] = 1 - e.clientY / window.innerHeight;
    }, { passive: true });

    let cur = palette(isDark());
    const start = performance.now();

    function render(now) {
      const tp = palette(isDark());
      const k = reduce ? 1 : 0.045;
      cur.c0 = lerp3(cur.c0, tp.c0, k); cur.c1 = lerp3(cur.c1, tp.c1, k);
      cur.c2 = lerp3(cur.c2, tp.c2, k); cur.c3 = lerp3(cur.c3, tp.c3, k);
      cur.i = lerp(cur.i, tp.i, k);
      mouse[0] = lerp(mouse[0], target[0], 0.05);
      mouse[1] = lerp(mouse[1], target[1], 0.05);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduce ? 8.0 : (now - start) / 1000);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.uniform1f(uI, cur.i);
      const cs = [cur.c0, cur.c1, cur.c2, cur.c3];
      for (let j = 0; j < 4; j++) gl.uniform3f(uC[j], cs[j][0], cs[j][1], cs[j][2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    // reduced-motion: still repaint once when the theme flips
    if (reduce) new MutationObserver(() => requestAnimationFrame(render))
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return true;
  }

  function makeProgram(gl, vsSrc, fsSrc) {
    function sh(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    }
    const vs = sh(gl.VERTEX_SHADER, vsSrc), fs = sh(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    return p;
  }

  /* --------------------------- 2D fallback ------------------------------ */
  function init2D() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.style.filter = 'blur(72px) saturate(1.15)';
    const HEX = {
      light: ['#7FA0FF', '#FFB49A', '#9FE7C8', '#C9B8FF', '#FFD98A'],
      dark:  ['#5B7FFF', '#3E5BD9', '#7949E8', '#1FB47F', '#E8573E'],
    };
    const N = 5; let W = 0, H = 0, blobs = [];
    const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
    function build() {
      W = canvas.width = Math.max(2, Math.round(window.innerWidth * 0.5));
      H = canvas.height = Math.max(2, Math.round(window.innerHeight * 0.5));
      blobs = [];
      for (let i = 0; i < N; i++) blobs.push({
        i, r: (Math.random() * 0.35 + 0.38) * Math.max(W, H),
        x: Math.random() * W, y: Math.random() * H,
        ax: Math.random() * 0.16 + 0.06, ay: Math.random() * 0.16 + 0.06,
        sx: (Math.random() * 0.6 + 0.3) * (Math.random() < 0.5 ? 1 : -1),
        sy: (Math.random() * 0.6 + 0.3) * (Math.random() < 0.5 ? 1 : -1),
        px: Math.random() * 6.28, py: Math.random() * 6.28,
      });
    }
    function draw(t) {
      const dark = isDark(), pal = dark ? HEX.dark : HEX.light, alpha = dark ? 0.55 : 0.72;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      for (const b of blobs) {
        const cx = b.x + Math.sin(t * 0.00008 * b.sx + b.px) * b.ax * W;
        const cy = b.y + Math.cos(t * 0.00008 * b.sy + b.py) * b.ay * H;
        const col = pal[b.i % pal.length];
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
        g.addColorStop(0, rgba(col, alpha)); g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, b.r, 0, 6.2832); ctx.fill();
      }
    }
    build(); window.addEventListener('resize', build);
    if (reduce) draw(0); else (function loop(t) { draw(t); requestAnimationFrame(loop); })(0);
  }
})();
