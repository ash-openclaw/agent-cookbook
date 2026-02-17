const { createCanvas } = require('canvas');
const fs = require('fs');

const canvas = createCanvas(800, 600);
const ctx = canvas.getContext('2d');

// Deep ocean abyss background
const bgGradient = ctx.createLinearGradient(0, 0, 0, 600);
bgGradient.addColorStop(0, '#02040a');
bgGradient.addColorStop(0.4, '#0a1628');
bgGradient.addColorStop(1, '#051220');
ctx.fillStyle = bgGradient;
ctx.fillRect(0, 0, 800, 600);

// God rays from surface
function drawGodRay(x, width, opacity) {
    const ray = ctx.createLinearGradient(x, 0, x + width/3, 500);
    ray.addColorStop(0, `rgba(100, 150, 200, ${opacity})`);
    ray.addColorStop(0.6, `rgba(50, 100, 150, ${opacity * 0.5})`);
    ray.addColorStop(1, 'transparent');
    ctx.fillStyle = ray;
    ctx.beginPath();
    ctx.moveTo(x - width/2, 0);
    ctx.lineTo(x + width/2, 0);
    ctx.lineTo(x + width, 500);
    ctx.lineTo(x - width/3, 500);
    ctx.closePath();
    ctx.fill();
}

for (let i = 100; i < 800; i += 180) {
    drawGodRay(i, 60 + Math.random() * 40, 0.15 + Math.random() * 0.1);
}

// Gothic cathedral silhouette
ctx.fillStyle = '#0d1a2d';
// Main nave
ctx.fillRect(300, 150, 200, 450);
// Left tower
ctx.fillRect(250, 100, 60, 500);
// Right tower
ctx.fillRect(490, 100, 60, 500);
// Spires
ctx.beginPath();
ctx.moveTo(250, 100);
ctx.lineTo(280, 40);
ctx.lineTo(310, 100);
ctx.fill();
ctx.beginPath();
ctx.moveTo(490, 100);
ctx.lineTo(520, 40);
ctx.lineTo(550, 100);
ctx.fill();

// Rose window with bioluminescence
const roseX = 400;
const roseY = 280;
const roseGradient = ctx.createRadialGradient(roseX, roseY, 0, roseX, roseY, 70);
roseGradient.addColorStop(0, '#ff6b9d');
roseGradient.addColorStop(0.3, '#c44569');
roseGradient.addColorStop(0.6, '#00d2ff');
roseGradient.addColorStop(1, 'transparent');
ctx.fillStyle = roseGradient;
ctx.beginPath();
ctx.arc(roseX, roseY, 70, 0, Math.PI * 2);
ctx.fill();

// Rose window stone frame
ctx.strokeStyle = '#1a3a5c';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.arc(roseX, roseY, 65, 0, Math.PI * 2);
ctx.stroke();
// Petals of rose window
for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(roseX, roseY);
    ctx.lineTo(roseX + Math.cos(angle) * 65, roseY + Math.sin(angle) * 65);
    ctx.stroke();
}

// Stained glass windows (glowing)
const windows = [
    {x: 320, y: 400, w: 30, h: 80, color: '#ff6b35'},
    {x: 360, y: 400, w: 30, h: 80, color: '#ffd93d'},
    {x: 450, y: 400, w: 30, h: 80, color: '#6bcf7f'},
    {x: 410, y: 400, w: 30, h: 80, color: '#4ecdc4'},
    {x: 270, y: 200, w: 20, h: 60, color: '#a855f7'},
    {x: 270, y: 300, w: 20, h: 60, color: '#ec4899'},
    {x: 510, y: 200, w: 20, h: 60, color: '#3b82f6'},
    {x: 510, y: 300, w: 20, h: 60, color: '#10b981'},
];

windows.forEach(w => {
    // Glow behind window
    ctx.shadowColor = w.color;
    ctx.shadowBlur = 25;
    ctx.fillStyle = w.color + '44';
    ctx.fillRect(w.x - 5, w.y - 5, w.w + 10, w.h + 10);
    
    // Window itself
    ctx.fillStyle = w.color;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    
    // Window frame
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#1a3a5c';
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
});

// Coral colonies on architecture
function drawCoral(x, y, size, color, type) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    if (type === 'branch') {
        for (let i = 0; i < 5; i++) {
            const angle = -Math.PI/2 + (i - 2) * 0.3;
            const length = size * (0.8 + Math.random() * 0.4);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            ctx.stroke();
            
            // Sub-branches
            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;
            for (let j = 0; j < 3; j++) {
                const subAngle = angle + (j - 1) * 0.4;
                ctx.beginPath();
                ctx.moveTo(endX, endY);
                ctx.lineTo(endX + Math.cos(subAngle) * length * 0.5, endY + Math.sin(subAngle) * length * 0.5);
                ctx.stroke();
            }
        }
    } else if (type === 'fan') {
        for (let i = 0; i < 12; i++) {
            const angle = -Math.PI/2 + (i - 5.5) * 0.15;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
                x + Math.cos(angle) * size * 0.5,
                y + Math.sin(angle) * size * 0.3,
                x + Math.cos(angle) * size,
                y + Math.sin(angle) * size
            );
            ctx.stroke();
        }
    }
}

// Add coral to towers and base
const coralColors = ['#ff6b6b', '#f9ca24', '#f0932b', '#eb4d4b', '#ff9f43', '#ee5a24'];
for (let i = 0; i < 25; i++) {
    const x = 200 + Math.random() * 400;
    const y = 400 + Math.random() * 180;
    const color = coralColors[Math.floor(Math.random() * coralColors.length)];
    drawCoral(x, y, 20 + Math.random() * 30, color, Math.random() > 0.5 ? 'branch' : 'fan');
}

// Add coral to tower bases
drawCoral(255, 500, 35, '#ff6b6b', 'branch');
drawCoral(545, 480, 40, '#f9ca24', 'fan');
drawCoral(290, 520, 30, '#f0932b', 'branch');
drawCoral(500, 510, 35, '#eb4d4b', 'fan');

// Jellyfish function
function drawJellyfish(x, y, scale, color, glowColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Glow
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 30;
    
    // Bell
    const bellGrad = ctx.createRadialGradient(0, -10, 0, 0, 0, 30);
    bellGrad.addColorStop(0, color + 'cc');
    bellGrad.addColorStop(0.7, color + '66');
    bellGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bellGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 25, Math.PI, 0);
    ctx.bezierCurveTo(25, 15, -25, 15, -25, 0);
    ctx.fill();
    
    // Tentacles
    ctx.strokeStyle = color + '99';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    for (let i = 0; i < 6; i++) {
        const offsetX = (i - 2.5) * 6;
        ctx.beginPath();
        ctx.moveTo(offsetX, 10);
        for (let t = 0; t < 40; t += 2) {
            const waveX = Math.sin(t * 0.2 + i) * 3;
            ctx.lineTo(offsetX + waveX, 10 + t);
        }
        ctx.stroke();
    }
    
    ctx.restore();
}

// Draw ethereal jellyfish
drawJellyfish(180, 200, 1.2, '#a8e6cf', '#7fdbda');
drawJellyfish(620, 180, 1.0, '#ff8b94', '#ffaaa5');
drawJellyfish(150, 400, 0.9, '#c7ceea', '#b4a7d6');
drawJellyfish(650, 350, 1.1, '#ffd3b6', '#ffaaa5');
drawJellyfish(250, 120, 0.7, '#dcedc1', '#aed581');
drawJellyfish(550, 130, 0.8, '#ffd3b6', '#ff8b94');

// Sea anemones on floor
function drawAnemone(x, y, size, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    
    for (let i = 0; i < 8; i++) {
        const angle = -Math.PI/2 + (i - 3.5) * 0.25;
        const length = size * (0.7 + Math.random() * 0.5);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
            x + Math.cos(angle + 0.1) * length * 0.6,
            y + Math.sin(angle) * length * 0.6,
            x + Math.cos(angle) * length,
            y + Math.sin(angle) * length
        );
        ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
}

// Add sea anemones
for (let i = 0; i < 20; i++) {
    const x = 180 + Math.random() * 440;
    const y = 520 + Math.random() * 60;
    const colors = ['#ff00ff', '#00ffff', '#ff1493', '#7fff00', '#ff4500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    drawAnemone(x, y, 15 + Math.random() * 20, color);
}

// Bioluminescent particles
for (let i = 0; i < 100; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 600;
    const size = Math.random() * 2;
    const opacity = Math.random() * 0.8;
    const colors = ['#00ffff', '#ff6b9d', '#feca57', '#48dbfb', '#ff9ff3'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
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

// Foreground seaweed
function drawSeaweed(x, y, height, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let t = 0; t < height; t += 5) {
        const wave = Math.sin(t * 0.05) * 15;
        ctx.lineTo(x + wave, y - t);
    }
    ctx.stroke();
    
    ctx.shadowBlur = 0;
}

// Foreground seaweed fronds
drawSeaweed(80, 600, 150, '#2ecc71');
drawSeaweed(100, 600, 120, '#27ae60');
drawSeaweed(720, 600, 180, '#2ecc71');
drawSeaweed(750, 600, 140, '#1abc9c');

// Deep water vignette
const vignette = ctx.createRadialGradient(400, 300, 200, 400, 300, 500);
vignette.addColorStop(0, 'transparent');
vignette.addColorStop(1, 'rgba(2, 6, 23, 0.7)');
ctx.fillStyle = vignette;
ctx.fillRect(0, 0, 800, 600);

// Signature
ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
ctx.font = 'italic 14px serif';
ctx.textAlign = 'right';
ctx.fillText('Ash — Bioluminescent Cathedral', 780, 580);

// Save
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('/data/workspace/generative-art/bioluminescent-cathedral-ash.png', buffer);
console.log('Generated: bioluminescent-cathedral-ash.png');
