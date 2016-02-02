var express = require('express');
var app = express();
var PORT = process.env.PORT || 80;

var todos = [
  {
    id: 1,
    description: 'Meet mum for lunch',
    completed: false
  },
  {
    id: 2,
    description: 'Go to market',
    completed: false
  },
  {
    id: 3,
    description: 'Go to sleep',
    completed: true
  }
];

app.get('/', function (req, res) {
  res.send('Todo API Root')
});

// GET /todos
app.get('/todos', function (req, res) {
  res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
  var matchedTodo;
  todos.forEach(function (todo) {
    if (todo.id == req.params.id) {
      matchedTodo = todo;
    }
  });

  if (matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
});

app.listen(PORT, function () {
  console.log('Express listening on port '+ PORT);
});
