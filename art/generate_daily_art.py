#!/usr/bin/env python3
"""Daily generative art - February 22, 2026 - Nature: Flowing Grass Winds"""

import random
import math
from PIL import Image, ImageDraw

# Canvas setup
WIDTH, HEIGHT = 1024, 1024
BG_TOP = (15, 0, 32)      # Deep purple 
BG_BOTTOM = (45, 12, 68)  # Muted violet

# Warm sunset gradient overlay
SUNSET_TOP = (255, 94, 77)     # Coral
SUNSET_BOTTOM = (255, 206, 84)  # Amber

# Grass blade colors (gradient from warm to cool)
GRASS_COLORS = [
    (255, 200, 100, 180),   # Sunrise gold
    (200, 220, 100, 160),   # Spring green
    (100, 180, 120, 140),   # Soft green  
    (80, 140, 130, 120),    # Teal tint
    (60, 100, 140, 100),    # Blue shadow
]

def lerp_color(c1, c2, t):
    """Linear interpolate between two colors"""
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))

def create_background():
    """Create gradient background"""
    img = Image.new('RGB', (WIDTH, HEIGHT))
    pixels = img.load()
    
    for y in range(HEIGHT):
        t = y / HEIGHT
        # Blend deep purple with sunset
        bg = lerp_color(BG_TOP, BG_BOTTOM, t)
        sunset = lerp_color(SUNSET_TOP, SUNSET_BOTTOM, t)
        # Sunset overlay at 30% opacity
        color = lerp_color(bg, sunset, 0.35)
        for x in range(WIDTH):
            pixels[x, y] = color
    
    return img

def noise(x, y, z=0):
    """Simple Perlin-like noise for natural movement"""
    return math.sin(x * 0.01 + z) * math.cos(y * 0.01 + z * 0.5) * 0.5 + 0.5

def create_grass_blade(draw, x, y, height, bend_factor, color, seed):
    """Draw a single grass blade with flowing motion"""
    random.seed(seed)
    
    # Base position (slight jitter for natural feel)
    base_x = x + random.uniform(-3, 3)
    base_y = y
    
    # Calculate tip position with wind effect
    wind = noise(x * 0.5, seed, 0)
    tip_x = base_x + bend_factor * height * 0.3 + wind * 20
    tip_y = base_y - height
    
    # Control points for bezier curve (adds natural sway)
    mid_x = base_x + bend_factor * height * 0.15 + wind * 10
    mid_y = base_y - height * 0.6
    
    # Grass blade width tapers from base to tip
    base_width = max(2, height * 0.04)
    mid_width = max(1.5, height * 0.025)
    tip_width = 0.5
    
    # Draw the blade as a filled polygon
    # Left edge points
    p1 = (base_x - base_width, base_y)  # Base left
    p2 = (mid_x - mid_width, mid_y)     # Mid left
    p3 = (tip_x, tip_y)                  # Tip
    
    # Right edge points
    p4 = (mid_x + mid_width, mid_y)     # Mid right
    p5 = (base_x + base_width, base_y)  # Base right
    
    # Smooth curve using quadratic bezier approx
    points_left = []
    points_right = []
    
    for t in range(0, 101, 5):
        t = t / 100
        # Quadratic bezier for left edge
        lx = (1-t)**2 * (base_x - base_width) + 2*(1-t)*t * (mid_x - mid_width) + t**2 * tip_x
        ly = (1-t)**2 * base_y + 2*(1-t)*t * mid_y + t**2 * tip_y
        
        # Slight outward curve for width
        offset = abs(t - 0.5) * 2 * 1.2
        
        points_left.append((lx, ly))
        
        # Quadratic bezier for right edge
        rx = (1-t)**2 * (base_x + base_width) + 2*(1-t)*t * (mid_x + mid_width) + t**2 * tip_x
        ry = ly  # Same height
        points_right.append((rx, ry))
    
    # Combine points (left goes up, right goes down reversed)
    all_points = points_left + points_right[::-1]
    
    draw.polygon(all_points, fill=color)
    
    # Add subtle highlight line
    highlight_color = (min(255, c + 30) for c in color[:3])
    highlight = tuple(min(255, c + 30) for c in color[:3]) + (color[3] if len(color) > 3 else 255,)
    
    # Draw center highlight as thin line
    mid_line = []
    for t in range(0, 101, 10):
        t = t / 100
        mx = (1-t)**2 * base_x + 2*(1-t)*t * mid_x + t**2 * tip_x
        my = (1-t)**2 * base_y + 2*(1-t)*t * mid_y + t**2 * tip_y
        mid_line.append((mx, my))
    
    for i in range(len(mid_line) - 1):
        draw.line([mid_line[i], mid_line[i+1]], fill=highlight[:3], width=1)

def generate_art():
    """Generate the full artwork"""
    # Create base
    img = create_background()
    draw = ImageDraw.Draw(img, 'RGBA')
    
    # Store grass layers to add z-depth
    grass_blades = []
    
    # Generate multiple layers of grass
    random.seed(41)  # Fixed seed for reproducibility
    
    num_blades = 400
    for layer in range(3):  # Back, mid, front layers
        layer_blades = []
        layer_y_start = HEIGHT - 100 + layer * 30
        layer_y_range = 150
        
        layer_seed = 41 + layer * 1000
        random.seed(layer_seed)
        
        blades_in_layer = num_blades // (layer + 1)
        
        for i in range(blades_in_layer):
            # Distribute grass across width
            x = random.uniform(50, WIDTH - 50)
            
            # Height varies based on position and layer
            y = random.uniform(layer_y_start, layer_y_start + layer_y_range)
            height = random.uniform(150, 400) * (1 - layer * 0.2)
            
            # Wind bending (more at top, increase with x for flow direction)
            bend = random.uniform(-0.5, 0.5) + (x / WIDTH - 0.5) * 0.8
            
            # Pick color based on height and layer
            color_index = min(len(GRASS_COLORS) - 1, 
                            int((1 - (y - layer_y_start) / layer_y_range) * len(GRASS_COLORS)))
            base_color = list(GRASS_COLORS[color_index])
            
            # Darken back layers
            alpha_factor = 0.6 if layer == 0 else (0.85 if layer == 1 else 1.0)
            base_color[3] = int(base_color[3] * alpha_factor)
            
            # Darken back layers slightly
            if layer == 0:
                base_color = [max(0, c - 20) for c in base_color]
            
            color = tuple(base_color)
            
            layer_blades.append({
                'x': x, 'y': y, 'height': height, 
                'bend': bend, 'color': color,
                'seed': layer_seed + i
            })
        
        grass_blades.append(layer_blades)
    
    # Draw back to front for depth
    for layer_blades in grass_blades:
        for blade in layer_blades:
            create_grass_blade(
                draw, 
                blade['x'], blade['y'], 
                blade['height'], blade['bend'],
                blade['color'],
                blade['seed']
            )
    
    # Add flowing particles/spores in the air
    random.seed(42)
    for _ in range(80):
        px = random.uniform(50, WIDTH - 50)
        py = random.uniform(100, HEIGHT - 200)
        
        # Create trailing particle
        trail_length = random.uniform(30, 80)
        wind_flow = noise(px * 0.5, py, 1)
        
        # Particle color (pale yellow/gold)
        particle_color = (255, 230, 150, random.randint(60, 140))
        
        # Draw trail
        for i in range(10):
            t = i / 10
            tx = px + wind_flow * trail_length * t + math.sin(py * 0.02 + t * 3) * 10
            ty = py - t * 5
            size = max(1, 4 - t * 2)
            
            alpha = int(particle_color[3] * (1 - t * 0.5))
            if alpha > 0:
                draw.ellipse(
                    [(tx - size, ty - size), (tx + size, ty + size)],
                    fill=(particle_color[0], particle_color[1], particle_color[2], alpha)
                )
    
    return img

if __name__ == "__main__":
    img = generate_art()
    output_path = "/data/workspace/art/daily_2026-02-22.png"
    img.save(output_path, "PNG", quality=95)
    print(f"Art saved to: {output_path}")
