from PIL import Image, ImageDraw
import math
import random

# Image dimensions
width, height = 1200, 800
img = Image.new('RGB', (width, height), (10, 10, 26))
draw = ImageDraw.Draw(img)

# Create gradient background
for y in range(height):
    r = int(10 + (y / height) * 16)
    g = int(10 + (y / height) * 5)
    b = int(26 + (y / height) * 30)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Generate flowing particle streams
random.seed(42)
particles = []
num_streams = 8

for s in range(num_streams):
    start_x = 200 + (s % 4) * 250
    start_y = 100 + (s // 4) * 500
    hue_base = 180 + s * 30
    
    for i in range(80):
        x = start_x + i * 3
        y = start_y + math.sin(i * 0.1) * 50 + random.gauss(0, 10)
        hue = hue_base + random.randint(-20, 20)
        size = 2 + random.random() * 4
        particles.append({
            'x': x, 'y': y, 'hue': hue, 'size': size,
            'stream': s, 'index': i
        })

# HSL to RGB converter
def hsl_to_rgb(h, s, l):
    h = h / 360
    s = s / 100
    l = l / 100
    
    def hue_to_rgb(p, q, t):
        t = t % 1
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
    
    return (int(r * 255), int(g * 255), int(b * 255))

# Draw connections (constellation effect)
for i, p1 in enumerate(particles):
    for p2 in particles[i+1:]:
        if p1['stream'] != p2['stream']:
            continue
        dx = p1['x'] - p2['x']
        dy = p1['y'] - p2['y']
        dist = math.sqrt(dx*dx + dy*dy)
        
        if dist < 100:
            alpha = int(40 * (1 - dist / 100))
            draw.line([(p1['x'], p1['y']), (p2['x'], p2['y'])], 
                     fill=(150, 180, 255, alpha), width=1)

# Draw particles with glow
for p in particles:
    x, y = p['x'], p['y']
    hue = p['hue']
    size = p['size']
    
    # Outer glow
    glow_size = size * 3
    for r in range(int(glow_size), 0, -1):
        alpha = int(30 * (r / glow_size))
        r_color = hsl_to_rgb(hue, 100, 70)
        draw.ellipse([x-r, y-r, x+r, y+r], 
                    fill=r_color + (alpha,))
    
    # Core
    core_color = hsl_to_rgb(hue, 80, 60)
    draw.ellipse([x-size, y-size, x+size, y+size], 
                fill=core_color)

# Central luminous orb (sun)
for r in range(150, 0, -1):
    t = r / 150
    if t < 0.3:
        color = (255, 220, 150)
    elif t < 0.7:
        color = (255, 180, 100)
    else:
        alpha = 1 - (t - 0.7) / 0.3
        color = (int(200 * alpha), int(100 * alpha), int(200 * alpha))
    
    draw.ellipse([600-r, 400-r, 600+r, 400+r], fill=color)

# Star field
for _ in range(200):
    x = random.randint(0, width)
    y = random.randint(0, height)
    size = random.random() * 2
    brightness = int(80 + random.random() * 175)
    draw.ellipse([x-size, y-size, x+size, y+size], 
                fill=(brightness, brightness, brightness))

# Save image
img.save('/data/workspace/art/daily_2026-02-28.png', 'PNG')
print("Art saved successfully!")
