import React, { useState } from 'react';
import { useWeather } from '../hooks/useWeather';

export const WeatherWidget: React.FC = () => {
  const [city, setCity] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchApiKey, setSearchApiKey] = useState('');

  const { data: weather, isLoading, isError, error } = useWeather(searchCity, searchApiKey);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchCity(city);
    setSearchApiKey(apiKey);
  };

  return (
    <div>
      <h2>Weather Widget</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px' }}>
        <input
          placeholder="City (e.g. London)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <input
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
        />
        <button type="submit">Search Weather</button>
      </form>
      {isLoading && <p>Loading weather...</p>}
      {isError && (
        <p style={{ color: 'red' }}>
          ❌ {(error as Error).message}
        </p>
      )}
      {weather && (
        <div style={{ marginTop: '12px', padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>🌤 {weather.city}</h3>
          <p>🌡 Temperature: {weather.temperatureCelsius}°C</p>
          <p>📋 Summary: {weather.summary}</p>
          <p>📅 Date: {weather.date}</p>
        </div>
      )}
    </div>
  );
};
