import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { APIWrapperProvider } from '../context/APIWrapperContext';
import { useAPI } from '../hooks/useAPI';
import type { RequestConfig } from '../middleware/types';

vi.mock('../middleware/createAPIWrapper', () => ({
  createAPIWrapper: vi.fn(() => ({
    request: vi.fn().mockResolvedValue({ data: { title: 'Test Post' }, status: 200, headers: {} }),
    instance: {},
  })),
}));

function TestComponent({ config }: { config: RequestConfig }) {
  const { data, loading, error, execute } = useAPI<{ title: string }>();
  return (
    <div>
      {loading && <span>Loading</span>}
      {error && <span>Error: {error.message}</span>}
      {data && <span>Data: {data.title}</span>}
      <button onClick={() => execute(config)}>Fetch</button>
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <APIWrapperProvider config={{ baseURL: 'https://example.com' }}>
      {children}
    </APIWrapperProvider>
  );
}

describe('useAPI', () => {
  const config: RequestConfig = { url: '/posts/1', method: 'GET' };

  it('renders without crashing', () => {
    render(<TestComponent config={config} />, { wrapper: Wrapper });
    expect(screen.getByText('Fetch')).toBeInTheDocument();
  });

  it('shows data after successful fetch', async () => {
    const user = userEvent.setup();
    render(<TestComponent config={config} />, { wrapper: Wrapper });
    await user.click(screen.getByText('Fetch'));
    expect(await screen.findByText('Data: Test Post')).toBeInTheDocument();
  });

  it('shows error on failed fetch', async () => {
    const { createAPIWrapper } = await import('../middleware/createAPIWrapper');
    vi.mocked(createAPIWrapper).mockReturnValueOnce({
      request: vi.fn().mockRejectedValue(new Error('Network Error')),
      instance: {} as never,
    });

    const user = userEvent.setup();
    render(<TestComponent config={config} />, { wrapper: Wrapper });
    await user.click(screen.getByText('Fetch'));
    expect(await screen.findByText('Error: Network Error')).toBeInTheDocument();
  });
});
