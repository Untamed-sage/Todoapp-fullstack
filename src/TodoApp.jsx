// src/Todo.jsx
import React, { useState, useEffect } from "react";
import { Plus, Check, Trash2, Edit3, X } from "lucide-react";

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetch("/api/index")
      .then(res => res.json())
      .then(data => setTodos(data));
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const res = await fetch("/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTodo })
    });
    const data = await res.json();
    setTodos(prev => [...prev, data]);
    setNewTodo("");
  };

  const toggleComplete = async (id) => {
    const todo = todos.find(t => t.id === id);
    const res = await fetch(`/api/index?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...todo, completed: !todo.completed })
    });
    const updated = await res.json();
    setTodos(todos.map(t => (t.id === id ? updated : t)));
  };

  const deleteTodo = async (id) => {
    await fetch(`/api/index?id=${id}`, { method: "DELETE" });
    setTodos(todos.filter(t => t.id !== id));
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async () => {
    const res = await fetch(`/api/index?id=${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText })
    });
    const updated = await res.json();
    setTodos(todos.map(t => (t.id === updated.id ? updated : t)));
    cancelEdit();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Todo App</h1>
          <p className="text-gray-600">CRUD Operations</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Add New Todo</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            <button
              onClick={addTodo}
              className="bg-yellow-400 hover:bg-black text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Your Todos ({todos.length})
          </h3>

          {todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Check size={48} className="mx-auto text-gray-300 mb-2" />
              <p>No tasks yet. Add one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className={`p-4 border rounded-lg ${
                    todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                  } hover:shadow-md transition`}
                >
                  <div className="flex items-center justify-between">
                    {editingId === todo.id ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          autoFocus
                        />
                        <button onClick={saveEdit} className="text-green-600">
                          <Check size={20} />
                        </button>
                        <button onClick={cancelEdit} className="text-red-600">
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3 flex-1">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleComplete(todo.id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className={`text-lg ${todo.completed ? "line-through text-gray-500" : "text-gray-800"}`}>
                            {todo.text}
                          </span>
                          {todo.completed && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button onClick={() => startEdit(todo.id, todo.text)} className="text-blue-600">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => deleteTodo(todo.id)} className="text-red-600">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
