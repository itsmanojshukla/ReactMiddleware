import React, { useState } from 'react';
import { usePosts, useCreatePost, useDeletePost } from '../hooks/usePosts';

export const PostManager: React.FC = () => {
  const { data: posts, isLoading, isError, error } = usePosts();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate({ userId: 1, title, body }, {
      onSuccess: () => {
        setTitle('');
        setBody('');
      },
    });
  };

  if (isLoading) return <p>Loading posts...</p>;
  if (isError) return <p style={{ color: 'red' }}>Error: {(error as Error).message}</p>;

  return (
    <div>
      <h2>Post Manager</h2>
      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px', marginBottom: '16px' }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          required
        />
        <button type="submit" disabled={createPost.isPending}>
          {createPost.isPending ? 'Creating...' : 'Create Post'}
        </button>
      </form>
      {createPost.isSuccess && <p style={{ color: 'green' }}>✅ Post created (ID: {createPost.data?.id})</p>}
      {createPost.isError && <p style={{ color: 'red' }}>❌ {(createPost.error as Error).message}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '4px' }}>ID</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '4px' }}>Title</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '4px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts?.slice(0, 10).map((post) => (
            <tr key={post.id}>
              <td style={{ padding: '4px' }}>{post.id}</td>
              <td style={{ padding: '4px' }}>{post.title}</td>
              <td style={{ padding: '4px' }}>
                <button
                  onClick={() => deletePost.mutate(post.id)}
                  disabled={deletePost.isPending}
                  style={{ color: 'red' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
