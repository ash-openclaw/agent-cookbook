const { createCanvas } = require('canvas');
const fs = require('fs');

const width = 1200;
const height = 800;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Seedable random
let seed = 12345;
function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

// Background - rusted industrial base
const gradient = ctx.createLinearGradient(0, 0, 0, height);
gradient.addColorStop(0, '#1a1510');
gradient.addColorStop(0.3, '#2d2418');
gradient.addColorStop(0.7, '#3d3020');
gradient.addColorStop(1, '#4a3a28');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Add rust texture overlay
for (let i = 0; i < 3000; i++) {
    const x = random() * width;
    const y = random() * height;
    const size = random() * 3 + 1;
    const alpha = random() * 0.3 + 0.1;
    ctx.fillStyle = `rgba(${Math.floor(100 + random() * 80)}, ${Math.floor(50 + random() * 40)}, ${Math.floor(20 + random() * 30)}, ${alpha})`;
    ctx.fillRect(x, y, size, size);
}

// Draw gear function
function drawGear(cx, cy, radius, teeth, rotation, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    
    ctx.beginPath();
    const innerRadius = radius * 0.7;
    
    for (let i = 0; i < teeth * 2; i++) {
        const angle = (i / (teeth * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? radius : innerRadius;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    const gearGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gearGrad.addColorStop(0, color.inner);
    gearGrad.addColorStop(0.6, color.mid);
    gearGrad.addColorStop(1, color.outer);
    ctx.fillStyle = gearGrad;
    ctx.fill();
    
    ctx.strokeStyle = '#1a0f0a';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0505';
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
}

// Draw mechanical flower
function drawMechFlower(x, y, scale, hue, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(rotation);
    
    // Stem - coiled metal
    ctx.beginPath();
    ctx.strokeStyle = `hsl(${hue}, 30%, 25%)`;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const stemX = Math.sin(t * Math.PI * 4) * 30 * (1 - t);
        const stemY = 150 + t * 100;
        if (i === 0) ctx.moveTo(stemX, stemY);
        else ctx.lineTo(stemX, stemY);
    }
    ctx.stroke();
    
    const petalCount = 6 + Math.floor(random() * 3);
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(25, -40, 50, -70, 20, -90);
        ctx.bezierCurveTo(0, -80, -20, -60, 0, 0);
        
        const petalGrad = ctx.createLinearGradient(0, 0, 0, -90);
        petalGrad.addColorStop(0, `hsl(${hue}, 50%, 20%)`);
        petalGrad.addColorStop(0.3, `hsl(${hue + 20}, 60%, 35%)`);
        petalGrad.addColorStop(0.7, `hsl(${hue + 40}, 70%, 45%)`);
        petalGrad.addColorStop(1, `hsl(${hue + 60}, 80%, 55%)`);
        ctx.fillStyle = petalGrad;
        ctx.fill();
        
        ctx.strokeStyle = `hsl(${hue}, 40%, 15%)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(15, -50);
        ctx.lineTo(5, -70);
        ctx.strokeStyle = `hsl(${hue}, 30%, 30%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
    
    // Flower center - gear-like
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    centerGrad.addColorStop(0, '#ffd700');
    centerGrad.addColorStop(0.5, '#b8860b');
    centerGrad.addColorStop(1, '#5c4033');
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.strokeStyle = '#3d2817';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(13, -3, 8, 6);
        ctx.restore();
    }
    
    ctx.restore();
}

// Draw vines
function drawVine(startX, startY, endX, endY, thickness, hue) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    const cp1x = startX + (endX - startX) * 0.3 + (random() - 0.5) * 100;
    const cp1y = startY + (endY - startY) * 0.3 + (random() - 0.5) * 100;
    const cp2x = startX + (endX - startX) * 0.7 + (random() - 0.5) * 100;
    const cp2y = startY + (endY - startY) * 0.7 + (random() - 0.5) * 100;
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.strokeStyle = `hsl(${hue}, 25%, 20%)`;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    const segments = 6;
    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const bx = Math.pow(1-t, 3)*startX + 3*Math.pow(1-t, 2)*t*cp1x + 3*(1-t)*t*t*cp2x + Math.pow(t, 3)*endX;
        const by = Math.pow(1-t, 3)*startY + 3*Math.pow(1-t, 2)*t*cp1y + 3*(1-t)*t*t*cp2y + Math.pow(t, 3)*endY;
        
        ctx.beginPath();
        ctx.arc(bx, by, thickness * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, 40%, 35%)`;
        ctx.fill();
        ctx.strokeStyle = `hsl(${hue}, 30%, 15%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Scattered gears
const gearColors = [
    { inner: '#5c4a3a', mid: '#8b6f4e', outer: '#a08060' },
    { inner: '#4a4035', mid: '#6b5a4a', outer: '#8a7a6a' },
    { inner: '#3d3028', mid: '#5a4a3a', outer: '#786858' }
];

for (let i = 0; i < 12; i++) {
    const x = 50 + random() * 1100;
    const y = 100 + random() * 600;
    const radius = 30 + random() * 50;
    const teeth = 8 + Math.floor(random() * 8);
    const rotation = random() * Math.PI * 2;
    const color = gearColors[Math.floor(random() * gearColors.length)];
    drawGear(x, y, radius, teeth, rotation, color);
}

// Vines
for (let i = 0; i < 8; i++) {
    const startX = random() * width;
    const startY = 700 + random() * 50;
    const endX = 100 + random() * 1000;
    const endY = 100 + random() * 300;
    const thickness = 4 + random() * 6;
    const hue = 80 + random() * 60;
    drawVine(startX, startY, endX, endY, thickness, hue);
}

// Flowers
const flowerPositions = [
    { x: 200, y: 500, scale: 1.2, hue: 320 },
    { x: 500, y: 400, scale: 0.9, hue: 30 },
    { x: 800, y: 550, scale: 1.1, hue: 200 },
    { x: 350, y: 300, scale: 0.7, hue: 280 },
    { x: 650, y: 650, scale: 0.8, hue: 45 },
    { x: 950, y: 380, scale: 0.6, hue: 160 },
    { x: 150, y: 200, scale: 0.5, hue: 340 }
];

flowerPositions.forEach(flower => {
    drawMechFlower(flower.x, flower.y, flower.scale, flower.hue, random() * Math.PI * 2);
});

// Floating particles
for (let i = 0; i < 150; i++) {
    const x = random() * width;
    const y = random() * height;
    const size = random() * 3 + 1;
    const hue = random() * 60 + 40;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${Math.floor(hue)}, 80%, 60%, ${random() * 0.6 + 0.2})`;
    ctx.fill();
}

// Brass pistons
for (let i = 0; i < 5; i++) {
    const x = 100 + i * 250 + random() * 50;
    const y = 750;
    const h = 80 + random() * 100;
    
    const grad = ctx.createLinearGradient(x - 20, 0, x + 20, 0);
    grad.addColorStop(0, '#3d3020');
    grad.addColorStop(0.3, '#8b7355');
    grad.addColorStop(0.7, '#a08060');
    grad.addColorStop(1, '#3d3020');
    ctx.fillStyle = grad;
    ctx.fillRect(x - 15, y - h, 30, h);
    
    ctx.fillStyle = '#6b5344';
    ctx.fillRect(x - 20, y - h - 10, 40, 15);
    ctx.fillStyle = '#4a3a28';
    ctx.fillRect(x - 18, y - h - 8, 36, 3);
    
    for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        const wispX = x + (random() - 0.5) * 20;
        const wispY = y - h - 20 - j * 30;
        ctx.arc(wispX, wispY, 8 - j * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${Math.floor(40 + random() * 20)}, 60%, 50%, ${0.3 - j * 0.1})`;
        ctx.fill();
    }
}

// Title
ctx.font = 'italic 24px Georgia, serif';
ctx.fillStyle = 'rgba(200, 180, 140, 0.6)';
ctx.fillText('mechanical garden', 50, 750);
ctx.font = '14px monospace';
ctx.fillStyle = 'rgba(200, 180, 140, 0.4)';
ctx.fillText('2026.02.24 — Ash', 50, 770);

// Save
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('/data/workspace/mech-garden.png', buffer);
console.log('Saved to /data/workspace/mech-garden.png');
