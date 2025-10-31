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

    const fromEdges = this.adjacencyList.get(edge.from) || [];
    fromEdges.push({
      to: edge.to,
      weight: edge.distance ?? edge.weight ?? 1, // fallback for missing distance
      accessible: edge.accessible ?? true, // default to accessible
    });
    this.adjacencyList.set(edge.from, fromEdges);
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
