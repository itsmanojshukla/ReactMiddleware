import { useState } from 'react';
import { APIWrapperProvider } from './context/APIWrapperContext';
import { useAPI } from './hooks/useAPI';
import { loggerMiddleware, errorMiddleware, createAuthMiddleware } from './middleware/middlewares';
import type { Middleware } from './middleware/types';
import './App.css';

const authMiddleware: Middleware = createAuthMiddleware(() => 'demo-token-123');
const globalMiddlewares: Middleware[] = [loggerMiddleware, authMiddleware, errorMiddleware];

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

function PostFetcher() {
  const [postId, setPostId] = useState(1);
  const { data, loading, error, status, execute, reset } = useAPI<Post>();

  const fetchPost = () => {
    execute({
      url: `/posts/${postId}`,
      method: 'GET',
    });
  };

  return (
    <div className="card">
      <h2>GenericAPIWrapper Demo</h2>
      <div>
        <label>
          Post ID:{' '}
          <input
            type="number"
            min={1}
            max={100}
            value={postId}
            onChange={(e) => setPostId(Number(e.target.value))}
          />
        </label>
        <button onClick={fetchPost} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Post'}
        </button>
        <button onClick={reset} disabled={loading}>
          Reset
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {status && <p>Status: {status}</p>}
      {data && (
        <div>
          <h3>{data.title}</h3>
          <p>{data.body}</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <APIWrapperProvider
      config={{ baseURL: 'https://jsonplaceholder.typicode.com', timeout: 10000 }}
      middlewares={globalMiddlewares}
    >
      <div>
        <h1>GenericAPIWrapper — React Middleware Architecture</h1>
        <PostFetcher />
      </div>
    </APIWrapperProvider>
  );
}
