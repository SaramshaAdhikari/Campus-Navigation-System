import json
from math import radians, sin, cos, sqrt, atan2

def haversine_distance(coord1, coord2):
    """Calculate distance between two lat/lon points in meters."""
    R = 6371000  # Earth radius (m)
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def get_center(coords):
    """Return centroid of polygon or linestring."""
    lats = [c[1] for c in coords]
    lngs = [c[0] for c in coords]
    return (sum(lats) / len(lats), sum(lngs) / len(lngs))


# ----------------------------
# Load GeoJSON
# ----------------------------
with open("campus_area.geojson", "r", encoding="utf-8") as f:
    data = json.load(f)

nodes = []
edges = []

node_id = 1

# ----------------------------
# Extract nodes from GeoJSON
# ----------------------------
for feature in data["features"]:
    geom = feature.get("geometry", {})
    props = feature.get("properties", {})
    geom_type = geom.get("type")
    coords = geom.get("coordinates")

    if not coords:
        continue

    # Handle geometry types
    if geom_type == "Polygon":
        coords = coords[0]  # outer ring
        lat, lng = get_center(coords)
        ntype = "building"
    elif geom_type == "LineString":
        lat, lng = get_center(coords)
        ntype = "path"
    elif geom_type == "Point":
        lng, lat = coords
        ntype = "landmark"
    else:
        continue

    # Use existing name or fallback to type
    name = props.get("name") or f"{ntype.capitalize()}_{node_id}"

    nodes.append({
        "id": node_id,
        "name": name.strip(),
        "lat": lat,
        "lng": lng,
        "accessible": True,
        "type": ntype
    })
    node_id += 1


# ----------------------------
# Create edges between nearest nodes
# ----------------------------
for i, node_a in enumerate(nodes):
    distances = []
    for j, node_b in enumerate(nodes):
        if i == j:
            continue
        dist = haversine_distance((node_a["lat"], node_a["lng"]), (node_b["lat"], node_b["lng"]))
        distances.append((j, dist))

    # Connect each node to its 3 nearest neighbors
    for j, dist in sorted(distances, key=lambda x: x[1])[:3]:
        edges.append({
            "from": node_a["id"],
            "to": nodes[j]["id"],
            "distance_m": round(dist, 2)
        })


# ----------------------------
# Save output
# ----------------------------
output = {"nodes": nodes, "edges": edges}

with open("campus_nodes_edges.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"✅ Generated {len(nodes)} nodes and {len(edges)} edges.")
