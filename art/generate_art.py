from PIL import Image, ImageDraw, ImageFilter
import math
import random

# Canvas setup
WIDTH, HEIGHT = 1200, 800
img = Image.new('RGB', (WIDTH, HEIGHT), '#0a0a1a')
draw = ImageDraw.Draw(img)

# Create gradient background
for y in range(HEIGHT):
    progress = y / HEIGHT
    r = int(10 + (26 - 10) * progress)
    g = int(10 + (16 - 10) * progress * 0.5)
    b = int(26 + (37 - 26) * progress)
    draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

# Soft orbs/orbs
orbs = [
    {'x': 200, 'y': 300, 'r': 150, 'color': (100, 149, 237, 40)},
    {'x': 900, 'y': 500, 'r': 200, 'color': (138, 43, 226, 35)},
    {'x': 600, 'y': 200, 'r': 120, 'color': (255, 105, 180, 25)},
    {'x': 400, 'y': 600, 'r': 180, 'color': (64, 224, 208, 35)},
]

# Draw soft orbs with blur effect
for orb in orbs:
    orb_img = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    orb_draw = ImageDraw.Draw(orb_img)
    for r in range(orb['r'], 0, -5):
        alpha = int(orb['color'][3] * (1 - r/orb['r']))
        orb_draw.ellipse(
            [orb['x'] - r, orb['y'] - r, orb['x'] + r, orb['y'] + r],
            fill=(orb['color'][0], orb['color'][1], orb['color'][2], max(0, alpha))
        )
    img = Image.alpha_composite(img.convert('RGBA'), orb_img).convert('RGB')
    draw = ImageDraw.Draw(img)

# Color palette for particles
colors = [
    (100, 149, 237),   # cornflower blue
    (138, 43, 226),    # blue violet
    (255, 105, 180),   # hot pink
    (64, 224, 208),    # turquoise
    (255, 165, 0),     # orange
    (147, 112, 219),   # medium purple
]

# Generate particles with positions
center_x, center_y = WIDTH // 2, HEIGHT // 2
particles = []
random.seed(42)  # For reproducible art

for _ in range(350):
    # Create spiral galaxy distribution
    angle = random.uniform(0, math.pi * 4)
    arm = random.choice([0, 2.09, 4.18])  # 3 spiral arms
    distance = random.gauss(200, 150)
    distance = max(50, min(distance, 450))
    
    x = center_x + math.cos(angle + arm) * distance + random.gauss(0, 30)
    y = center_y + math.sin(angle + arm) * distance * 0.6 + random.gauss(0, 30)
    
    # Keep within bounds
    x = max(50, min(x, WIDTH - 50))
    y = max(50, min(y, HEIGHT - 50))
    
    size = random.uniform(1, 3.5)
    color = random.choice(colors)
    opacity = random.uniform(0.4, 0.9)
    particles.append({'x': x, 'y': y, 'size': size, 'color': color, 'opacity': opacity})

# Draw constellation connections
for i, p1 in enumerate(particles):
    connections = 0
    for p2 in particles[i+1:]:
        if connections >= 2:
            break
        dx = p1['x'] - p2['x']
        dy = p1['y'] - p2['y']
        dist = math.sqrt(dx*dx + dy*dy)
        if dist < 60:
            alpha = int(60 * (1 - dist/60))
            draw.line(
                [(p1['x'], p1['y']), (p2['x'], p2['y'])],
                fill=(100, 149, 237, alpha),
                width=1
            )
            connections += 1

# Draw particles
for p in particles:
    r, g, b = p['color']
    alpha = int(255 * p['opacity'])
    # Draw soft glow
    for glow in [3, 2, 1]:
        ga = int(alpha * (0.15 if glow == 3 else 0.3 if glow == 2 else 0.6))
        draw.ellipse(
            [p['x'] - p['size'] - glow, p['y'] - p['size'] - glow,
             p['x'] + p['size'] + glow, p['y'] + p['size'] + glow],
            fill=(r, g, b, ga)
        )
    # Draw core
    draw.ellipse(
        [p['x'] - p['size'], p['y'] - p['size'],
         p['x'] + p['size'], p['y'] + p['size']],
        fill=(min(255, r+40), min(255, g+40), min(255, b+40))
    )

# Add title
img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
draw = ImageDraw.Draw(img)

# Title text
draw.text((WIDTH - 40, HEIGHT - 50), '"Celestial Drift"', 
          fill=(255, 255, 255, 150), anchor='rs')
draw.text((WIDTH - 40, HEIGHT - 30), 'Ash · Feb 21, 2026', 
          fill=(255, 255, 255, 80), anchor='rs')

# Save
img.save('/data/workspace/art/daily_2026-02-21.png', 'PNG')
print("Art saved successfully!")
