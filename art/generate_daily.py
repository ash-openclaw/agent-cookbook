#!/usr/bin/env python3
"""Generative art: Flowing Nebula"""
from PIL import Image, ImageDraw
import random
import math

def generate_art():
    width, height = 800, 600
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # Background gradient
    for y in range(height):
        t = y / height
        r = int(10 + t * 5)
        g = int(10 + t * 25)
        b = int(18 + t * 10)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # Color palette
    palette = [
        (79, 172, 254), (0, 242, 254), (67, 233, 123), (56, 249, 215),
        (102, 126, 234), (118, 75, 162), (240, 147, 251), (245, 87, 108),
        (250, 112, 154), (254, 225, 64)
    ]
    
    # Flow field particles
    particles = []
    for _ in range(400):
        particles.append({
            'x': random.random() * width,
            'y': random.random() * height,
            'vx': 0,
            'vy': 0,
            'color': random.choice(palette),
            'size': random.random() * 2 + 0.5,
            'path': []
        })
    
    # Pre-warm particles
    for _ in range(100):
        for p in particles:
            scale = 0.003
            x = p['x'] * scale
            y = p['y'] * scale
            t = 0
            noise = math.sin(x * 2 + t) * math.cos(y * 2 + t) * math.sin(x * y * 0.5 + t)
            p['vx'] += math.cos(noise * math.pi * 2) * 0.3
            p['vy'] += math.sin(noise * math.pi * 2) * 0.3
            p['vx'] *= 0.98
            p['vy'] *= 0.98
            p['x'] += p['vx']
            p['y'] += p['vy']
            if p['x'] < 0: p['x'] = width
            if p['x'] > width: p['x'] = 0
            if p['y'] < 0: p['y'] = height
            if p['y'] > height: p['y'] = 0
    
    # Draw particle trails with varying opacity
    trail_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    trail_draw = ImageDraw.Draw(trail_img)
    
    for frame in range(150):
        for p in particles:
            scale = 0.003
            x = p['x'] * scale
            y = p['y'] * scale
            t = frame * 0.01
            noise = math.sin(x * 2 + t) * math.cos(y * 2 + t) * math.sin(x * y * 0.5 + t)
            p['vx'] += math.cos(noise * math.pi * 2) * 0.3
            p['vy'] += math.sin(noise * math.pi * 2) * 0.3
            p['vx'] *= 0.98
            p['vy'] *= 0.98
            p['x'] += p['vx']
            p['y'] += p['vy']
            if p['x'] < 0: p['x'] = width
            if p['x'] > width: p['x'] = 0
            if p['y'] < 0: p['y'] = height
            if p['y'] > height: p['y'] = 0
            
            alpha = int(40 + math.sin(frame * 0.1) * 30)
            c = p['color'] + (alpha,)
            sz = p['size']
            trail_draw.ellipse(
                [p['x'] - sz, p['y'] - sz, p['x'] + sz, p['y'] + sz],
                fill=c
            )
    
    # Composite trails
    img = img.convert('RGBA')
    img = Image.alpha_composite(img, trail_img)
    
    # Draw connection lines
    line_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    line_draw = ImageDraw.Draw(line_img)
    
    for i in range(len(particles)):
        p1 = particles[i]
        for j in range(i+1, min(i+30, len(particles))):
            p2 = particles[j]
            dx = p1['x'] - p2['x']
            dy = p1['y'] - p2['y']
            dist = math.sqrt(dx*dx + dy*dy)
            if dist < 80:
                alpha = int((1 - dist/80) * 25)
                line_draw.line([(p1['x'], p1['y']), (p2['x'], p2['y'])], 
                              fill=(150, 220, 255, alpha), width=1)
    
    img = Image.alpha_composite(img, line_img)
    
    # Add glowing orbs
    glow_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    
    orbs = [
        (200, 200, 100, (79, 172, 254)),
        (600, 400, 120, (245, 87, 108)),
        (400, 150, 80, (67, 233, 123)),
        (500, 500, 90, (250, 112, 154)),
        (150, 480, 70, (240, 147, 251)),
        (680, 180, 85, (0, 242, 254))
    ]
    
    for x, y, r, color in orbs:
        for i in range(r, 0, -3):
            alpha = int(50 * (1 - i/r))
            glow_draw.ellipse([x-i, y-i, x+i, y+i], fill=color + (alpha,))
    
    img = Image.alpha_composite(img, glow_img)
    
    # Add noise texture
    for _ in range(3000):
        x = random.randint(0, width-1)
        y = random.randint(0, height-1)
        v = random.randint(200, 255)
        img.putpixel((x, y), (v, v, v, 15))
    
    # Signature
    final = img.convert('RGB')
    draw = ImageDraw.Draw(final)
    draw.text((10, 580), 'Ash · 2026-02-12', fill=(180, 180, 200))
    
    return final

if __name__ == '__main__':
    art = generate_art()
    art.save('/data/workspace/art/daily_2026-02-12.png', 'PNG')
    print("Saved daily_2026-02-12.png")
