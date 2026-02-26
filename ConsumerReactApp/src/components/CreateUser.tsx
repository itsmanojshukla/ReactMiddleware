import React, { useState } from 'react';
import { useCreateUser } from '../hooks/useUsers';

export const CreateUser: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const createUser = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate({ name, username, email });
  };

  return (
    <div>
      <h2>Create User</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px' }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={createUser.isPending}>
          {createUser.isPending ? 'Creating...' : 'Create User'}
        </button>
      </form>
      {createUser.isSuccess && createUser.data && (
        <p style={{ color: 'green' }}>
          ✅ User created! ID: {createUser.data.id}, Name: {createUser.data.name}
        </p>
      )}
      {createUser.isError && (
        <p style={{ color: 'red' }}>❌ Error: {(createUser.error as Error).message}</p>
      )}
    </div>
  );
};
