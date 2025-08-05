import React, { useEffect, useState } from "react";
import { Plus, Check, X, Edit3, Trash2 } from "lucide-react";

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data));
  }, []);

  const addTodo = () => {
    if (newTodo.trim() === "") return;

    fetch("http://localhost:3001/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTodo, completed: false }),
    })
      .then((res) => res.json())
      .then((newItem) => {
        setTodos((prev) => [...prev, newItem]);
        setNewTodo("");
      });
  };

  const toggleComplete = (id) => {
    const current = todos.find((t) => t.id === id);
    if (!current) return;

    fetch(`http://localhost:3001/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...current, completed: !current.completed }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTodos((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      });
  };

  const deleteTodo = (id) => {
    fetch(`http://localhost:3001/todos/${id}`, { method: "DELETE" }).then(() =>
      setTodos((prev) => prev.filter((t) => t.id !== id))
    );
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = () => {
    const current = todos.find((t) => t.id === editingId);
    if (!current || editText.trim() === "") return;

    fetch(`http://localhost:3001/todos/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...current, text: editText }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTodos((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        cancelEdit();
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Todo App</h1>
          <p className="text-gray-600">CRUD Operations</p>
        </div>

        {/* Add Todo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Add New Todo</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTodo()}
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

        {/* Todos List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Your Todos ({todos.length})
          </h3>

          {todos.length === 0 ? (
            <div className="text-center py-8">
              <Check size={48} className="mx-auto text-gray-300" />
              <h4 className="text-xl font-medium text-gray-600 mt-4">No tasks yet</h4>
              <p className="text-gray-500">Start by adding a task above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-4 border rounded-lg ${
                    todo.completed ? "bg-gray-100 border-gray-200" : "bg-white border-gray-300"
                  } transition-all hover:shadow`}
                >
                  <div className="flex items-center justify-between">
                    {editingId === todo.id ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          autoFocus
                        />
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-800 p-1 rounded"
                          title="Save"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Cancel"
                        >
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
                            className="w-5 h-5 text-blue-600"
                          />
                          <span
                            className={`text-lg ${
                              todo.completed
                                ? "line-through text-gray-500"
                                : "text-gray-800"
                            }`}
                          >
                            {todo.text}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(todo.id, todo.text)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
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

export default Todo;
