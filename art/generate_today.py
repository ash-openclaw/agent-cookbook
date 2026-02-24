#!/usr/bin/env python3
"""
Generative Art: Constellation Dreams
A node-based abstract portrait with flowing particle connections
"""

from PIL import Image, ImageDraw
import random
import math

# Canvas settings
WIDTH = 1200
HEIGHT = 900
BG_COLOR = (10, 12, 25)  # Deep space blue-black

# Color palette
NODE_COLORS = [
    (255, 200, 100),   # Warm gold
    (100, 180, 255),   # Soft blue
    (255, 120, 150),   # Rose pink
    (150, 255, 180),   # Mint green
    (200, 150, 255),   # Lavender
    (255, 220, 120),   # Pale yellow
]

LINE_COLORS = [
    (255, 200, 100, 30),
    (100, 180, 255, 25),
    (255, 120, 150, 30),
    (150, 255, 180, 25),
]

def distance(p1, p2):
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def generate_nodes(center_x, center_y, radius, count):
    """Generate nodes in a cloud formation around a center point"""
    nodes = []
    for _ in range(count):
        angle = random.uniform(0, 2 * math.pi)
        dist = random.gauss(0, radius * 0.5)
        x = center_x + math.cos(angle) * abs(dist)
        y = center_y + math.sin(angle) * abs(dist) * 1.3  # Slightly elongated
        size = random.uniform(2, 8)
        color = random.choice(NODE_COLORS)
        nodes.append({
            'pos': (x, y),
            'size': size,
            'color': color,
            'brightness': random.uniform(0.4, 1.0)
        })
    return nodes

def draw_glow(draw, x, y, size, color, brightness):
    """Draw a glowing node with aura"""
    # Outer glow
    for i in range(5, 0, -1):
        alpha = int(20 * brightness / i)
        glow_color = (*color[:3], alpha)
        draw.ellipse(
            [x - size - i*2, y - size - i*2, 
             x + size + i*2, y + size + i*2],
            fill=glow_color
        )
    # Core
    core_color = tuple(min(255, int(c * brightness)) for c in color[:3])
    draw.ellipse(
        [x - size, y - size, x + size, y + size],
        fill=core_color
    )

def draw_connections(draw, nodes, max_dist=120):
    """Draw flowing connections between nearby nodes"""
    for i, n1 in enumerate(nodes):
        connections = 0
        for n2 in nodes[i+1:]:
            dist = distance(n1['pos'], n2['pos'])
            if dist < max_dist and connections < 4:
                opacity = int(60 * (1 - dist/max_dist))
                line_color = (*random.choice(LINE_COLORS)[:3], opacity)
                draw.line([n1['pos'], n2['pos']], fill=line_color, width=1)
                connections += 1

def main():
    random.seed(42)  # For reproducibility
    
    # Create image with alpha channel
    img = Image.new('RGBA', (WIDTH, HEIGHT), (*BG_COLOR, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw subtle background gradient
    for y in range(HEIGHT):
        progress = y / HEIGHT
        r = int(BG_COLOR[0] + progress * 5)
        g = int(BG_COLOR[1] + progress * 8)
        b = int(BG_COLOR[2] + progress * 15)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b, 255))
    
    # Generate abstract face structure (two eyes, nose area, mouth)
    all_nodes = []
    
    # Left eye cluster
    all_nodes.extend(generate_nodes(420, 320, 80, 35))
    
    # Right eye cluster  
    all_nodes.extend(generate_nodes(780, 320, 80, 35))
    
    # Nose bridge and tip
    all_nodes.extend(generate_nodes(600, 380, 50, 25))
    all_nodes.extend(generate_nodes(600, 480, 40, 20))
    
    # Forehead area
    all_nodes.extend(generate_nodes(600, 200, 120, 40))
    
    # Mouth/cheek area
    all_nodes.extend(generate_nodes(520, 580, 70, 30))
    all_nodes.extend(generate_nodes(680, 580, 70, 30))
    
    # Chin
    all_nodes.extend(generate_nodes(600, 700, 60, 25))
    
    # Hair/nebula wisps
    for _ in range(8):
        angle = random.uniform(0, 2 * math.pi)
        dist = random.uniform(200, 350)
        x = 600 + math.cos(angle) * dist
        y = 400 + math.sin(angle) * dist * 0.8
        all_nodes.extend(generate_nodes(x, y, random.uniform(40, 80), random.randint(15, 30)))
    
    # Draw connections first (behind nodes)
    draw_connections(draw, all_nodes, max_dist=100)
    
    # Draw stars in background
    for _ in range(200):
        x = random.randint(0, WIDTH)
        y = random.randint(0, HEIGHT)
        size = random.uniform(0.5, 2)
        brightness = random.uniform(0.2, 0.8)
        star_color = (255, 255, 255, int(100 * brightness))
        draw.ellipse([x-size, y-size, x+size, y+size], fill=star_color)
    
    # Draw nodes
    for node in all_nodes:
        draw_glow(draw, node['pos'][0], node['pos'][1], 
                  node['size'], node['color'], node['brightness'])
    
    # Add shooting star
    sx, sy = 900, 150
    for i in range(20):
        alpha = int(150 - i * 7)
        size = 2 - i * 0.08
        draw.ellipse([sx - i*8 - size, sy + i*3 - size, 
                      sx - i*8 + size, sy + i*3 + size],
                     fill=(255, 255, 255, max(0, alpha)))
    
    # Convert to RGB for saving
    final_img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    final_img.paste(img, mask=img.split()[3])
    
    # Save
    output_path = '/data/workspace/art/daily_2026-02-24.png'
    final_img.save(output_path, 'PNG', quality=95)
    print(f"Saved: {output_path}")

if __name__ == '__main__':
    main()
