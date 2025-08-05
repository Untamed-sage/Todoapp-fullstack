// src/Todo.jsx
import React from "react";
import { useEffect, useState } from "react";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  // Fetch todos on load
  useEffect(() => {
    fetch("/api/index")
      .then(res => res.json())
      .then(data => setTodos(data));
  }, []);

  const addTodo = async () => {
    if (!input.trim()) return;
    const res = await fetch("/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });
    const newTodo = await res.json();
    setTodos(prev => [...prev, newTodo]);
    setInput("");
  };

  const deleteTodo = async id => {
    await fetch(`/api/index?id=${id}`, {
      method: "DELETE"
    });
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const toggleComplete = async todo => {
    const updated = {
      ...todo,
      completed: !todo.completed
    };
    const res = await fetch(`/api/index?id=${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
    const newTodo = await res.json();
    setTodos(prev =>
      prev.map(t => (t.id === newTodo.id ? newTodo : t))
    );
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 shadow-lg rounded-xl bg-white">
      <h1 className="text-2xl font-bold mb-4">My Todos</h1>
      <div className="flex mb-4">
        <input
          type="text"
          className="flex-grow border rounded px-3 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add new todo..."
        />
        <button
          onClick={addTodo}
          className="ml-2 bg-blue-500 text-white px-4 py-1 rounded"
        >
          Add
        </button>
      </div>
      <ul>
        {todos.map(todo => (
          <li
            key={todo.id}
            className={`flex justify-between items-center py-2 border-b ${
              todo.completed ? "line-through text-gray-400" : ""
            }`}
          >
            <span onClick={() => toggleComplete(todo)} className="cursor-pointer">
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
