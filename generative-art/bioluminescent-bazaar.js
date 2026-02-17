const { createCanvas } = require('canvas');
const fs = require('fs');

const canvas = createCanvas(800, 600);
const ctx = canvas.getContext('2d');

// Deep ocean canyon background
const bgGradient = ctx.createLinearGradient(0, 0, 0, 600);
bgGradient.addColorStop(0, '#020510');
bgGradient.addColorStop(0.5, '#0a1a3a');
bgGradient.addColorStop(1, '#051025');
ctx.fillStyle = bgGradient;
ctx.fillRect(0, 0, 800, 600);

// Canyon walls
const wallGradient = ctx.createLinearGradient(0, 0, 200, 0);
wallGradient.addColorStop(0, '#0d1f3d');
wallGradient.addColorStop(1, '#061226');
ctx.fillStyle = wallGradient;
ctx.fillRect(0, 0, 180, 600);

const wallGradient2 = ctx.createLinearGradient(600, 0, 800, 0);
wallGradient2.addColorStop(0, '#061226');
wallGradient2.addColorStop(1, '#0d1f3d');
ctx.fillStyle = wallGradient2;
ctx.fillRect(620, 0, 180, 600);

// Rock formations on canyon walls
function drawRock(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

for (let i = 0; i < 15; i++) {
    drawRock(30 + Math.random() * 120, Math.random() * 600, 20 + Math.random() * 30, '#0a1528');
    drawRock(650 + Math.random() * 120, Math.random() * 600, 20 + Math.random() * 30, '#0a1528');
}

// Coral store awnings/platforms
function drawCoralStore(x, y, w, h, color, glowColor) {
    // Platform
    ctx.fillStyle = '#1a3a5c';
    ctx.fillRect(x, y, w, 10);
    
    // Coral awning
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20;
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(x + i * (w/5) + w/10, y, 25, 0, Math.PI, true);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
    
    // Store sign
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffd700';
    ctx.font = '10px serif';
    ctx.fillText('◆', x + w/2 - 5, y - 30);
    ctx.shadowBlur = 0;
}

// Left wall stores
drawCoralStore(40, 150, 100, 60, '#ff6b9d', '#ff1493');
drawCoralStore(40, 350, 100, 60, '#4ecdc4', '#00ced1');
drawCoralStore(40, 520, 100, 60, '#ffd93d', '#ffd700');

// Right wall stores
drawCoralStore(660, 180, 100, 60, '#a855f7', '#da70d6');
drawCoralStore(660, 380, 100, 60, '#ff8b94', '#ff69b4');

// Central marketplace platform
ctx.fillStyle = '#1a3a5c';
ctx.fillRect(250, 400, 300, 15);

// Main coral bazaar canopy
ctx.shadowColor = '#ff00ff';
ctx.shadowBlur = 30;
const canopyGradient = ctx.createLinearGradient(250, 350, 550, 350);
canopyGradient.addColorStop(0, '#ff1493');
canopyGradient.addColorStop(0.5, '#00ffff');
canopyGradient.addColorStop(1, '#ff1493');
ctx.fillStyle = canopyGradient;

// Draw scalloped canopy
for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(280 + i * 45, 380, 35, 0, Math.PI, true);
    ctx.fill();
}
ctx.shadowBlur = 0;

// Anglerfish lanterns/vendors
function drawAnglerfish(x, y, scale, facingRight) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facingRight ? scale : -scale, scale);
    
    // Glow from lure
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 25;
    
    // Lure line
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.quadraticCurveTo(10, -35, 15, -50);
    ctx.stroke();
    
    // Glowing lure bulb
    ctx.fillStyle = '#39ff14';
    ctx.beginPath();
    ctx.arc(15, -50, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Fish body
    ctx.shadowColor = '#2d3748';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(12, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(13, -5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Fins
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(-5, 5);
    ctx.quadraticCurveTo(-20, 15, -15, 25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.quadraticCurveTo(-25, -10, -20, -20);
    ctx.stroke();
    
    ctx.restore();
}

// Anglerfish vendors
drawAnglerfish(180, 130, 0.9, true);
drawAnglerfish(620, 160, 1.0, false);
drawAnglerfish(200, 330, 0.8, true);
drawAnglerfish(600, 360, 0.85, false);
drawAnglerfish(160, 500, 1.1, true);

// Jellyfish chandeliers
function drawChandelier(x, y, scale, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    
    // Bell
    const bellGrad = ctx.createRadialGradient(0, -15, 0, 0, 0, 35);
    bellGrad.addColorStop(0, color + 'cc');
    bellGrad.addColorStop(0.6, color + '66');
    bellGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bellGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 30, Math.PI, 0);
    ctx.quadraticCurveTo(30, 20, 0, 15);
    ctx.quadraticCurveTo(-30, 20, -30, 0);
    ctx.fill();
    
    // Tentacles flowing down
    ctx.strokeStyle = color + '99';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    for (let i = 0; i < 8; i++) {
        const offsetX = (i - 3.5) * 6;
        ctx.beginPath();
        ctx.moveTo(offsetX, 15);
        for (let t = 0; t < 80; t += 3) {
            const waveX = Math.sin(t * 0.08 + i * 0.5) * 4;
            ctx.lineTo(offsetX + waveX, 15 + t);
        }
        ctx.stroke();
    }
    
    ctx.restore();
}

// Chandeliers above market
drawChandelier(300, 200, 1.2, '#ff69b4');
drawChandelier(400, 120, 1.0, '#00ffff');
drawChandelier(500, 180, 1.1, '#ffd700');

// Glowing treasures/goods
const treasures = [
    {x: 280, y: 390, color: '#ffd700', type: 'chest'},
    {x: 320, y: 395, color: '#ff1493', type: 'orb'},
    {x: 400, y: 385, color: '#00ffff', type: 'pearl'},
    {x: 480, y: 395, color: '#ff69b4', type: 'shell'},
    {x: 520, y: 390, color: '#ffd700', type: 'chest'},
    {x: 90, y: 140, color: '#4ecdc4', type: 'orb'},
    {x: 90, y: 340, color: '#ff6b9d', type: 'shell'},
    {x: 710, y: 170, color: '#ffd700', type: 'pearl'},
    {x: 710, y: 370, color: '#a855f7', type: 'orb'},
];

treasures.forEach(t => {
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = t.color;
    
    if (t.type === 'chest') {
        ctx.fillRect(t.x, t.y, 20, 15);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(t.x + 8, t.y + 5, 4, 5);
    } else if (t.type === 'orb') {
        ctx.beginPath();
        ctx.arc(t.x + 10, t.y + 7, 10, 0, Math.PI * 2);
        ctx.fill();
    } else if (t.type === 'pearl') {
        ctx.beginPath();
        ctx.ellipse(t.x + 10, t.y + 8, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (t.type === 'shell') {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = Math.PI + (i - 2) * 0.3;
            ctx.lineTo(t.x + 10 + Math.cos(angle) * 12, t.y + 10 + Math.sin(angle) * 8);
        }
        ctx.fill();
    }
});
ctx.shadowBlur = 0;

// Bubbles from creatures
function drawBubble(x, y, size) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x - size*0.3, y - size*0.3, size*0.2, 0, Math.PI * 2);
    ctx.fill();
}

for (let i = 0; i < 40; i++) {
    const x = 100 + Math.random() * 600;
    const y = 50 + Math.random() * 550;
    drawBubble(x, y, 3 + Math.random() * 8);
}

// Bioluminescent plankton/particles
for (let i = 0; i < 120; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 600;
    const size = Math.random() * 2;
    const colors = ['#00ffff', '#ff1493', '#ffd700', '#00ff00', '#ff69b4'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const opacity = 0.3 + Math.random() * 0.7;
    
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}
ctx.shadowBlur = 0;

// Sea creatures browsing
// Small fish
function drawFish(x, y, scale, color, facingRight) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facingRight ? scale : -scale, scale);
    
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Tail
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-18, -5);
    ctx.lineTo(-18, 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

drawFish(350, 450, 1.0, '#ff6b9d', true);
drawFish(450, 460, 0.9, '#4ecdc4', false);
drawFish(380, 480, 0.8, '#ffd93d', true);
drawFish(420, 470, 0.85, '#a855f7', false);

// Canyon floor detail
ctx.fillStyle = '#0a1528';
for (let i = 0; i < 30; i++) {
    const x = Math.random() * 800;
    const y = 550 + Math.random() * 50;
    ctx.beginPath();
    ctx.arc(x, y, 5 + Math.random() * 15, 0, Math.PI, true);
    ctx.fill();
}

// Deep water vignette
const vignette = ctx.createRadialGradient(400, 300, 250, 400, 300, 500);
vignette.addColorStop(0, 'transparent');
vignette.addColorStop(1, 'rgba(2, 5, 16, 0.8)');
ctx.fillStyle = vignette;
ctx.fillRect(0, 0, 800, 600);

// Signature
ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
ctx.font = 'italic 14px serif';
ctx.textAlign = 'right';
ctx.fillText('Ash — Bioluminescent Bazaar', 780, 580);

// Save
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('/data/workspace/generative-art/bioluminescent-bazaar-ash.png', buffer);
console.log('Generated: bioluminescent-bazaar-ash.png');
