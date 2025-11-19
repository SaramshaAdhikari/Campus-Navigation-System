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
      // ✅ CHANGED: Only add nodes that are marked as "landmark"
      if (node.type === "landmark" && node.name && node.name.trim() !== "") {
        const name = node.name.trim();
        if (!nodesByName[name]) nodesByName[name] = [];
        nodesByName[name].push(node);
      }
    });

    // -------------------------------
    // Calculate average coordinates
    // -------------------------------
    const locationMarkers = [];
    // This loop now only uses the "landmark" nodes from the step above
    for (const name in nodesByName) {
      const nodes = nodesByName[name];
      const avgLat =
        nodes.reduce((sum, node) => sum + node.lat, 0) / nodes.length;
      const avgLng =
        nodes.reduce((sum, node) => sum + node.lng, 0) / nodes.length;
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
    // ✅ COMMENTED OUT to hide the grey path network on load
    /*
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
    */

    // -------------------------
    // Event listener for routing
    // -------------------------
    document.getElementById("findRoute").addEventListener("click", () => {
      const startName = document.getElementById("start").value;
      const endName = document.getElementById("end").value;
      const algorithm = document.getElementById("algorithm").value;
      const accessibility = document.getElementById("accessibility").checked;

      if (!startName || !endName) {
        alert("Please select both a start and end location.");
        return;
      }
      if (startName === endName) {
        alert("Start and end locations cannot be the same.");
        return;
      }
      if (!algorithm) {
        alert("Please choose an algorithm.");
        return;
      }

      // Get all possible start and end node IDs for the selected location names
      const startNodeIds = nodesByName[startName].map((node) => node.id);
      const endNodeIds = nodesByName[endName].map((node) => node.id);

      let startTime, endTime, duration;

      // --- LOGIC FOR DIJKSTRA (Shortest Distance) ---
      if (algorithm === "dijkstra") {
        let shortestPath = null;
        let shortestDistance = Infinity;

        startTime = performance.now(); // Start timer

        // Iterate through all start/end node combinations to find the true shortest path
        for (const startId of startNodeIds) {
          for (const endId of endNodeIds) {
            const result = dijkstra(
              graph,
              startId,
              endId,
              "distance",
              accessibility
            );

            // Use the totalDistance returned from Dijkstra
            if (
              result.path &&
              result.path.length > 0 &&
              result.totalDistance < shortestDistance
            ) {
              shortestDistance = result.totalDistance;
              shortestPath = result.path;
            }
          }
        }

        endTime = performance.now(); // Stop timer
        duration = (endTime - startTime).toFixed(4); // Get duration in ms

        if (!shortestPath || shortestDistance === Infinity) {
          alert("No valid route found between selected points.");
          return;
        }

        drawPath(shortestPath);
        alert(
          `Dijkstra's Path Found!\nTime: ${duration} ms\nDistance: ${shortestDistance.toFixed(
            2
          )} meters`
        );
      } else {
        // --- LOGIC FOR BFS / DFS (Demonstration) ---
        let path = [];
        // We only need to check one pair for BFS/DFS, as we aren't finding the "shortest"
        const startId = startNodeIds[0];
        const endId = endNodeIds[0];

        if (algorithm === "bfs") {
          startTime = performance.now();
          path = bfs(graph, startId, endId);
          endTime = performance.now();
          duration = (endTime - startTime).toFixed(4);

          if (path.length > 0) {
            drawPath(path);
            alert(
              `BFS Path Found:\nTime: ${duration} ms\nSegments: ${
                path.length - 1
              } (This path has the *fewest segments*, not shortest distance)`
            );
          } else {
            alert("No path found using BFS.");
          }
        } else if (algorithm === "dfs") {
          startTime = performance.now();
          path = dfs(graph, startId, endId);
          endTime = performance.now();
          duration = (endTime - startTime).toFixed(4);

          if (path.length > 0) {
            drawPath(path);
            alert(
              `DFS Path Found:\nTime: ${duration} ms\n(This is *a* valid path, not guaranteed to be short)`
            );
          } else {
            alert("No path found using DFS.");
          }
        }
      }
    });
  })
  .catch((error) => {
    console.error("Error loading graph data:", error);
    alert("Failed to load campus data. Please check your JSON file or path.");
  });

/**
 * Calculates the total distance of a path.
 * @param {string[]} path - An array of node IDs.
 * @returns {number} The total distance in meters.
 */
function calculatePathDistance(path) {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const fromNodeId = path[i];
    const toNodeId = path[i + 1];
    const edges = graph.adjacencyList.get(fromNodeId);
    
    // Find the specific edge connecting these two nodes
    const edge = edges?.find((e) => e.to === toNodeId);
    
    if (edge) {
      totalDistance += edge.weight;
    } else {
      // This should not happen if the path is valid
      console.warn(`No edge found between ${fromNodeId} and ${toNodeId}`);
      return Infinity;
    }
  }
  return totalDistance;
}

let currentPathLayer;
/**
 * Draws a path (an array of node IDs) on the map.
 * @param {string[]} nodeIds - An array of node IDs.
 */
function drawPath(nodeIds) {
  if (currentPathLayer) {
    map.removeLayer(currentPathLayer);
  }

  const latlngs = nodeIds.map((id) => {
    const node = graph.nodes.get(id);
    return [node.lat, node.lng];
  });

  currentPathLayer = L.polyline(latlngs, {
    color: "red",
    weight: 5,
    opacity: 0.8,
  }).addTo(map);

  map.fitBounds(currentPathLayer.getBounds(), { padding: [50, 50] });
}

