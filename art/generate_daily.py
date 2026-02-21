#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import math
import random

# Canvas dimensions
WIDTH, HEIGHT = 1200, 800

# Create image with gradient background
img = Image.new('RGB', (WIDTH, HEIGHT))
draw = ImageDraw.Draw(img)

# Create deep space gradient background
for y in range(HEIGHT):
    for x in range(0, WIDTH, 2):  # Skip every other pixel for speed
        t = y / HEIGHT
        r = int(10 + t * 10)
        g = int(10 + t * 15)
        b = int(18 + t * 10)
        draw.point((x, y), fill=(r, g, b))

# Particle class
class Particle:
    def __init__(self, x, y, hue):
        self.x = x
        self.y = y
        self.vx = 0
        self.vy = 0
        self.hue = hue
        self.life = 1.0
        self.decay = 0.003 + random.random() * 0.005
        self.trail = []
        self.max_trail = 20 + int(random.random() * 30)
        
    def update(self, noise_x, noise_y):
        self.vx += noise_x * 0.2
        self.vy += noise_y * 0.2
        self.vx *= 0.95
        self.vy *= 0.95
        self.x += self.vx
        self.y += self.vy
        self.trail.append((self.x, self.y, self.life))
        if len(self.trail) > self.max_trail:
            self.trail.pop(0)
        self.life -= self.decay

def noise(x, y, t):
    scale = 0.008
    return math.sin(x * scale + t) * math.cos(y * scale + t * 0.5) * math.sin((x + y) * scale * 0.5)

def hsl_to_rgb(h, s, l):
    h /= 360
    s /= 100
    l /= 100
    
    def hue_to_rgb(p, q, t):
        if t < 0: t += 1
        if t > 1: t -= 1
        if t < 1/6: return p + (q - p) * 6 * t
        if t < 1/2: return q
        if t < 2/3: return p + (q - p) * (2/3 - t) * 6
        return p
    
    if s == 0:
        r = g = b = l
    else:
        q = l * (1 + s) if l < 0.5 else l + s - l * s
        p = 2 * l - q
        r = hue_to_rgb(p, q, h + 1/3)
        g = hue_to_rgb(p, q, h)
        b = hue_to_rgb(p, q, h - 1/3)
    
    return int(r * 255), int(g * 255), int(b * 255)

# Set up emitters
emitters = []
for i in range(5):
    emitters.append({
        'x': 200 + i * 200 + (random.random() - 0.5) * 100,
        'y': 200 + random.random() * 400,
        'hue': 180 + i * 30 + random.random() * 40,
        't': random.random() * math.pi * 2
    })

particles = []
time = 0

# Create overlay for trails with alpha
overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
overlay_draw = ImageDraw.Draw(overlay)

# Simulate animation
for frame in range(400):
    time += 0.02
    
    # Emit particles
    for emitter in emitters:
        emitter['t'] += 0.02
        if frame % 3 == 0 and random.random() > 0.3:
            count = 2 + int(random.random() * 3)
            for _ in range(count):
                hue = emitter['hue'] + random.random() * 20 - 10
                particles.append(Particle(emitter['x'], emitter['y'], hue))
    
    # Update particles
    i = len(particles) - 1
    while i >= 0:
        p = particles[i]
        noise_x = noise(p.x, p.y, time)
        noise_y = noise(p.x + 1000, p.y + 1000, time)
        p.update(noise_x, noise_y)
        
        # Draw trail
        if len(p.trail) > 1:
            for j in range(1, len(p.trail)):
                curr = p.trail[j]
                prev = p.trail[j-1]
                alpha = max(0, min(255, int(curr[2] * 0.4 * 100)))
                lightness = 40 + curr[2] * 30
                rgb = hsl_to_rgb(p.hue, 70, lightness)
                color = (*rgb, alpha)
                width = int(1.5 * curr[2] + 0.5)
                
                # Draw line segment
                if width > 0:
                    overlay_draw.line([(prev[0], prev[1]), (curr[0], curr[1])], 
                                    fill=color, width=width)
        
        # Remove dead particles
        if p.life <= 0 or p.x < -50 or p.x > WIDTH + 50 or p.y < -50 or p.y > HEIGHT + 50:
            particles.pop(i)
        i -= 1

# Add glow orbs to overlay
for i in range(8):
    x = 150 + (i * 140) + random.random() * 40
    y = 150 + random.random() * 500
    radius = 30 + random.random() * 40
    hue = 160 + i * 25
    rgb = hsl_to_rgb(hue, 80, 60)
    
    # Draw soft glow
    for r in range(int(radius), 0, -2):
        alpha = int(80 * (1 - r/radius) * 0.3)
        overlay_draw.ellipse([x-r, y-r, x+r, y+r], fill=(*rgb, alpha))

# Composite overlay onto base image
img = img.convert('RGBA')
img = Image.alpha_composite(img, overlay)
img = img.convert('RGB')

# Add text
from PIL import ImageFont
draw = ImageDraw.Draw(img)
# Use default font
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 14)
except:
    font = ImageFont.load_default()

draw.text((1120, 770), "Ash → Discord Art Battle", fill=(200, 200, 200), font=font)

# Save image
img.save('/data/workspace/art/daily_2026-02-20.png', 'PNG', quality=95)
print("Generated: /data/workspace/art/daily_2026-02-20.png")
