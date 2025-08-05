// /api/todos.js

let todos = [
  { id: 1, text: "revising Node", completed: false },
  { id: 2, text: "Working on To-do App", completed: false }
];

export default async function handler(req, res) {
  const { method, query } = req;

  if (method === "GET") {
    return res.status(200).json(todos);
  }

  if (method === "POST") {
    const { text } = await req.json();
    if (!text) return res.status(400).json({ error: "Text is required" });

    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    };

    todos.push(newTodo);
    return res.status(201).json(newTodo);
  }

  if (method === "DELETE") {
    const id = parseInt(query.id);
    todos = todos.filter(todo => todo.id !== id);
    return res.status(204).end();
  }

  if (method === "PUT") {
    const id = parseInt(query.id);
    const { text, completed } = await req.json();

    const todo = todos.find(t => t.id === id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    if (text !== undefined) todo.text = text;
    if (completed !== undefined) todo.completed = completed;

    return res.status(200).json(todo);
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
