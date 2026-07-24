/* 
  Ambient Mesh Gradient Background
  Ultra-smooth fluid blobs that are heavily blurred via CSS.
*/
class DynamicBackground {
  constructor() {
    this.canvas = document.getElementById('dynamic-bg');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Low resolution is fine, it will be heavily blurred by CSS!
    const scale = 0.5;
    this.width = window.innerWidth * scale;
    this.height = window.innerHeight * scale;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.time = 0;
    this.blobs = [];
    
    this.init();
    
    window.addEventListener('resize', () => {
      this.width = window.innerWidth * scale;
      this.height = window.innerHeight * scale;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.init();
    });
    
    this.loop();
  }
  
  getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      return [
        { r: 91, g: 127, b: 255 },  // soft blue
        { r: 62, g: 91, b: 217 },   // deep primary
        { r: 121, g: 73, b: 232 },  // purple/indigo
        { r: 217, g: 87, b: 62 }    // muted accent coral
      ];
    }
    return [
      { r: 180, g: 200, b: 255 },
      { r: 255, g: 216, b: 206 },
      { r: 195, g: 242, b: 224 },
      { r: 233, g: 226, b: 255 }
    ];
  }

  init() {
    this.blobs = [];
    const colors = this.getColors();
    const count = 4;
    for (let i = 0; i < count; i++) {
        // Massive, screen-filling radii
        const radius = Math.random() * (this.width * 0.4) + this.width * 0.3;
        this.blobs.push({
            color: colors[i % colors.length],
            xBase: Math.random() * this.width,
            yBase: Math.random() * this.height,
            xAmp: Math.random() * 200 + 100,
            yAmp: Math.random() * 200 + 100,
            xSpeed: Math.random() * 0.003 + 0.001,
            ySpeed: Math.random() * 0.003 + 0.001,
            xPhase: Math.random() * Math.PI * 2,
            yPhase: Math.random() * Math.PI * 2,
            radius: radius
        });
    }
  }

  loop() {
    this.time += 1;

    // Check theme for dynamic opacity
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgOpacity = isDark ? 0.35 : 0.6; // High opacity so the blur catches it well

    this.ctx.clearRect(0, 0, this.width, this.height);
    // Smooth composite blending
    this.ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply';

    const colors = this.getColors();

    this.blobs.forEach((blob, i) => {
        // Live update colors if theme shifts
        blob.color = colors[i % colors.length];
        
        // Very slow drifting math
        const x = blob.xBase + Math.sin(this.time * blob.xSpeed + blob.xPhase) * blob.xAmp;
        const y = blob.yBase + Math.cos(this.time * blob.ySpeed + blob.yPhase) * blob.yAmp;

        this.ctx.beginPath();
        this.ctx.arc(x, y, blob.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${bgOpacity})`;
        this.ctx.fill();
    });

    requestAnimationFrame(() => this.loop());
  }
}

// Initialise reliably
(function startBg() {
  const canvas = document.getElementById('dynamic-bg');
  if (canvas) {
    new DynamicBackground();
  } else if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => new DynamicBackground());
  } else {
    window.addEventListener('load', () => new DynamicBackground());
  }
})();
