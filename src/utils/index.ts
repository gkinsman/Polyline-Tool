import {} from "googlemaps";

export function encode(points: [number, number][]) {
  var mappedToFunctions = points.map(p => new google.maps.LatLng(p[0], p[1]));
  var encoded = google.maps.geometry.encoding.encodePath(mappedToFunctions);
  return encoded;
}

export function decode(line: string): [number, number][] {
  var decoded = google.maps.geometry.encoding.decodePath(line);
  return decoded.map(d => {
    var point: [number, number] = [d.lat(), d.lng()];
    return point;
  });
}
