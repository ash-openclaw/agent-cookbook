const { createCanvas } = require('canvas');
const fs = require('fs');

const width = 1000;
const height = 750;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background - industrial ocean
const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
bgGradient.addColorStop(0, '#1a1a2e');
bgGradient.addColorStop(0.3, '#16213e');
bgGradient.addColorStop(0.6, '#0f3460');
bgGradient.addColorStop(1, '#1a1a2e');
ctx.fillStyle = bgGradient;
ctx.fillRect(0, 0, width, height);

// Function to draw a gear
function drawGear(x, y, radius, teeth, color, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  // Main gear body
  ctx.fillStyle = color;
  ctx.beginPath();
  const innerRadius = radius * 0.7;
  const toothHeight = radius * 0.25;
  
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? radius : innerRadius;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  
  // Inner circle (hole)
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
  ctx.fill();
  
  // Highlight
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
}

// Large gears in background (turning like tides)
drawGear(150, 200, 120, 16, '#b87333', 0.2);
drawGear(850, 300, 100, 14, '#cd7f32', 0.5);
drawGear(500, 150, 80, 12, '#d4af37', 0.1);

// Medium gears
drawGear(300, 400, 60, 10, '#c9b037', 0.3);
drawGear(700, 500, 70, 12, '#b8860b', 0.7);
drawGear(200, 600, 50, 8, '#cd7f32', 0.4);

// Small gears
drawGear(400, 300, 35, 8, '#daa520', 0.6);
drawGear(600, 250, 30, 6, '#b87333', 0.2);
drawGear(750, 450, 40, 8, '#c9b037', 0.8);

// Function to draw mechanical fish
function drawMechanicalFish(x, y, size, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  // Body - segmented copper/brass
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Segmentation lines
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  for (let i = -size * 0.6; i < size * 0.6; i += size * 0.3) {
    ctx.beginPath();
    ctx.moveTo(i, -size * 0.35);
    ctx.lineTo(i, size * 0.35);
    ctx.stroke();
  }
  
  // Rivets
  ctx.fillStyle = '#ffd700';
  for (let i = -size * 0.5; i < size * 0.5; i += size * 0.25) {
    ctx.beginPath();
    ctx.arc(i, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Tail - mechanical fins
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-size * 0.8, 0);
  ctx.lineTo(-size * 1.4, -size * 0.4);
  ctx.lineTo(-size * 1.3, 0);
  ctx.lineTo(-size * 1.4, size * 0.4);
  ctx.closePath();
  ctx.fill();
  
  // Eye (glowing)
  ctx.fillStyle = '#00ffff';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(size * 0.5, -size * 0.1, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Steam puffs
  ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(-size - i * 8, (Math.random() - 0.5) * 10, 4 + i * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

// School of copper fish
const fishColors = ['#b87333', '#cd7f32', '#c9b037', '#d4af37'];
for (let i = 0; i < 12; i++) {
  const x = 200 + (i % 4) * 150 + Math.random() * 50;
  const y = 300 + Math.floor(i / 4) * 100 + Math.random() * 30;
  const size = 25 + Math.random() * 15;
  const angle = -0.1 + Math.random() * 0.2;
  drawMechanicalFish(x, y, size, angle, fishColors[i % fishColors.length]);
}

// Steam-powered whale
function drawSteamWhale(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Main body - brass hull
  const bodyGradient = ctx.createLinearGradient(-150, -50, 150, 50);
  bodyGradient.addColorStop(0, '#8b7355');
  bodyGradient.addColorStop(0.5, '#b87333');
  bodyGradient.addColorStop(1, '#cd7f32');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, 180, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Hull plates
  ctx.strokeStyle = 'rgba(60, 40, 20, 0.5)';
  ctx.lineWidth = 3;
  for (let i = -140; i < 140; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, -70);
    ctx.lineTo(i, 70);
    ctx.stroke();
  }
  
  // Rivets along plates
  ctx.fillStyle = '#ffd700';
  for (let i = -120; i < 120; i += 40) {
    for (let j = -50; j <= 50; j += 50) {
      ctx.beginPath();
      ctx.arc(i, j, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Tail fluke - mechanical
  ctx.fillStyle = '#b87333';
  ctx.beginPath();
  ctx.moveTo(-170, 0);
  ctx.lineTo(-240, -50);
  ctx.lineTo(-230, 0);
  ctx.lineTo(-240, 50);
  ctx.closePath();
  ctx.fill();
  
  // Fin on back
  ctx.fillStyle = '#cd7f32';
  ctx.beginPath();
  ctx.moveTo(-20, -70);
  ctx.lineTo(-10, -110);
  ctx.lineTo(20, -75);
  ctx.closePath();
  ctx.fill();
  
  // Steam stacks (blowholes)
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(-30, -85, 15, 30);
  ctx.fillRect(10, -88, 15, 30);
  ctx.fillRect(40, -82, 15, 30);
  
  // Steam clouds
  ctx.fillStyle = 'rgba(220, 220, 220, 0.4)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(-22 + i * 3, -110 - i * 15, 15 + i * 5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(17 + i * 2, -115 - i * 12, 12 + i * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(47 + i * 2, -105 - i * 14, 14 + i * 5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Eye - glowing porthole
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(100, -20, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#00ffff';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(100, -20, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Glowing window/porthole ring
  ctx.strokeStyle = '#daa520';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(100, -20, 20, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
}

drawSteamWhale(700, 550, 0.9);

// Oil-slick waves (metallic surface)
function drawMetallicWave(y, amplitude, color, alpha) {
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, y);
  
  for (let x = 0; x <= width; x += 10) {
    const waveY = y + Math.sin(x * 0.02) * amplitude + Math.sin(x * 0.01) * (amplitude * 0.5);
    ctx.lineTo(x, waveY);
  }
  
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

// Oil-slick wave layers
drawMetallicWave(650, 30, '#2d2d3a', 0.8);
drawMetallicWave(680, 25, '#3d3d4a', 0.6);
drawMetallicWave(710, 20, '#4a4a5a', 0.4);

// Silver currents (flowing lines)
ctx.strokeStyle = 'rgba(192, 192, 192, 0.3)';
ctx.lineWidth = 2;
for (let i = 0; i < 20; i++) {
  ctx.beginPath();
  const startY = 100 + i * 30;
  ctx.moveTo(0, startY);
  
  for (let x = 0; x <= width; x += 50) {
    ctx.lineTo(x, startY + Math.sin(x * 0.01 + i) * 20);
  }
  ctx.stroke();
}

// Floating cogs and mechanical debris
for (let i = 0; i < 30; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height * 0.8;
  const size = 5 + Math.random() * 10;
  const color = ['#b87333', '#cd7f32', '#c0c0c0', '#ffd700'][Math.floor(Math.random() * 4)];
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.random() * Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  // Teeth
  for (let j = 0; j < 6; j++) {
    const angle = (j / 6) * Math.PI * 2;
    ctx.fillRect(
      Math.cos(angle) * size - 1,
      Math.sin(angle) * size - 1,
      2, 2
    );
  }
  ctx.restore();
}
ctx.globalAlpha = 1;

// Steam particles throughout
ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
for (let i = 0; i < 50; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const size = 5 + Math.random() * 15;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

// Mechanical bubbles (brass spheres)
for (let i = 0; i < 40; i++) {
  const x = Math.random() * width;
  const y = 500 + Math.random() * 250;
  const size = 3 + Math.random() * 8;
  
  const bubbleGradient = ctx.createRadialGradient(x - size/3, y - size/3, 0, x, y, size);
  bubbleGradient.addColorStop(0, '#ffd700');
  bubbleGradient.addColorStop(0.5, '#b87333');
  bubbleGradient.addColorStop(1, '#8b4513');
  
  ctx.fillStyle = bubbleGradient;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}
ctx.globalAlpha = 1;

// Vignette overlay
const vignette = ctx.createRadialGradient(width/2, height/2, 200, width/2, height/2, width);
vignette.addColorStop(0, 'rgba(0,0,0,0)');
vignette.addColorStop(1, 'rgba(10,10,20,0.4)');
ctx.fillStyle = vignette;
ctx.fillRect(0, 0, width, height);

// Save
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('/data/workspace/daily_art_clockwork_ocean.png', buffer);
console.log('Created: /data/workspace/daily_art_clockwork_ocean.png');
