// Particle System with p5.js
// A creative coding project with interactive controls and dynamic visuals

let particles = [];
let noiseScale = 0.01;
let noiseSpeed = 0.001;
let particleSize = 3;
let particleCount = 200;
let colorMode = 'rainbow';
let time = 0;

class Particle {
  constructor() {
    this.reset();
    this.size = random(1, 3) * particleSize;
    this.lifespan = random(100, 200);
    this.maxLife = this.lifespan;
  }

  reset() {
    this.x = random(width);
    this.y = random(height);
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.angle = random(TWO_PI);
    this.speed = random(0.5, 2);
    this.lifespan = random(100, 200);
    this.maxLife = this.lifespan;
    this.hue = random(360);
  }

  update() {
    // Calculate noise-based movement
    let noiseX = noise(this.x * noiseScale, this.y * noiseScale, time * noiseSpeed);
    let noiseY = noise(this.x * noiseScale + 1000, this.y * noiseScale + 1000, time * noiseSpeed);
    
    this.angle = map(noiseX, 0, 1, 0, TWO_PI * 2);
    
    // Apply mouse influence
    let mouseInfluence = 0;
    if (mouseIsPressed) {
      let d = dist(this.x, this.y, mouseX, mouseY);
      if (d < 200) {
        mouseInfluence = map(d, 0, 200, 1, 0);
        let angle = atan2(this.y - mouseY, this.x - mouseX);
        this.vx += cos(angle) * mouseInfluence * 0.5;
        this.vy += sin(angle) * mouseInfluence * 0.5;
      }
    }
    
    // Apply velocity based on noise
    this.vx += cos(this.angle) * this.speed * (1 - mouseInfluence);
    this.vy += sin(this.angle) * this.speed * (1 - mouseInfluence);
    
    // Apply friction
    this.vx *= 0.95;
    this.vy *= 0.95;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Wrap around edges
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
    
    // Decrease lifespan
    this.lifespan--;
    if (this.lifespan <= 0) {
      this.reset();
    }
  }

  display() {
    let alpha = map(this.lifespan, 0, this.maxLife, 0, 255);
    let size = this.size * map(this.lifespan, 0, this.maxLife, 0.5, 1);
    
    // Different color modes
    switch (colorMode) {
      case 'rainbow':
        fill((this.hue + frameCount * 0.1) % 360, 80, 100, alpha);
        break;
      case 'monochrome':
        fill(220, 70, map(this.speed, 0.5, 2, 30, 100), alpha);
        break;
      case 'complementary':
        let baseHue = (frameCount * 0.1) % 360;
        let particleHue = (baseHue + map(noise(this.x * 0.01, this.y * 0.01), 0, 1, 0, 180)) % 360;
        fill(particleHue, 80, 100, alpha);
        break;
    }
    
    noStroke();
    ellipse(this.x, this.y, size, size);
    
    // Optional: Add a subtle glow effect
    if (size > 2) {
      fill(this.hue, 80, 100, alpha * 0.3);
      ellipse(this.x, this.y, size * 2, size * 2);
    }
  }
}

function setup() {
  // Create canvas that fills the container
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  
  // Use HSB color mode
  colorMode = HSB;
  
  // Create initial particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  // Set up UI controls
  setupControls();
}

function draw() {
  // Clear background with slight transparency for trail effect
  background(0, 0, 0, 10);
  
  // Update time for noise
  time += 1;
  
  // Update and display particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].display();
  }
}

function setupControls() {
  // Particle Count Slider
  select('#particleCount').input(function() {
    let newCount = parseInt(this.value());
    if (newCount > particles.length) {
      // Add more particles
      for (let i = particles.length; i < newCount; i++) {
        particles.push(new Particle());
      }
    } else {
      // Remove particles
      particles = particles.slice(0, newCount);
    }
    particleCount = newCount;
  });
  
  // Particle Size Slider
  select('#particleSize').input(function() {
    particleSize = parseInt(this.value());
  });
  
  // Noise Scale Slider
  select('#noiseScale').input(function() {
    noiseScale = parseFloat(this.value());
  });
  
  // Noise Speed Slider
  select('#noiseSpeed').input(function() {
    noiseSpeed = parseFloat(this.value());
  });
  
  // Color Mode Selector
  select('#colorMode').input(function() {
    colorMode = this.value();
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Add mouse interaction
function mouseMoved() {
  // Create a ripple effect when mouse moves
  for (let i = 0; i < 3; i++) {
    let p = new Particle();
    p.x = mouseX + random(-10, 10);
    p.y = mouseY + random(-10, 10);
    p.size = random(2, 5) * particleSize;
    p.lifespan = random(20, 50);
    p.maxLife = p.lifespan;
    particles.push(p);
    
    // Remove oldest particle to maintain count
    if (particles.length > particleCount + 20) {
      particles.shift();
    }
  }
}