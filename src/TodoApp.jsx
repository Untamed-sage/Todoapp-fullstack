import React, { useState, useEffect } from "react";
import { Plus, Check, Trash2, Edit3, X } from "lucide-react";

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Function to sort todos: incomplete tasks first (by newest), then completed tasks at bottom
  const sortTodos = (todoList) => {
    return [...todoList].sort((a, b) => {
      // If completion status is different, incomplete comes first
      if (a.completed !== b.completed) {
        return a.completed - b.completed;
      }
      // If both have same completion status, sort by creation time (newest first for incomplete, oldest first for completed)
      if (!a.completed && !b.completed) {
        return (b.createdAt || b.id) - (a.createdAt || a.id);
      }
      return (a.createdAt || a.id) - (b.createdAt || b.id);
    });
  };

  useEffect(() => {
    fetch("/api/index")
      .then(res => res.json())
      .then(data => {
        // Add createdAt timestamp if not present
        const todosWithTimestamp = data.map(todo => ({
          ...todo,
          createdAt: todo.createdAt || Date.now()
        }));
        setTodos(sortTodos(todosWithTimestamp));
      });
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    
    // Create new todo with current timestamp
    const newTodoItem = {
      text: newTodo,
      createdAt: Date.now()
    };
    
    const res = await fetch("/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodoItem)
    });
    const data = await res.json();
    
    // Add the new todo and sort
    setTodos(prev => sortTodos([...prev, { ...data, createdAt: data.createdAt || Date.now() }]));
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
    
    // Update the todo and sort to move completed items to bottom
    setTodos(prev => sortTodos(prev.map(t => (t.id === id ? { ...updated, createdAt: t.createdAt } : t))));
  };

  const deleteTodo = async (id) => {
    await fetch(`/api/index?id=${id}`, { method: "DELETE" });
    setTodos(prev => prev.filter(t => t.id !== id));
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
    
    // Update the todo while preserving sort order
    setTodos(prev => sortTodos(prev.map(t => (t.id === updated.id ? { ...updated, createdAt: t.createdAt } : t))));
    cancelEdit();
  };

  // Separate completed and incomplete todos for display
  const incompleteTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

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
              {/* Show incomplete todos first */}
              {incompleteTodos.length > 0 && (
                <>
                  {incompleteTodos.map(todo => (
                    <div
                      key={todo.id}
                      className="p-4 border rounded-lg bg-white border-gray-300 hover:shadow-md transition"
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
                              <span className="text-lg text-gray-800">
                                {todo.text}
                              </span>
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
                </>
              )}

              {/* Show separator if both completed and incomplete tasks exist */}
              {incompleteTodos.length > 0 && completedTodos.length > 0 && (
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="px-4 text-sm text-gray-500 bg-gray-50">Completed Tasks</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
              )}

              {/* Show completed todos at the bottom */}
              {completedTodos.map(todo => (
                <div
                  key={todo.id}
                  className="p-4 border rounded-lg bg-gray-50 border-gray-200 hover:shadow-md transition"
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
                          <span className="text-lg line-through text-gray-500">
                            {todo.text}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Completed
                          </span>
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