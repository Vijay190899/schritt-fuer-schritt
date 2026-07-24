/* 
  Dynamic Flowing Vector Background 
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
    
    this.time = 0;
    this.lines = [];
    
    // Track mouse slowly over time
    this.mouse = { x: this.width/2, y: this.height/2, tx: this.width/2, ty: this.height/2 };

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
        { r: 134, g: 160, b: 255 }, 
        { r: 255, g: 148, b: 112 }
      ];
    }
    return [
      { r: 91, g: 127, b: 255 },
      { r: 255, g: 122, b: 89 },
      { r: 34, g: 185, b: 129 },
      { r: 245, g: 196, b: 81 },
      { r: 177, g: 161, b: 255 }
    ];
  }

  init() {
    this.lines = [];
    const colors = this.getColors();
    const count = 10;
    for (let i = 0; i < count; i++) {
        this.lines.push({
            color: colors[i % colors.length],
            yBase: this.height * (0.1 + 0.8 * (i / count)), // Spread vertically
            amplitude: Math.random() * 100 + 40,
            frequency: Math.random() * 0.0015 + 0.0005, // Wider waves
            speed: Math.random() * 0.0015 + 0.0005,
            phaseParams: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
            thickness: Math.random() * 5 + 3
        });
    }
  }

  loop() {
    this.time += 1;
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.02;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.02;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    // Higher contrast for vectors
    const bgOpacity = isDark ? 0.35 : 0.6; 

    // Smooth trail effect slightly fades the previous frames
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    const colors = this.getColors();

    this.lines.forEach((line, i) => {
        // Adjust colors in case theme toggles
        line.color = colors[i % colors.length];
        
        this.ctx.beginPath();
        
        // Draw the vector path horizontally across the screen
        const step = 40; 
        for (let x = -50; x <= this.width + 50; x += step) {
            
            // Generate fluid waveform
            const wave1 = Math.sin(x * line.frequency + this.time * line.speed + line.phaseParams[0]);
            const wave2 = Math.cos(x * line.frequency * 1.3 - this.time * line.speed * 0.8 + line.phaseParams[1]);
            const wave3 = Math.sin(x * line.frequency * 0.6 + this.time * line.speed * 1.1 + line.phaseParams[2]);
            
            // Gentle mouse sway effect
            const distX = x - this.mouse.x;
            const mouseEffect = Math.sin(distX * 0.002 - this.time * 0.02) * 50;
            const influence = Math.max(0, 1 - Math.abs(distX) / 1000);
            
            const totalWave = (wave1 + wave2 + wave3) / 3;
            const y = line.yBase + totalWave * line.amplitude + (mouseEffect * influence * 0.5);
            
            if (x === -50) {
                this.ctx.moveTo(x, y);
            } else {
                // Smooth bezier connects for vectors
                this.ctx.lineTo(x, y);
            }
        }
        
        // Linear gradient so lines fade on edges
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, `rgba(${line.color.r}, ${line.color.g}, ${line.color.b}, 0)`);
        gradient.addColorStop(0.15, `rgba(${line.color.r}, ${line.color.g}, ${line.color.b}, ${bgOpacity})`);
        gradient.addColorStop(0.85, `rgba(${line.color.r}, ${line.color.g}, ${line.color.b}, ${bgOpacity})`);
        gradient.addColorStop(1, `rgba(${line.color.r}, ${line.color.g}, ${line.color.b}, 0)`);
        
        this.ctx.lineWidth = line.thickness;
        this.ctx.strokeStyle = gradient;
        
        // Add subtle drop shadow
        this.ctx.shadowColor = `rgba(${line.color.r}, ${line.color.g}, ${line.color.b}, ${bgOpacity * 0.5})`;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.stroke();
        
        // Reset shadow for performance on non-shadowed operations if any
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
    });

    requestAnimationFrame(() => this.loop());
  }
}

// Initialise
window.addEventListener('DOMContentLoaded', () => {
  new DynamicBackground();
});
