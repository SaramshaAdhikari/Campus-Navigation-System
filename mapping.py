from geopy.distance import distance
import json

# Load your nodes
with open("data/campus_nodes_edges.json") as f:
    data = json.load(f)

nodes = data["nodes"]
edges = []

THRESHOLD = 150  # distance in meters

for i, node_a in enumerate(nodes):
    for node_b in nodes[i+1:]:
        dist = distance(
            (node_a["lat"], node_a["lng"]),
            (node_b["lat"], node_b["lng"])
        ).meters
        if dist <= THRESHOLD:
            edges.append({
                "from": node_a["id"],
                "to": node_b["id"],
                "distance_m": round(dist, 2)
            })

# Save edges to JSON
with open("edges.json", "w") as f:
    json.dump({"edges": edges}, f, indent=2)

print(f"{len(edges)} edges created automatically!")
