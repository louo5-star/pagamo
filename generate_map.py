# -*- coding: utf-8 -*-
"""
Generate map_data.json and map_preset.js for PaGamO Castle Conquest Simulator.
Axial coordinate system (flat-topped hexes):
q: column, r: row
Neighbors of (q, r):
[
  (q, r - 1), (q + 1, r - 1), (q + 1, r),
  (q, r + 1), (q - 1, r + 1), (q - 1, r)
]
"""
import json

def rotate_60(q, r):
    s = -q - r
    return (-r, -s)

def get_orbit(q, r):
    pts = []
    curr = (q, r)
    for _ in range(6):
        pts.append(curr)
        curr = rotate_60(curr[0], curr[1])
    return sorted(list(set(pts)))

# 7 Castles (100 pts)
castles = [(0, 0)] + get_orbit(0, -1)

# 12 Bunkers (80 pts)
bunkers = get_orbit(0, -3) + get_orbit(-2, -2)

# 24 Cannons (50 pts)
cannons = list(set(
    get_orbit(0, -5) +
    get_orbit(-2, -4) +
    get_orbit(-4, -2) +
    get_orbit(-3, -3)
))
# Ensure exactly 24
if len(cannons) < 24:
    cannons += get_orbit(-6, 3)
cannons = sorted(list(set(cannons)))[:24]

# 6 Islands (distance 8)
island_centers = [
    (0, -8),  # Top-center
    (8, -8),  # Top-right
    (8, 0),   # Bottom-right
    (0, 8),   # Bottom-center
    (-8, 8),  # Bottom-left
    (-8, 0)   # Top-left
]

islands = []
all_island_hexes = set()
for idx, (cq, cr) in enumerate(island_centers):
    hexes = [(cq, cr)] + [(cq + dq, cr + dr) for dq, dr in [
        (0, -1), (1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0)
    ]]
    islands.append({
        "id": idx,
        "name": f"起始島嶼 {idx+1}",
        "center": [cq, cr],
        "hexes": hexes
    })
    for h in hexes:
        all_island_hexes.add(h)

arena_tiles = {}

def hex_dist(q1, r1, q2=0, r2=0):
    return (abs(q1 - q2) + abs(q1 + r1 - q2 - r2) + abs(r1 - r2)) // 2

# Add special tiles
for q, r in castles:
    k = f"{q},{r}"
    arena_tiles[k] = {"q": q, "r": r, "type": "castle", "points": 100}

for q, r in bunkers:
    k = f"{q},{r}"
    arena_tiles[k] = {"q": q, "r": r, "type": "bunker", "points": 80}

for q, r in cannons:
    k = f"{q},{r}"
    arena_tiles[k] = {"q": q, "r": r, "type": "cannon", "points": 50}

# Add island hexes
for idx, isl in enumerate(islands):
    for q, r in isl["hexes"]:
        k = f"{q},{r}"
        arena_tiles[k] = {"q": q, "r": r, "type": "island", "points": 3, "island_id": idx}

# Add water hexes that connect the arena
for q in range(-9, 10):
    for r in range(-9, 10):
        if hex_dist(q, r) <= 9:
            k = f"{q},{r}"
            if k not in arena_tiles:
                arena_tiles[k] = {"q": q, "r": r, "type": "water", "points": 3}

# Compute adjacency neighbors for each tile
directions = [(0, -1), (1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0)]
for k, tile in arena_tiles.items():
    q, r = tile["q"], tile["r"]
    neighbors = []
    for dq, dr in directions:
        nk = f"{q+dq},{r+dr}"
        if nk in arena_tiles:
            neighbors.append(nk)
    tile["neighbors"] = neighbors

map_data = {
    "grid_config": {
        "hex_radius": 31.66,
        "dx": 47.49,
        "dy": 54.84,
        "origin_x": 678,
        "origin_y": 472
    },
    "counts": {
        "castles": len(castles),
        "bunkers": len(bunkers),
        "cannons": len(cannons),
        "islands": len(islands),
        "total_tiles": len(arena_tiles)
    },
    "islands": islands,
    "tiles": arena_tiles
}

with open("map_data.json", "w", encoding="utf-8") as f:
    json.dump(map_data, f, ensure_ascii=False, indent=2)

with open("map_preset.js", "w", encoding="utf-8") as f:
    f.write(f"window.MAP_PRESET = {json.dumps(map_data, ensure_ascii=False)};")

print("Original map generated successfully:")
print(f"- Castles: {len(castles)}")
print(f"- Bunkers: {len(bunkers)}")
print(f"- Cannons: {len(cannons)}")
print(f"- Islands: {len(islands)}")
print(f"- Total arena tiles: {len(arena_tiles)}")
