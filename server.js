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
  var queryParams = req.query;
  var filteredTodos = todos;

  if (queryParams.hasOwnProperty('completed')) {
    if (queryParams.completed === 'true') {
      filteredTodos = _.where(filteredTodos, {completed: true});
    } else if (queryParams.completed === 'false') {
      filteredTodos = _.where(filteredTodos, {completed: false});
    } else {
      return res.status(400).send();
    }
  }
  res.json(filteredTodos);
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

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
  var matchedTodo = _.findWhere(todos, {id: parseInt(req.params.id, 10)});
  if (matchedTodo) {
    todos = _.without(todos, matchedTodo);
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};
  var matchedTodo = _.findWhere(todos, {id: parseInt(req.params.id, 10)});
  //Not found
  if(!matchedTodo) {
    return res.status(404).send();
  }

  //Validate completed
  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    return res.status(400).send();
  }
  //Validate description
  if (body.hasOwnProperty('description') && _.isString(body.description)
      && body.description.trim().length !== 0) {
      validAttributes.description = body.description.trim();
  } else if (body.hasOwnProperty('description')) {
    res.status(400).send();
  }

  _.extend(matchedTodo, validAttributes);
  res.json(matchedTodo);
})

app.listen(PORT, function () {
  console.log('Express listening on port '+ PORT);
});
