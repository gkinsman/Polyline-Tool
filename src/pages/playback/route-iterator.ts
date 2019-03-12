import MatchService from "@/api/MatchService";
import { ApiLocation } from "@/api/RouteService";
import polyline from "google-polyline";

const client = new MatchService();

export interface MatchResponse {
  matchedPoint: [number, number];
  progress: number;
  index: number;
}

export default async function* iterateRoute(
  route: ApiLocation[]
): AsyncIterableIterator<MatchResponse> {
  let tailLength = 7;
  let currentIndex = 1;
  let lastResponse: [number, number] = [0, 0];

  while (true) {
    if (currentIndex == route.length) break;

    let tail = route.slice(
      Math.max(0, currentIndex - tailLength),
      currentIndex + 1
    );

    let progress = (currentIndex / route.length) * 100;

    try {
      const response = await client.loadMatch(tail, 30);
      let decodedPolyline = polyline.decode(response.polyline);
      lastResponse = decodedPolyline[decodedPolyline.length - 1];
      yield {
        matchedPoint: lastResponse,
        progress: progress,
        index: currentIndex
      };
    } catch {
      yield {
        matchedPoint: lastResponse,
        progress: progress,
        index: currentIndex
      };
    }

    currentIndex++;
  }
}
