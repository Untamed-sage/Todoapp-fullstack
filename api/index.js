// api/index.js
let todos = [
  { id: 1, text: "revising Node", completed: false },
  { id: 2, text: "Working on To-do App", completed: false },
];

export default async function handler(req, res) {
  const { method, query, body } = req;

  if (method === "GET") {
    return res.status(200).json(todos);
  }

  if (method === "POST") {
    const newTodo = {
      id: Date.now(),
      text: body.text,
      completed: false
    };
    todos.push(newTodo);
    return res.status(201).json(newTodo);
  }

  if (method === "DELETE") {
    const id = parseInt(query.id);
    todos = todos.filter(todo => todo.id !== id);
    return res.status(200).json({ success: true });
  }

  if (method === "PUT") {
    const id = parseInt(query.id);
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos[index] = body;
      return res.status(200).json(todos[index]);
    } else {
      return res.status(404).json({ error: "Not found" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
