import React from 'react';
import { TodoList } from '../components/TodoList';
import { CreateUser } from '../components/CreateUser';
import { PostManager } from '../components/PostManager';
import { WeatherWidget } from '../components/WeatherWidget';
import { useApiClient } from '@middleware/hooks/useApiClient';

export const Dashboard: React.FC = () => {
  const apiClient = useApiClient();
  const cbState = apiClient.getCircuitBreakerState();

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      <h1>GenericAPIWrapper — React Middleware Dashboard</h1>
      <p>
        Circuit Breaker:{' '}
        <strong
          style={{
            color:
              cbState.state === 'CLOSED'
                ? 'green'
                : cbState.state === 'OPEN'
                  ? 'red'
                  : 'orange',
          }}
        >
          {cbState.state}
        </strong>{' '}
        | Failures: {cbState.failureCount}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          marginTop: '24px',
        }}
      >
        <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
          <TodoList />
        </section>
        <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
          <CreateUser />
        </section>
        <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
          <PostManager />
        </section>
        <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
          <WeatherWidget />
        </section>
      </div>
    </div>
  );
};
