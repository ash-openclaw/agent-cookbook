from PIL import Image, ImageDraw
import random
import math
import os

# Seed for reproducibility
random.seed(20260223)

# Canvas settings
WIDTH, HEIGHT = 1200, 1200
BG_COLOR = (15, 10, 25)

def generate_constellation_portrait():
    """Generate a constellation-style abstract portrait"""
    
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Generate nodes (stars/points) forming an abstract face structure
    nodes = []
    
    # Face outline nodes (ellipse-like distribution)
    center_x, center_y = WIDTH // 2, HEIGHT // 2
    face_radius_x, face_radius_y = 350, 420
    
    # Outer face contour nodes
    for i in range(40):
        angle = (i / 40) * 2 * math.pi
        # Add some organic irregularity
        r_var = random.uniform(0.9, 1.1)
        x = center_x + face_radius_x * r_var * math.cos(angle) + random.uniform(-20, 20)
        y = center_y + face_radius_y * r_var * math.sin(angle) + random.uniform(-20, 20)
        brightness = random.uniform(180, 255)
        size = random.uniform(2, 6)
        nodes.append((x, y, brightness, size, 'face'))
    
    # Eye nodes (two clusters)
    for eye_offset in [-120, 120]:
        eye_x = center_x + eye_offset
        eye_y = center_y - 80
        for i in range(25):
            angle = random.uniform(0, 2 * math.pi)
            r = random.uniform(0, 50)
            x = eye_x + r * math.cos(angle)
            y = eye_y + r * math.sin(angle) * 0.6
            brightness = random.uniform(200, 255) if r < 20 else random.uniform(100, 180)
            size = random.uniform(1.5, 5) if r < 20 else random.uniform(1, 3)
            nodes.append((x, y, brightness, size, 'eye'))
    
    # Nose nodes
    nose_x, nose_y = center_x, center_y + 40
    for i in range(20):
        angle = random.uniform(-math.pi/3, math.pi/3)
        r = random.uniform(0, 80)
        x = nose_x + r * math.sin(angle) * 0.4
        y = nose_y + r * math.cos(angle) * 0.8
        brightness = random.uniform(120, 200)
        size = random.uniform(1.5, 4)
        nodes.append((x, y, brightness, size, 'nose'))
    
    # Mouth nodes
    mouth_y = center_y + 180
    for i in range(30):
        t = i / 29
        x = center_x + (t - 0.5) * 180 + random.uniform(-10, 10)
        y = mouth_y + 15 * math.sin(t * math.pi) + random.uniform(-8, 8)
        brightness = random.uniform(150, 230)
        size = random.uniform(2, 5)
        nodes.append((x, y, brightness, size, 'mouth'))
    
    # Hair/flow nodes (flowing outward from top)
    for i in range(60):
        angle = random.uniform(-math.pi * 0.8, -math.pi * 0.2)
        r = random.uniform(380, 550)
        x = center_x + r * math.cos(angle) + random.uniform(-30, 30)
        y = center_y - 100 + r * math.sin(angle) * 0.5 + random.uniform(-30, 30)
        brightness = random.uniform(100, 220)
        size = random.uniform(1, 4)
        nodes.append((x, y, brightness, size, 'hair'))
    
    # Background stars
    for i in range(150):
        x = random.uniform(0, WIDTH)
        y = random.uniform(0, HEIGHT)
        brightness = random.uniform(40, 120)
        size = random.uniform(0.5, 2)
        nodes.append((x, y, brightness, size, 'bg'))
    
    # Draw connections between nearby nodes (constellation effect)
    def get_color(brightness, node_type):
        if node_type == 'eye':
            return (int(brightness), int(brightness * 0.9), int(brightness * 0.7))
        elif node_type == 'hair':
            return (int(brightness * 0.8), int(brightness * 0.9), int(brightness))
        elif node_type == 'mouth':
            return (int(brightness), int(brightness * 0.7), int(brightness * 0.8))
        elif node_type == 'bg':
            return (int(brightness * 0.8), int(brightness * 0.9), int(brightness))
        else:
            return (int(brightness), int(brightness * 0.95), int(brightness * 0.9))
    
    # Draw connections first (behind nodes)
    for i, (x1, y1, b1, s1, t1) in enumerate(nodes):
        connections = 0
        for j, (x2, y2, b2, s2, t2) in enumerate(nodes[i+1:], i+1):
            dist = math.sqrt((x1-x2)**2 + (y1-y2)**2)
            if dist < 80 and connections < 3:
                if t1 == t2 or (t1 in ['face', 'eye', 'nose', 'mouth'] and t2 in ['face', 'eye', 'nose', 'mouth']):
                    alpha = int(255 * (1 - dist/80) * 0.4)
                    color = get_color(min(b1, b2) * 0.7, t1)
                    draw.line([(x1, y1), (x2, y2)], fill=color, width=1)
                    connections += 1
    
    # Draw nodes (stars)
    for x, y, brightness, size, node_type in nodes:
        color = get_color(brightness, node_type)
        # Draw glow
        glow_size = size * 3
        for g in range(int(glow_size), 0, -1):
            alpha = int(30 * (1 - g/glow_size))
            glow_color = tuple(min(255, c + alpha) for c in color)
            draw.ellipse([x-g, y-g, x+g, y+g], fill=glow_color)
        # Draw core
        draw.ellipse([x-size, y-size, x+size, y+size], fill=color)
    
    return img

# Generate the art
art = generate_constellation_portrait()

# Save the image
output_path = '/data/workspace/art/daily_2026-02-23.png'
art.save(output_path, 'PNG', quality=95)
print(f"Art saved to: {output_path}")
print(f"Image size: {art.size}")
