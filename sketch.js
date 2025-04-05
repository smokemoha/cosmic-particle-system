// Particle System with p5.js

let particles = [];
// Array to store all particle objects, which will be updated and rendered in the animation

let noiseScale = 0.01;
// Scale factor for Perlin noise, controlling how "zoomed in" or "zoomed out" the noise pattern appears, affecting particle movement

let noiseSpeed = 0.001;
// Speed at which the noise evolves over time, influencing how dynamically the particles change direction

let particleSize = 3;
// Base size of each particle, which can be scaled randomly or adjusted via UI controls

let particleCount = 200;
// Initial number of particles in the system, adjustable by the user through the UI

let colorMode = 'rainbow';
// Current color mode for particles ('rainbow', 'monochrome', or 'complementary'), which determines how particles are colored

let time = 0;
// Global time variable used to animate noise-based movement, incremented each frame

class Particle {
  constructor() {
    this.reset();
    // Initialize particle by calling reset() to set initial position and properties

    this.size = random(1, 3) * particleSize;
    // Random size for each particle, scaled by the global particleSize for consistency

    this.lifespan = random(100, 200);
    // Random lifespan for each particle, determining how long it exists before resetting

    this.maxLife = this.lifespan;
    // Store the initial lifespan to use for fade-out effects and size scaling
  }

  reset() {
    this.x = random(width);
    // Random x-position within the canvas width for initial placement

    this.y = random(height);
    // Random y-position within the canvas height for initial placement

    this.vx = 0;
    this.vy = 0;
    // Initial velocity components (x and y) set to zero, to be updated by noise and forces

    this.ax = 0;
    this.ay = 0;
    // Initial acceleration components (x and y), currently unused but reserved for future expansion

    this.angle = random(TWO_PI);
    // Random initial direction angle (in radians) for movement, ranging from 0 to 2*PI

    this.speed = random(0.5, 2);
    // Random speed for each particle, affecting how fast it moves based on its angle

    this.lifespan = random(100, 200);
    // Reset lifespan to a new random value when the particle is regenerated

    this.maxLife = this.lifespan;
    // Update maxLife to match the new lifespan for consistent fade effects

    this.hue = random(360);
    // Random hue value (0-360) for HSB color mode, used in color calculations
  }

  update() {
    // Calculate noise-based movement
    let noiseX = noise(this.x * noiseScale, this.y * noiseScale, time * noiseSpeed);
    // Get noise value for x-direction using particle position and global time, scaled by noiseScale

    let noiseY = noise(this.x * noiseScale + 1000, this.y * noiseScale + 1000, time * noiseSpeed);
    // Get noise value for y-direction, offset by 1000 to ensure different noise patterns

    this.angle = map(noiseX, 0, 1, 0, TWO_PI * 2);
    // Map the noise value to a new angle (0 to 4*PI) for smoother rotation

    // Apply mouse influence
    let mouseInfluence = 0;
    // Initialize mouse influence factor, which will modify particle behavior when mouse is pressed

    if (mouseIsPressed) {
      let d = dist(this.x, this.y, mouseX, mouseY);
      // Calculate distance between particle and mouse position for interaction

      if (d < 200) {
        mouseInfluence = map(d, 0, 200, 1, 0);
        // If particle is within 200 pixels of mouse, map distance to influence (1 at mouse, 0 at 200px)

        let angle = atan2(this.y - mouseY, this.x - mouseX);
        // Calculate angle from particle to mouse for directional force

        this.vx += cos(angle) * mouseInfluence * 0.5;
        this.vy += sin(angle) * mouseInfluence * 0.5;
        // Apply force towards/away from mouse, scaled by influence and a factor of 0.5
      }
    }

    // Apply velocity based on noise
    this.vx += cos(this.angle) * this.speed * (1 - mouseInfluence);
    this.vy += sin(this.angle) * this.speed * (1 - mouseInfluence);
    // Update velocity based on current angle and speed, reduced if mouse is influencing

    // Apply friction
    this.vx *= 0.95;
    this.vy *= 0.95;
    // Slow down particles over time to simulate friction, preventing infinite acceleration

    // Update position
    this.x += this.vx;
    this.y += this.vy;
    // Move particle based on its current velocity

    // Wrap around edges
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
    // Keep particles within canvas by wrapping them around to the opposite side if they exit

    // Decrease lifespan
    this.lifespan--;
    // Reduce lifespan each frame, simulating particle decay

    if (this.lifespan <= 0) {
      this.reset();
      // If lifespan reaches zero, reset the particle to a new random state
    }
  }

  display() {
    let alpha = map(this.lifespan, 0, this.maxLife, 0, 255);
    // Map lifespan to alpha transparency (0-255) for fade-out effect as particle nears end of life

    let size = this.size * map(this.lifespan, 0, this.maxLife, 0.5, 1);
    // Scale particle size based on remaining lifespan, making it shrink as it fades

    // Different color modes
    switch (colorMode) {
      case 'rainbow':
        fill((this.hue + frameCount * 0.1) % 360, 80, 100, alpha);
        // Rainbow mode: Cycle hue over time (frameCount) with saturation and brightness, apply alpha
        break;
      case 'monochrome':
        fill(220, 70, map(this.speed, 0.5, 2, 30, 100), alpha);
        // Monochrome mode: Fixed hue (220), low saturation, brightness based on speed, with alpha
        break;
      case 'complementary':
        let baseHue = (frameCount * 0.1) % 360;
        let particleHue = (baseHue + map(noise(this.x * 0.01, this.y * 0.01), 0, 1, 0, 180)) % 360;
        fill(particleHue, 80, 100, alpha);
        // Complementary mode: Base hue shifts over time, offset by noise for variation, with fixed saturation/brightness and alpha
        break;
    }

    noStroke();
    // Disable stroke (outline) for clean particle rendering

    ellipse(this.x, this.y, size, size);
    // Draw particle as a circle at its position with current size

    // Optional: Add a subtle glow effect
    if (size > 2) {
      fill(this.hue, 80, 100, alpha * 0.3);
      // If particle is large enough, add a glow effect with reduced opacity (30% of alpha)

      ellipse(this.x, this.y, size * 2, size * 2);
      // Draw larger, semi-transparent circle around particle for glow
    }
  }
}

function setup() {
  // Create canvas that fills the container
  let canvas = createCanvas(windowWidth, windowHeight);
  // Set up a full-window canvas using p5.js, sized to match the browser window

  canvas.parent('canvas-container');
  // Attach the canvas to the HTML element with ID 'canvas-container' for DOM integration

  colorMode(HSB);
  // Switch to HSB color mode for more intuitive color manipulation (Hue, Saturation, Brightness)

  // Create initial particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
    // Initialize the specified number of particles and add them to the array
  }

  // Set up UI controls
  setupControls();
  // Call function to bind UI elements (sliders, dropdown) to update global variables
}

function draw() {
  // Clear background with slight transparency for trail effect
  background(0, 0, 0, 10);
  // Draw semi-transparent black background (HSB) to create particle trails

  // Update time for noise
  time += 1;
  // Increment time to animate noise-based movement

  // Update and display particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    // Update each particle's position, velocity, and other properties

    particles[i].display();
    // Render each particle on the canvas with its current state
  }
}

function setupControls() {
  // Particle Count Slider
  select('#particleCount').input(function() {
    let newCount = parseInt(this.value());
    // Get new particle count from slider value and convert to integer

    if (newCount > particles.length) {
      // Add more particles
      for (let i = particles.length; i < newCount; i++) {
        particles.push(new Particle());
        // Create and add new particles until reaching the desired count
      }
    } else {
      // Remove particles
      particles = particles.slice(0, newCount);
      // Trim the array to reduce the number of particles
    }
    particleCount = newCount;
    // Update global particleCount to reflect the new value
  });

  // Particle Size Slider
  select('#particleSize').input(function() {
    particleSize = parseInt(this.value());
    // Update global particleSize when slider changes, affecting all existing particles
  });

  // Noise Scale Slider
  select('#noiseScale').input(function() {
    noiseScale = parseFloat(this.value());
    // Update global noiseScale for smoother or more chaotic particle movement
  });

  // Noise Speed Slider
  select('#noiseSpeed').input(function() {
    noiseSpeed = parseFloat(this.value());
    // Adjust how fast the noise pattern changes over time
  });

  // Color Mode Selector
  select('#colorMode').input(function() {
    colorMode = this.value();
    // Update global colorMode based on user selection from dropdown
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Resize the canvas if the window size changes, maintaining full-screen coverage
}

function mouseMoved() {
  // Create a ripple effect when mouse moves
  for (let i = 0; i < 3; i++) {
    let p = new Particle();
    // Create a new particle instance

    p.x = mouseX + random(-10, 10);
    p.y = mouseY + random(-10, 10);
    // Position new particle near mouse with slight random offset

    p.size = random(2, 5) * particleSize;
    // Set a slightly larger size for ripple effect, scaled by global particleSize

    p.lifespan = random(20, 50);
    p.maxLife = p.lifespan;
    // Short lifespan for temporary ripple particles

    particles.push(p);
    // Add ripple particle to the system

    // Remove oldest particle to maintain count
    if (particles.length > particleCount + 20) {
      particles.shift();
      // If too many particles exist (due to ripples), remove the oldest one
    }
  }
}