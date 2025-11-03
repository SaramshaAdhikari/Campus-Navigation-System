class Graph {
  constructor() {
    this.nodes = new Map(); // Map of nodeId → node object
    this.adjacencyList = new Map(); // Map of nodeId → [{to, weight, accessible}]
  }

  addNode(node) {
    if (!node.id) {
      console.warn("Attempted to add node without valid ID:", node);
      return;
    }
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

addEdge(edge) {
    if (!edge.from || !edge.to) {
      console.warn("Invalid edge (missing from/to):", edge);
      return;
    }

    const weight = edge.distance_m ?? edge.distance ?? edge.weight ?? 1;
    const accessible = edge.accessible ?? true;

    // Ensure nodes exist in adjacency list
    if (!this.adjacencyList.has(edge.from)) {
        this.adjacencyList.set(edge.from, []);
    }
    if (!this.adjacencyList.has(edge.to)) {
        this.adjacencyList.set(edge.to, []);
    }

    // Add edge from -> to
    this.adjacencyList.get(edge.from).push({
      to: edge.to,
      weight: weight,
      accessible: accessible,
    });

    // --- ADD THIS SECTION ---
    // Add the reverse edge (to -> from) to make it two-way
    this.adjacencyList.get(edge.to).push({
      to: edge.from,
      weight: weight,
      accessible: accessible,
    });
  }
  // Optional helper: get neighbors
  getNeighbors(nodeId) {
    return this.adjacencyList.get(nodeId) || [];
  }

  // Optional helper: check connectivity
  hasEdge(fromId, toId) {
    const edges = this.adjacencyList.get(fromId);
    return edges ? edges.some((e) => e.to === toId) : false;
  }
}

// Create global graph instance
const graph = new Graph();

// Debug print helper — only call AFTER adding nodes & edges in app.js
function printGraphSummary() {
  console.log("Graph Summary:");
  graph.nodes.forEach((node, nodeId) => {
    const edges = graph.adjacencyList.get(nodeId) || [];
    console.log(`Node ${nodeId} (${node.name || "Unnamed"}) → ${edges.length} edges`);
  });
}
