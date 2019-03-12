import axios from "axios";

export interface ApiLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export default class RouteService {
  async loadRoutes(): Promise<string[]> {
    const response = await axios.get<string[]>(`/routes`);
    return response.data;
  }

  async loadRoute(route: string): Promise<ApiLocation[]> {
    const response = await axios.get<ApiLocation[]>(`/routes/${route}`);
    return response.data;
  }
}
