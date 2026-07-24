/* 
  Dynamic Animated Background 
  Inspired by 21st.dev Premium Mesh Gradients
*/
class DynamicBackground {
  constructor() {
    this.canvas = document.getElementById('dynamic-bg');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Config
    this.orbs = [];
    this.numOrbs = 7;
    this.mouse = { x: this.width / 2, y: this.height / 2, tx: this.width / 2, ty: this.height / 2 };
    
    this.init();
    
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.init();
    });
    
    window.addEventListener('mousemove', (e) => {
      this.mouse.tx = e.clientX;
      this.mouse.ty = e.clientY;
    });
    
    this.loop();
  }
  
  getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      return [
        { r: 91, g: 127, b: 255 }, // primary
        { r: 255, g: 122, b: 89 }, // accent
        { r: 34, g: 185, b: 129 }, // success
        { r: 123, g: 149, b: 255 },
        { r: 232, g: 97, b: 61 },
        { r: 62, g: 91, b: 217 },
        { r: 245, g: 166, b: 35 } // warn
      ];
    }
    return [
      { r: 91, g: 127, b: 255 },
      { r: 255, g: 122, b: 89 },
      { r: 34, g: 185, b: 129 },
      { r: 245, g: 196, b: 81 },
      { r: 177, g: 161, b: 255 },
      { r: 255, g: 153, b: 204 },
      { r: 100, g: 180, b: 255 }
    ];
  }

  init() {
    this.orbs = [];
    const colors = this.getColors();
    for (let i = 0; i < this.numOrbs; i++) {
        // larger orbs for a seamless mesh feel
        const radius = Math.random() * (this.width * 0.4) + this.width * 0.4;
        this.orbs.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            radius: radius,
            color: colors[i % colors.length],
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.015 + 0.005
        });
    }
  }

  loop() {
    // Smoothen mouse
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.04;

    // Check theme for dynamic opacity
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgOpacity = isDark ? 0.08 : 0.14; 

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = 'lighter'; // or 'screen'

    const colors = this.getColors();

    this.orbs.forEach((orb, i) => {
        // Softly update color on theme switch without recreating orbs
        orb.color = colors[i % colors.length];
        
        orb.phase += orb.speed;
        
        // Gentle movement based on phase
        orb.x += Math.cos(orb.phase) * 1.2 + orb.vx;
        orb.y += Math.sin(orb.phase) * 1.2 + orb.vy;

        // Subtle mouse influence (attract or repel slightly)
        const dx = this.mouse.x - orb.x;
        const dy = this.mouse.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 900) {
            orb.x -= (dx * 0.007) * (1 - dist / 900);
            orb.y -= (dy * 0.007) * (1 - dist / 900);
        }

        // Bounds check (bounce off edges gently)
        if (orb.x < -orb.radius) orb.vx = Math.abs(orb.vx);
        if (orb.x > this.width + orb.radius) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.radius) orb.vy = Math.abs(orb.vy);
        if (orb.y > this.height + orb.radius) orb.vy = -Math.abs(orb.vy);

        // Draw orb with radial gradient
        const grad = this.ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${bgOpacity})`);
        grad.addColorStop(1, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, 0)`);
        
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        this.ctx.fill();
    });

    requestAnimationFrame(() => this.loop());
  }
}

// Initialise
window.addEventListener('DOMContentLoaded', () => {
  new DynamicBackground();
});
