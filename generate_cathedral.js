const { createCanvas } = require('canvas');
const fs = require('fs');

const width = 1000;
const height = 750;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Deep ocean gradient background
const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
bgGradient.addColorStop(0, '#0a1628');
bgGradient.addColorStop(0.4, '#0d1f3c');
bgGradient.addColorStop(0.7, '#0a2a4a');
bgGradient.addColorStop(1, '#051830');
ctx.fillStyle = bgGradient;
ctx.fillRect(0, 0, width, height);

// God rays from surface
for (let i = 0; i < 8; i++) {
  const x = 100 + i * 120;
  const rayGradient = ctx.createLinearGradient(x - 30, 0, x + 30, height * 0.7);
  rayGradient.addColorStop(0, 'rgba(100, 200, 255, 0.15)');
  rayGradient.addColorStop(0.5, 'rgba(80, 160, 220, 0.08)');
  rayGradient.addColorStop(1, 'rgba(60, 120, 180, 0)');
  ctx.fillStyle = rayGradient;
  ctx.beginPath();
  ctx.moveTo(x - 40 + Math.random() * 20, 0);
  ctx.lineTo(x + 80 + Math.random() * 20, height * 0.6);
  ctx.lineTo(x + 120 + Math.random() * 20, height * 0.6);
  ctx.lineTo(x + 20, 0);
  ctx.closePath();
  ctx.fill();
}

// Cathedral architecture (silhouette base)
ctx.fillStyle = '#0d2137';

// Main nave
ctx.beginPath();
ctx.moveTo(150, height);
ctx.lineTo(180, 200);
ctx.lineTo(220, 150);
ctx.lineTo(260, 200);
ctx.lineTo(280, height);
ctx.closePath();
ctx.fill();

// Left tower
ctx.beginPath();
ctx.moveTo(50, height);
ctx.lineTo(70, 180);
ctx.lineTo(100, 120);
ctx.lineTo(130, 180);
ctx.lineTo(140, height);
ctx.closePath();
ctx.fill();

// Right tower
ctx.beginPath();
ctx.moveTo(700, height);
ctx.lineTo(720, 160);
ctx.lineTo(750, 100);
ctx.lineTo(780, 160);
ctx.lineTo(800, height);
ctx.closePath();
ctx.fill();

// Central rose window frame (broken)
ctx.beginPath();
ctx.arc(500, 280, 100, 0, Math.PI * 2);
ctx.fillStyle = '#0a1a2e';
ctx.fill();

// Rose window stained glass - bioluminescent
const glassColors = ['#ff6b9d', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94'];
for (let i = 0; i < 12; i++) {
  const angle = (i / 12) * Math.PI * 2;
  const nextAngle = ((i + 1) / 12) * Math.PI * 2;
  ctx.beginPath();
  ctx.moveTo(500, 280);
  ctx.arc(500, 280, 90, angle, nextAngle);
  ctx.closePath();
  ctx.fillStyle = glassColors[i % glassColors.length] + '60';
  ctx.fill();
  ctx.strokeStyle = glassColors[i % glassColors.length] + '90';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Columns
for (let i = 0; i < 5; i++) {
  const x = 320 + i * 80;
  const colGradient = ctx.createLinearGradient(x - 15, 0, x + 15, 0);
  colGradient.addColorStop(0, '#081526');
  colGradient.addColorStop(0.5, '#0d2137');
  colGradient.addColorStop(1, '#081526');
  ctx.fillStyle = colGradient;
  ctx.fillRect(x - 12, 180, 24, height - 180);
  
  // Column capitals with bioluminescent coral
  ctx.fillStyle = '#ff6b9d';
  ctx.globalAlpha = 0.6;
  for (let j = 0; j < 5; j++) {
    ctx.beginPath();
    ctx.arc(x - 15 + j * 8, 175 + Math.random() * 10, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Bioluminescent coral on architecture
const coralColors = ['#ff6b9d', '#4ecdc4', '#ffe66d', '#a8e6cf'];
for (let i = 0; i < 60; i++) {
  const x = 100 + Math.random() * 800;
  const y = 200 + Math.random() * 400;
  const color = coralColors[Math.floor(Math.random() * coralColors.length)];
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.4 + Math.random() * 0.4;
  ctx.beginPath();
  ctx.arc(x, y, 3 + Math.random() * 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Coral branches
  for (let j = 0; j < 3; j++) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20);
    ctx.strokeStyle = color + '80';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
ctx.globalAlpha = 1;

// Manta rays
function drawMantaRay(x, y, size, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = 'rgba(20, 40, 70, 0.7)';
  ctx.beginPath();
  // Body
  ctx.ellipse(0, 0, size, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wings
  ctx.beginPath();
  ctx.moveTo(-size * 0.8, 0);
  ctx.quadraticCurveTo(-size * 1.5, -size * 0.8, -size * 2, -size * 0.2);
  ctx.quadraticCurveTo(-size * 1.5, size * 0.3, -size * 0.8, size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.8, 0);
  ctx.quadraticCurveTo(size * 1.5, -size * 0.8, size * 2, -size * 0.2);
  ctx.quadraticCurveTo(size * 1.5, size * 0.3, size * 0.8, size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Tail
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.2);
  ctx.lineTo(-size * 0.5, size * 1.5);
  ctx.lineTo(0, size * 0.2);
  ctx.fill();
  ctx.restore();
}

drawMantaRay(400, 180, 40, 0.2);
drawMantaRay(650, 220, 35, -0.1);
drawMantaRay(200, 300, 30, 0.3);

// Schools of neon fish
const fishColors = ['#ff006e', '#00f5ff', '#ffbe0b', '#8338ec'];
for (let school = 0; school < 4; school++) {
  const centerX = 200 + school * 200;
  const centerY = 350 + (school % 2) * 150;
  const color = fishColors[school % fishColors.length];
  
  for (let i = 0; i < 15; i++) {
    const fx = centerX + (Math.random() - 0.5) * 100;
    const fy = centerY + (Math.random() - 0.5) * 60;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(fx, fy, 6, 3, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}
ctx.globalAlpha = 1;

// Floating bioluminescent particles
for (let i = 0; i < 200; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const size = Math.random() * 3;
  const alpha = 0.3 + Math.random() * 0.5;
  const color = ['#4ecdc4', '#ff6b9d', '#ffe66d'][Math.floor(Math.random() * 3)];
  
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}
ctx.globalAlpha = 1;

// Jellyfish
function drawJellyfish(x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  
  // Bell
  ctx.fillStyle = color + '40';
  ctx.beginPath();
  ctx.arc(0, -size * 0.3, size, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color + '80';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Tentacles
  ctx.strokeStyle = color + '60';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.6 + i * size * 0.24, -size * 0.3);
    for (let j = 0; j < 8; j++) {
      ctx.lineTo(
        -size * 0.6 + i * size * 0.24 + Math.sin(j * 0.5) * 5,
        -size * 0.3 + j * size * 0.25
      );
    }
    ctx.stroke();
  }
  ctx.restore();
}

drawJellyfish(850, 150, 30, '#ff6b9d');
drawJellyfish(120, 400, 25, '#4ecdc4');
drawJellyfish(900, 500, 35, '#ffe66d');

// Broken stained glass shards floating
for (let i = 0; i < 20; i++) {
  const x = 400 + Math.random() * 200;
  const y = 350 + Math.random() * 300;
  const size = 10 + Math.random() * 20;
  const color = glassColors[Math.floor(Math.random() * glassColors.length)];
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.random() * Math.PI);
  ctx.fillStyle = color + '50';
  ctx.fillRect(-size/2, -size/2, size, size);
  ctx.strokeStyle = color + '80';
  ctx.lineWidth = 1;
  ctx.strokeRect(-size/2, -size/2, size, size);
  ctx.restore();
}

// Sea anemones on the floor
for (let i = 0; i < 30; i++) {
  const x = 50 + Math.random() * 900;
  const y = height - 20 - Math.random() * 50;
  const color = coralColors[Math.floor(Math.random() * coralColors.length)];
  
  ctx.strokeStyle = color + '70';
  ctx.lineWidth = 2;
  for (let j = 0; j < 8; j++) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + (Math.random() - 0.5) * 30,
      y - 20 - Math.random() * 30,
      x + (Math.random() - 0.5) * 40,
      y - 40 - Math.random() * 20
    );
    ctx.stroke();
  }
}

// Atmospheric overlay
const overlay = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
overlay.addColorStop(0, 'rgba(0,0,0,0)');
overlay.addColorStop(1, 'rgba(0,10,30,0.3)');
ctx.fillStyle = overlay;
ctx.fillRect(0, 0, width, height);

// Save
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('/data/workspace/daily_art_2026-02-17.png', buffer);
console.log('Created: /data/workspace/daily_art_2026-02-17.png');
