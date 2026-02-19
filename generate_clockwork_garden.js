const { createCanvas } = require('canvas');
const fs = require('fs');

const width = 1000;
const height = 750;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Victorian steampunk palette
const colors = {
  brass: ['#B5A642', '#D4AF37', '#F4C430', '#C9AE5D'],
  copper: ['#B87333', '#DA8A67', '#E8A87D', '#C67854'],
  gold: ['#D4AF37', '#FFD700', '#F4D03F'],
  iron: ['#434B4D', '#6C7575', '#A0A0A0'],
  bronze: ['#CD7F32', '#B87333', '#8B4513'],
  steam: ['rgba(255,255,255,0.2)', 'rgba(240,248,255,0.15)'],
  glow: 'rgba(255,200,100,0.3)',
  bg: ['#1a1510', '#2d2018', '#15100c']
};

function random(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Background - Victorian greenhouse
const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
bgGrad.addColorStop(0, colors.bg[0]);
bgGrad.addColorStop(0.5, colors.bg[1]);
bgGrad.addColorStop(1, colors.bg[2]);
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, width, height);

// Greenhouse glass panels
ctx.strokeStyle = 'rgba(100, 80, 60, 0.4)';
ctx.lineWidth = 3;
for (let x = 80; x < width; x += 120) {
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
}
for (let y = 100; y < height; y += 100) {
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
}

// Arched greenhouse roof frame
ctx.strokeStyle = '#4A3728';
ctx.lineWidth = 5;
ctx.beginPath();
ctx.moveTo(0, 150);
ctx.quadraticCurveTo(width / 2, -60, width, 150);
ctx.stroke();

// Floor tiles
const floorGrad = ctx.createLinearGradient(0, height - 120, 0, height);
floorGrad.addColorStop(0, '#3d3428');
floorGrad.addColorStop(1, '#1a1510');
ctx.fillStyle = floorGrad;
ctx.fillRect(0, height - 120, width, 120);

ctx.strokeStyle = '#4d4440';
ctx.lineWidth = 1;
for (let i = 0; i < width; i += 60) {
  ctx.beginPath();
  ctx.moveTo(i, height - 120);
  ctx.lineTo(i - 40, height);
  ctx.stroke();
}

// Function to draw gear
function drawGear(x, y, radius, teeth, color, rotation) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  
  const innerR = radius * 0.65;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? radius : innerR;
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  
  ctx.fillStyle = colors.bg[0];
  ctx.beginPath(); ctx.arc(0, 0, innerR * 0.3, 0, Math.PI * 2); ctx.fill();
  
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// Function to draw mechanical flower
function drawMechanicalFlower(x, y, scale) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  
  // Stem (metal rod)
  ctx.strokeStyle = pick(colors.iron);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(random(-20, 20), 35, random(-10, 10), 70);
  ctx.stroke();
  
  // Leaves (gear-like)
  for (let i = 0; i < 3; i++) {
    const lx = random(-40, 40);
    const ly = 30 + i * 20;
    ctx.fillStyle = pick(colors.bronze);
    ctx.beginPath();
    ctx.ellipse(lx, ly, 18, 10, random(-0.5, 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Petals (gears)
  const petalCount = 6;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const px = Math.cos(angle) * 45;
    const py = Math.sin(angle) * 45;
    const pColor = pick([...colors.brass, ...colors.copper]);
    drawGear(px, py, 15, 6, pColor, random(0, Math.PI));
  }
  
  // Center (main gear)
  drawGear(0, 0, 20, 8, pick(colors.gold), random(0, Math.PI));
  
  // Glow
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 55);
  glow.addColorStop(0, colors.glow);
  glow.addColorStop(1, 'rgba(255,200,100,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI * 2); ctx.fill();
  
  ctx.restore();
}

// Function to draw mechanical butterfly
function drawMechanicalButterfly(x, y, scale, rotation) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.scale(scale, scale);
  
  // Wings
  const wingColor = pick(colors.copper);
  const wingAccents = pick(colors.brass);
  
  for (let side of [-1, 1]) {
    ctx.save(); ctx.scale(side, 1);
    
    // Upper wing
    ctx.fillStyle = wingColor;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(20, -25, 50, -35, 55, -15);
    ctx.bezierCurveTo(60, -5, 45, 5, 0, 5);
    ctx.fill(); ctx.stroke();
    
    // Wing veins
    ctx.strokeStyle = wingAccents;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(5, -5 - i * 5);
      ctx.lineTo(40 - i * 5, -15 + i * 5);
      ctx.stroke();
    }
    
    // Lower wing
    ctx.fillStyle = wingColor;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(15, 20, 35, 30, 38, 20);
    ctx.bezierCurveTo(35, 12, 20, 8, 0, 10);
    ctx.fill(); ctx.stroke();
    
    ctx.restore();
  }
  
  // Body
  ctx.fillStyle = pick(colors.iron);
  ctx.fillRect(-3, -15, 6, 30);
  
  // Head
  ctx.fillStyle = pick(colors.bronze);
  ctx.beginPath(); ctx.arc(0, -18, 5, 0, Math.PI * 2); ctx.fill();
  
  // Antennae
  ctx.strokeStyle = pick(colors.gold);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-2, -20); ctx.quadraticCurveTo(-8, -28, -12, -25);
  ctx.moveTo(2, -20); ctx.quadraticCurveTo(8, -28, 12, -25);
  ctx.stroke();
  
  // Glow
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 35);
  glow.addColorStop(0, 'rgba(255,200,100,0.2)');
  glow.addColorStop(1, 'rgba(255,200,100,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, 35, 0, Math.PI * 2); ctx.fill();
  
  ctx.restore();
}

// Draw metal vines
function drawMetalVine(x1, y1, x2, y2, thickness) {
  ctx.strokeStyle = pick(colors.iron);
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const midX = (x1 + x2) / 2 + random(-30, 30);
  const midY = (y1 + y2) / 2 + random(-20, 20);
  ctx.bezierCurveTo(x1, midY, x2, midY, x2, y2);
  ctx.stroke();
  
  // Rivets
  ctx.fillStyle = pick([...colors.brass, ...colors.copper]);
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const rx = x1 + (x2 - x1) * t * 0.5 + random(-5, 5);
    const ry = y1 + (y2 - y1) * t;
    ctx.beginPath(); ctx.arc(rx, ry, thickness * 0.3, 0, Math.PI * 2); ctx.fill();
  }
}

// Background vines
for (let i = 0; i < 4; i++) {
  drawMetalVine(random(50, 200), random(200, 350), random(800, 950), random(500, 650), random(4, 7));
}

// Mechanical flowers
const flowerPos = [
  {x: 180, y: 220, scale: 0.9},{x: 350, y: 180, scale: 1.1},{x: 520, y: 250, scale: 0.85},
  {x: 680, y: 200, scale: 1.0},{x: 820, y: 240, scale: 0.8},{x: 250, y: 320, scale: 0.7},
  {x: 600, y: 320, scale: 0.75},{x: 450, y: 140, scale: 0.65}
];
flowerPos.forEach(f => drawMechanicalFlower(f.x, f.y, f.scale));

// Mechanical butterflies
const butterflyPos = [
  {x: 280, y: 150, scale: 0.7, rot: 0.3},{x: 720, y: 280, scale: 0.6, rot: -0.2},
  {x: 500, y: 100, scale: 0.5, rot: 0.5},{x: 150, y: 300, scale: 0.55, rot: -0.4}
];
butterflyPos.forEach(b => drawMechanicalButterfly(b.x, b.y, b.scale, b.rot));

// Steam/glow effects
for (let i = 0; i < 12; i++) {
  const x = random(0, width);
  const y = random(100, height - 100);
  const r = random(40, 100);
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, pick(colors.steam));
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

// Atmospheric vignette
const vig = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, width);
vig.addColorStop(0, 'rgba(0,0,0,0)');
vig.addColorStop(1, 'rgba(10,5,5,0.5)');
ctx.fillStyle = vig;
ctx.fillRect(0, 0, width, height);

// Save
const buf = canvas.toBuffer('image/png');
fs.writeFileSync('/data/workspace/daily_art_clockwork_garden.png', buf);
console.log('Created: daily_art_clockwork_garden.png');
