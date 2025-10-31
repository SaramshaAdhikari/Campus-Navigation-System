import osmium
import geojson

class OSMToGeoJSON(osmium.SimpleHandler):
    def __init__(self):
        super(OSMToGeoJSON, self).__init__()
        self.features = []

    def node(self, n):
        if n.tags:
            self.features.append(geojson.Feature(
                geometry=geojson.Point((n.location.lon, n.location.lat)),
                properties=dict(n.tags)
            ))

    def way(self, w):
        try:
            if 'building' in w.tags or 'highway' in w.tags or 'footway' in w.tags:
                coords = [(node.lon, node.lat) for node in w.nodes]
                geom_type = 'Polygon' if 'building' in w.tags else 'LineString'
                geometry = geojson.Polygon([coords]) if geom_type == 'Polygon' else geojson.LineString(coords)

                self.features.append(geojson.Feature(
                    geometry=geometry,
                    properties=dict(w.tags)
                ))
        except osmium.InvalidLocationError:
            pass  # skip any invalid geometry

handler = OSMToGeoJSON()
handler.apply_file("map.osm", locations=True)

output_file = "campus_area.geojson"
with open(output_file, "w", encoding="utf-8") as f:
    geojson.dump(geojson.FeatureCollection(handler.features), f, indent=2)

print(f"✅ Conversion complete! File saved as {output_file}")
