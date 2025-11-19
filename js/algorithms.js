// --- Breadth-First Search (BFS) ---
function bfs(graph, startId, endId) {
  if (!graph.nodes.has(startId) || !graph.nodes.has(endId)) {
    console.error("Invalid start or end node");
    return [];
  }

  const queue = [startId];
  const visited = new Set([startId]);
  const predecessor = {};

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === endId) break;

    const neighbors = graph.adjacencyList.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.to)) {
        visited.add(neighbor.to);
        predecessor[neighbor.to] = current;
        queue.push(neighbor.to);
      }
    }
  }

  // Reconstruct path
  const path = [];
  let node = endId;
  while (node !== undefined && node !== startId) {
    path.unshift(node);
    node = predecessor[node];
  }
  if (node === startId) path.unshift(startId);

  return path.length > 0 ? path : [];
}

// --- Depth-First Search (DFS) ---
function dfs(graph, startId, endId) {
  if (!graph.nodes.has(startId) || !graph.nodes.has(endId)) {
    console.error("Invalid start or end node");
    return [];
  }

  const stack = [startId];
  const visited = new Set();
  const predecessor = {};

  while (stack.length > 0) {
    const current = stack.pop();
    if (current === endId) break;

    if (!visited.has(current)) {
      visited.add(current);

      const neighbors = graph.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.to)) {
          predecessor[neighbor.to] = current;
          stack.push(neighbor.to);
        }
      }
    }
  }

  // Reconstruct path
  const path = [];
  let node = endId;
  while (node !== undefined && node !== startId) {
    path.unshift(node);
    node = predecessor[node];
  }
  if (node === startId) path.unshift(startId);

  return path.length > 0 ? path : [];
}

// --- Dijkstra’s Algorithm ---
class MinPriorityQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(element, priority) {
    this.queue.push({ element, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.queue.shift();
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

function dijkstra(graph, startId, endId, criteria = "distance", accessibility = true) {
  if (!graph.nodes.has(startId) || !graph.nodes.has(endId)) {
    console.error("Invalid start or end node");
    return [];
  }

  const distances = {};
  const previous = {};
  const pq = new MinPriorityQueue();

  for (const [nodeId] of graph.nodes) {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
  }

  distances[startId] = 0;
  pq.enqueue(startId, 0);

  while (!pq.isEmpty()) {
    const currentId = pq.dequeue().element;
    if (currentId === endId) break;

    const neighbors = graph.adjacencyList.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (accessibility && !neighbor.accessible) continue;

      const weight = neighbor.weight;
      const alt = distances[currentId] + weight;

      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        previous[neighbor.to] = currentId;
        pq.enqueue(neighbor.to, alt);
      }
    }
  }

  // Reconstruct path
  const path = [];
  let node = endId;
  while (node !== undefined && node !== startId) {
    path.unshift(node);
    node = previous[node];
  }
  if (node === startId) path.unshift(startId);

  return path.length > 0 ? { path, totalDistance: distances[endId] || 0 } : [];
}


