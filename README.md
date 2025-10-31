# Campus Navigation System

The **Campus Navigation System** is a web-based tool designed to help users find the shortest route between locations inside a university campus.  
It uses real **campus map data (GeoJSON)** and provides multiple pathfinding algorithms, including **Dijkstra’s Algorithm**, **BFS** and **DFS** to visualize routes on an interactive map built with **Leaflet.js**.

---

## Features

- **Interactive Map:** Explore campus buildings and paths visually using Leaflet and OpenStreetMap.  
- **Multiple Pathfinding Algorithms:** Choose between BFS, DFS, and Dijkstra for route computation.  
- **Custom GeoJSON Integration:** Reads and displays your own campus layout.  
- **Automatic Graph Generation:** Converts GeoJSON data into a network of nodes and edges using Python.  
- **Clean, Simple Interface:** Dropdown menus for start/end points and algorithm selection.

---

## Tech Stack

**Frontend:**
- HTML5  
- CSS3  
- JavaScript  
- Leaflet.js (for maps)  

**Backend / Data Processing:**
- Python 3  
- GeoJSON for campus data  
- Haversine formula for distance calculation  

**Algorithms:**
- Breadth-First Search (BFS)  
- Depth-First Search (DFS)  
- Dijkstra’s Algorithm  

---

## ⚙️ Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SaramshaAdhikari/Campus-Navigation-System.git
   cd Campus-Navigation-System
