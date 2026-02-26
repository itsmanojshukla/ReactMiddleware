import React from 'react';
import { useTodos, useToggleTodo } from '../hooks/useTodos';

export const TodoList: React.FC = () => {
  const { data: todos, isLoading, isError, error } = useTodos();
  const toggleTodo = useToggleTodo();

  if (isLoading) return <p>Loading todos...</p>;
  if (isError) return <p style={{ color: 'red' }}>Error: {(error as Error).message}</p>;

  return (
    <div>
      <h2>Todos</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos?.slice(0, 10).map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 0',
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? '#888' : 'inherit',
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo.mutate(todo)}
              disabled={toggleTodo.isPending}
            />
            <span>
              [{todo.id}] {todo.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
