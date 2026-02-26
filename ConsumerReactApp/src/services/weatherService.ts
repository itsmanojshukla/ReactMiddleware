import { GenericApiClient } from '@middleware/core/apiClient';
import { ApiResponse } from '@middleware/types/apiResponse';
import { WeatherForecast } from '../types/weather';

export function createWeatherService(client: GenericApiClient) {
  return {
    async getForecast(city: string, apiKey: string): Promise<ApiResponse<WeatherForecast>> {
      return client.get<WeatherForecast>('/forecast', {
        params: { city },
        headers: {
          'X-Api-Key': apiKey,
          'X-Correlation-Id': crypto.randomUUID(),
        },
      });
    },
  };
}
