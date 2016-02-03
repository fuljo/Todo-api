var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('underscore');
var PORT = process.env.PORT || 80;

var todos = [];
var todoNextId = 1;

// Middleware
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Todo API Root')
});

// GET /todos
app.get('/todos', function (req, res) {
  res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
  var matchedTodo = _.findWhere(todos, {id: parseInt(req.params.id, 10)});

  if (matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
});

// POST /todos
app.post('/todos', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');
  if (!_.isBoolean(body.completed) || !_.isString(body.description)
  || body.description.trim().length === 0) {
    return res.status(400).send();
  }

  body.description = body.description.trim();
  
  //add id
  body.id = todoNextId++;
  //push body into array
  todos.push(body);
  res.json(body);
});

app.listen(PORT, function () {
  console.log('Express listening on port '+ PORT);
});
