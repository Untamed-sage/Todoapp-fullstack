const express = require('express');
const cors = require('cors'); // we use cors to connect frontend with backend 

const app = express();
const PORT = 3001;

//middleware
app.use(cors());
app.use(express.json());

let todos = [
    {id:1, text: 'revising Node' , completed: false},
    {id:2, text: 'Working on To-do App ' , completed: false}
];

//routes-get-call
// curl http://localhost:3001/todos
app.get('/todos',(req,res) => {
    res.json(todos);
});

//routes-post-call to add basicaally
// curl -X POST http://localhost:3001/todos \
//   -H "Content-Type: application/json" \
//   -d '{"text": "Read a book"}'
app.post('/todos',(req,res) => {
    const {text} = req.body;
    const newTodo = {
        id:Date.now(),
        text,
        completed:false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// routes-delete-call
app.delete('/todos/:id',(req,res)=> {
    const id = parseInt(req.params.id);
    todos = todos.filter(todos => todos.id != id);
    res.status(204).end();
});

//route to update 

// curl -X PUT http://localhost:3001/todos/1 \
//   -H "Content-Type: application/json" \
//   -d '{"text": "Go for a run", "completed": true}'

app.put('/todos/:id',(req,res)=>{
    const id = parseInt(req.params.id);
    const {text,completed} = req.body;

    const todo = todos.find(t => t.id === id);
    if (todo) {
        if(text !== undefined) todo.text = text;
        if(completed !==undefined) todo.completed = completed;
        res.json(todo);
    }
    else {
        res.status(404).json({error: "Todo not find"});
    }
});
app.listen(PORT, () => {
    console.log('Server is running')
});