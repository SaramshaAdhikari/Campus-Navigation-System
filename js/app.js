// Fetch data and initialize the graph
fetch("data/campus_nodes_edges.json")
  .then((response) => response.json())
  .then((data) => {
    // Validate structure
    if (!data.nodes || !data.edges) {
      console.error("Invalid graph data structure: missing nodes or edges.");
      alert("Error: Missing node or edge data. Please check your JSON file.");
      return;
    }

    // Add nodes to the graph
    data.nodes.forEach((node) => graph.addNode(node));

    // Add edges to the graph
    data.edges.forEach((edge) => graph.addEdge(edge));

    // --------------------
    // Group nodes by name
    // --------------------
    const nodesByName = {};
    data.nodes.forEach((node) => {
      if (node.name && node.name.trim() !== "") {
        const name = node.name.trim();
        if (!nodesByName[name]) nodesByName[name] = [];
        nodesByName[name].push(node);
      }
    });

    // -------------------------------
    // Calculate average coordinates
    // -------------------------------
    const locationMarkers = [];
    for (const name in nodesByName) {
      const nodes = nodesByName[name];
      const avgLat = nodes.reduce((sum, node) => sum + node.lat, 0) / nodes.length;
      const avgLng = nodes.reduce((sum, node) => sum + node.lng, 0) / nodes.length;
      locationMarkers.push({ name, lat: avgLat, lng: avgLng });
    }

    // ----------------------------------------
    // Add a single marker per named location
    // ----------------------------------------
    locationMarkers.forEach((location) => {
      L.marker([location.lat, location.lng])
        .bindPopup(location.name)
        .addTo(map);
    });

    // ----------------------------------------------------
    // Populate the start and end select elements uniquely
    // ----------------------------------------------------
    const startSelect = document.getElementById("start");
    const endSelect = document.getElementById("end");

    locationMarkers.forEach((location) => {
      const option = document.createElement("option");
      option.value = location.name;
      option.text = location.name;
      startSelect.add(option.cloneNode(true));
      endSelect.add(option);
    });

    // ---------------------------
    // (Optional) Draw edges on map
    // ---------------------------
    data.edges.forEach((edge) => {
      const fromNode = graph.nodes.get(edge.from);
      const toNode = graph.nodes.get(edge.to);
      if (fromNode && toNode) {
        L.polyline(
          [
            [fromNode.lat, fromNode.lng],
            [toNode.lat, toNode.lng],
          ],
          { color: "gray" }
        ).addTo(map);
      }
    });

    // -------------------------
    // Event listener for routing
    // -------------------------
    document.getElementById("findRoute").addEventListener("click", () => {
      const startName = document.getElementById("start").value;
      const endName = document.getElementById("end").value;
      const algorithm = document.getElementById("algorithm").value;
      const accessibility = document.getElementById("accessibility").checked;

      if (startName === endName) {
        alert("Start and end locations cannot be the same. Please select different locations.");
        return;
      }

      const startNodeIds = nodesByName[startName].map((node) => node.id);
      const endNodeIds = nodesByName[endName].map((node) => node.id);

      let shortestPath = null;
      let shortestDistance = Infinity;

      for (const startId of startNodeIds) {
        for (const endId of endNodeIds) {
          let result = [];
          switch (algorithm) {
            case "bfs":
              result = bfs(graph, startId, endId);
              break;
            case "dfs":
              result = dfs(graph, startId, endId);
              break;
            case "dijkstra":
              result = dijkstra(graph, startId, endId, "distance", accessibility);
              if (result && result.path) result = result.path;
              break;
          }

          if (result && result.length > 0) {
            const totalDistance = calculatePathDistance(result);
            if (totalDistance < shortestDistance) {
              shortestDistance = totalDistance;
              shortestPath = result;
            }
          }
        }
      }

      if (!shortestPath || shortestPath.length === 0 || shortestDistance === Infinity) {
        alert("No valid route found between selected points.");
        return;
      }

      drawPath(shortestPath);
      alert(`Path found! Total distance: ${shortestDistance.toFixed(2)} meters`);
    });
  })
  .catch((error) => {
    console.error("Error loading graph data:", error);
    alert("Failed to load campus data. Please check your JSON file or path.");
  });

function calculatePathDistance(path) {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const fromNodeId = path[i];
    const toNodeId = path[i + 1];
    const edges = graph.adjacencyList.get(fromNodeId);
    const edge = edges?.find((e) => e.to === toNodeId);
    totalDistance += edge ? edge.weight : Infinity;
  }
  return totalDistance;
}

let currentPathLayer;
function drawPath(nodeIds) {
  if (currentPathLayer) map.removeLayer(currentPathLayer);
  const latlngs = nodeIds.map((id) => [graph.nodes.get(id).lat, graph.nodes.get(id).lng]);
  currentPathLayer = L.polyline(latlngs, { color: "red", weight: 5 }).addTo(map);
  map.fitBounds(currentPathLayer.getBounds());
}
