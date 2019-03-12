import axios from "axios";
import { ApiLocation } from "./RouteService";

export interface MatchResult {
  confidence: number;
  polyline: string;
}

export default class MatchService {
  async loadMatch(
    locations: ApiLocation[],
    radius: number
  ): Promise<MatchResult> {
    const result = await axios.post(`/match?radius=${radius}`, locations);
    return result.data;
  }
}
