from PIL import Image, ImageDraw, ImageFilter
import random
import math
import os

# Create directory if needed
os.makedirs('/data/workspace/art', exist_ok=True)

# Canvas size
width, height = 1200, 800

# Create base image with dark background
img = Image.new('RGB', (width, height), '#050510')
draw = ImageDraw.Draw(img)

# Create radial gradient background
for y in range(height):
    for x in range(0, width, 4):  # Sample every 4 pixels for speed
        dx = x - 600
        dy = y - 400
        dist = math.sqrt(dx*dx + dy*dy) / 700
        dist = min(1.0, dist)
        r = int(26 - 21 * dist)
        g = int(26 - 21 * dist)
        b = int(62 - 52 * dist)
        draw.rectangle([x, y, x+3, y], fill=(r, g, b))

# Star field
for _ in range(200):
    x = random.randint(0, width)
    y = random.randint(0, height)
    size = random.uniform(0.5, 2)
    opacity = random.uniform(100, 255)
    draw.ellipse([x-size, y-size, x+size, y+size], fill=(255, 255, 255, int(opacity)))

# Constellation nodes forming abstract face profile
nodes = [
    # Forehead
    (400, 200, 8, (100, 216, 255)),
    (450, 180, 6, (100, 216, 255)),
    (500, 170, 7, (141, 224, 255)),
    # Eye region
    (380, 280, 10, (255, 107, 157)),
    (420, 290, 5, (255, 143, 171)),
    (350, 270, 6, (255, 194, 209)),
    # Nose bridge
    (460, 320, 7, (255, 209, 102)),
    (480, 360, 5, (255, 232, 173)),
    # Cheek/Mouth area
    (420, 400, 8, (6, 214, 160)),
    (380, 420, 6, (10, 218, 181)),
    (340, 410, 5, (142, 252, 230)),
    # Chin/Jaw
    (300, 480, 7, (167, 139, 250)),
    (350, 500, 6, (196, 181, 253)),
    (400, 520, 8, (221, 214, 254)),
    # Ear
    (280, 350, 5, (244, 114, 182)),
    (260, 380, 4, (249, 168, 212)),
    # Hair/Top flowing nodes
    (550, 220, 6, (56, 189, 248)),
    (600, 250, 5, (125, 211, 252)),
    (580, 300, 7, (186, 230, 253)),
    (520, 350, 6, (224, 242, 254)),
    # Neck/Shoulder area
    (320, 550, 6, (251, 146, 60)),
    (280, 580, 5, (253, 186, 116)),
    # Background accent nodes
    (700, 400, 4, (165, 243, 252)),
    (750, 350, 3, (207, 250, 254)),
    (800, 450, 5, (103, 232, 249)),
    (200, 600, 4, (240, 171, 252)),
    (900, 200, 3, (196, 181, 253)),
]

# Draw connections between nearby nodes
for i in range(len(nodes)):
    for j in range(i + 1, len(nodes)):
        x1, y1, _, c1 = nodes[i]
        x2, y2, _, c2 = nodes[j]
        dist = math.sqrt((x1-x2)**2 + (y1-y2)**2)
        if dist < 180:
            alpha = int(255 * (1 - dist/180) * 0.3)
            draw.line([(x1, y1), (x2, y2)], fill=(100, 216, 255, alpha), width=1)

# Draw nodes with glow effect
def draw_glow(draw, x, y, size, color):
    # Outer glow
    for r in range(size*4, size, -2):
        alpha = int(128 * (1 - (r-size)/(size*3)) * 0.3)
        glow_color = (color[0], color[1], color[2])
        draw.ellipse([x-r, y-r, x+r, y+r], outline=glow_color)
    # Core
    draw.ellipse([x-size, y-size, x+size, y+size], fill=color)

for x, y, size, color in nodes:
    draw_glow(draw, x, y, size, color)

# Add flowing particle trails
for _ in range(30):
    start_x = 200 + random.randint(0, 800)
    start_y = 100 + random.randint(0, 600)
    alpha = int((0.1 + random.random() * 0.2) * 255)
    points = [(start_x, start_y)]
    cx, cy = start_x, start_y
    for _ in range(5):
        cx += (random.random() - 0.5) * 100
        cy += (random.random() - 0.5) * 100
        points.append((cx, cy))
    if len(points) > 1:
        draw.line(points, fill=(100, 216, 255, alpha), width=1)

# Save the image
output_path = '/data/workspace/art/daily_2026-02-19.png'
img.save(output_path, 'PNG')
print(f"Art saved to: {output_path}")