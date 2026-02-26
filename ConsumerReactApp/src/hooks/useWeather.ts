import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@middleware/hooks/useApiClient';
import { createWeatherService } from '../services/weatherService';

export function useWeather(city: string, apiKey: string) {
  const client = useApiClient();
  const service = createWeatherService(client);

  return useQuery({
    queryKey: ['weather', city, apiKey],
    queryFn: async () => {
      const response = await service.getForecast(city, apiKey);
      if (!response.isSuccess || response.data === null) {
        throw new Error(response.errorMessage ?? 'Failed to fetch weather');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
    enabled: city.trim().length > 0 && apiKey.trim().length > 0,
  });
}
