#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import random

# Canvas dimensions
WIDTH, HEIGHT = 1200, 800

# Create image with gradient background
img = Image.new('RGB', (WIDTH, HEIGHT), (10, 10, 20))

# Create overlay for drawing particles
overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))

# Draw gradient background
for y in range(HEIGHT):
    t = y / HEIGHT
    r = int(10 + t * 8)
    g = int(10 + t * 12)
    b = int(18 + t * 8)
    draw_bg = ImageDraw.Draw(img)
    draw_bg.line([(0, y), (WIDTH, y)], fill=(r, g, b))

def noise(x, y, t):
    scale = 0.012
    s = math.sin(x * scale + t) * 0.7
    c = math.cos(y * scale + t * 0.5) * 0.7
    m = math.sin((x + y) * scale * 0.3 + t * 0.3) * 0.5
    return s + c + m

def hsv_to_rgb(h, s, v):
    h = h % 360
    c = v * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = v - c
    
    if h < 60:
        r, g, b = c, x, 0
    elif h < 120:
        r, g, b = x, c, 0
    elif h < 180:
        r, g, b = 0, c, x
    elif h < 240:
        r, g, b = 0, x, c
    elif h < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x
    
    return int((r + m) * 255), int((g + m) * 255), int((b + m) * 255)

draw = ImageDraw.Draw(overlay)

# Create multiple flowing curves using particle trails
num_fibers = 80

for fiber in range(num_fibers):
    # Random starting position and color
    x = random.randint(100, WIDTH - 100)
    y = random.randint(50, HEIGHT - 50)
    hue = random.uniform(160, 280)  # Cyan to purple range
    
    # Velocity
    vx = random.uniform(-0.5, 0.5)
    vy = random.uniform(-0.5, 0.5)
    
    # Trail points
    trail = [(x, y)]
    
    # Generate the flow line
    t = random.uniform(0, 1000)
    for step in range(150):
        t += 0.03
        n_x = noise(x, y, t)
        n_y = noise(x + 500, y + 500, t)
        
        vx += n_x * 0.15
        vy += n_y * 0.15
        vx *= 0.94
        vy *= 0.94
        
        x += vx
        y += vy
        
        if x < 0 or x > WIDTH or y < 0 or y > HEIGHT:
            break
            
        trail.append((x, y))
    
    # Draw the trail with varying opacity and color along the path
    if len(trail) > 3:
        for i in range(1, len(trail)):
            progress = i / len(trail)
            life = 1.0 - progress * 0.7  # Fade slightly toward end
            
            # Color shifts along the trail
            local_hue = (hue + progress * 40) % 360
            rgb = hsv_to_rgb(local_hue, 0.75, 0.6 + life * 0.3)
            alpha_int = int(life * 90)
            
            x1, y1 = trail[i-1]
            x2, y2 = trail[i]
            
            # Vary width based on progress
            width = max(1, int(2 * life + 0.5))
            draw.line([(x1, y1), (x2, y2)], fill=(*rgb, alpha_int), width=width)

# Add glowing nodes at intersections
for i in range(12):
    x = random.uniform(150, WIDTH - 150)
    y = random.uniform(100, HEIGHT - 100)
    radius = random.uniform(20, 45)
    hue = random.uniform(140, 260)
    
    # Draw concentric glow circles
    for r in range(int(radius), 0, -3):
        alpha = int(50 * (1 - r/radius) * 0.25)
        rgb = hsv_to_rgb(hue, 0.8, 0.8)
        draw.ellipse([x-r, y-r, x+r, y+r], fill=(*rgb, alpha))

# Add subtle larger wave patterns in background
for wave in range(15):
    y_base = HEIGHT * (wave / 15)
    hue = 200 + wave * 5
    points = []
    
    for x in range(0, WIDTH + 50, 20):
        t = x * 0.01 + wave * 0.5
        y = y_base + math.sin(t) * 30
        points.append((x, y))
    
    if len(points) > 1:
        for i in range(1, len(points)):
            rgb = hsv_to_rgb(hue, 0.5, 0.35)
            draw.line([points[i-1], points[i]], fill=(*rgb, 15), width=2)

# Composite overlay onto base using screen blending
img = img.convert('RGBA')
result = Image.new('RGBA', (WIDTH, HEIGHT))

# Manual screen blend
img_data = img.getdata()
overlay_data = overlay.getdata()
result_data = []

for i in range(len(img_data)):
    base = img_data[i]
    top = overlay_data[i]
    
    # Screen blend formula
    r = 255 - ((255 - base[0]) * (255 - top[0]) // 255)
    g = 255 - ((255 - base[1]) * (255 - top[1]) // 255)
    b = 255 - ((255 - base[2]) * (255 - top[2]) // 255)
    a = min(255, base[3] + top[3])
    
    result_data.append((r, g, b, a))

result.putdata(result_data)
result = result.convert('RGB')

# Add text
final_draw = ImageDraw.Draw(result)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf", 14)
except:
    font = ImageFont.load_default()

final_draw.text((1060, 770), "Ash → Discord Art Battle", fill=(180, 180, 180), font=font)

# Save with high quality
result.save('/data/workspace/art/daily_2026-02-20.png', 'PNG')
print("Generated: /data/workspace/art/daily_2026-02-20.png")
