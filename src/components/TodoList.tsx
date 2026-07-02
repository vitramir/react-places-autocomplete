/*
 * Copyright (c) 2016-present, Ken Hibino.
 * Licensed under the MIT License (MIT).
 * See https://kenny-hibino.github.io/react-places-autocomplete
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import morphdom from 'morphdom';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  initialTodos?: Todo[];
  onTodosChange?: (todos: Todo[]) => void;
}

function renderTodoItem(todo: Todo): string {
  return `
    <li data-id="${todo.id}" class="todo-item ${todo.completed ? 'completed' : ''}">
      <span class="todo-text">${todo.text}</span>
      <button class="todo-delete" data-action="delete" data-todo-id="${todo.id}">
        Delete
      </button>
    </li>
  `;
}

function renderList(todos: Todo[]): string {
  return `<ul class="todo-list">${todos.map(renderTodoItem).join('')}</ul>`;
}

const defaultTodos: Todo[] = [
  { id: 1, text: 'Review pull requests', completed: false },
  { id: 2, text: 'Update dependencies', completed: true },
  { id: 3, text: 'Write documentation', completed: false },
];

const TodoList: React.FC<TodoListProps> = ({
  initialTodos = defaultTodos,
  onTodosChange,
}) => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const listRef = useRef<HTMLUListElement>(null);

  const handleDelete = useCallback(
    (id: number) => {
      setTodos((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (onTodosChange) {
          onTodosChange(next);
        }
        return next;
      });
    },
    [onTodosChange],
  );

  const handleToggle = useCallback((id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  // Delegate click events on the list container
  useEffect(() => {
    const root = listRef.current;
    if (!root) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.dataset.action === 'delete') {
        const todoId = Number(target.dataset.todoId);
        if (!Number.isNaN(todoId)) {
          handleDelete(todoId);
        }
      }
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [handleDelete]);

  // Morph the DOM list when todos change
  useEffect(() => {
    const root = listRef.current;
    if (!root) return;

    morphdom(root, renderList(todos));
  }, [todos]);

  return (
    <section className="todo-list-container">
      <h2>Todo List</h2>
      <ul ref={listRef} className="todo-list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            data-id={todo.id}
            className={`todo-item ${todo.completed ? 'completed' : ''}`}
          >
            <span
              className="todo-text"
              onClick={() => handleToggle(todo.id)}
              role="button"
              tabIndex={0}
            >
              {todo.text}
            </span>
            <button
              className="todo-delete"
              data-action="delete"
              data-todo-id={todo.id}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TodoList;
