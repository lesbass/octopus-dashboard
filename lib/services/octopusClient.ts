import axios, { AxiosInstance } from 'axios';

class OctopusClient {
  private client: AxiosInstance;
  private spaceId: string;

  constructor() {
    // In Next.js, chiamiamo la nostra API route invece di Octopus direttamente
    this.spaceId = ''; // Lo spaceId è gestito server-side
    this.client = axios.create({
      baseURL: '/api/octopus',
    });
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>('', {
      params: {
        endpoint,
        ...params,
      },
    });
    return response.data;
  }

  getSpaceUrl(path: string): string {
    // Lo spaceId è gestito server-side nell'API route
    return `/api/{spaceId}${path}`;
  }
}

export default OctopusClient;
