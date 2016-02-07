var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
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
  var query = req.query;
  var where = {};

  if (query.hasOwnProperty('completed')) {
    if (query.completed === 'true') {
      where.completed = true;
    } else if (query.completed === 'false') {
      where.completed = false;
    } else {
      return res.status(400).send();
    }
  }

  if (query.hasOwnProperty('q')) {
    where.description = {
      $like: '%' + query.q.trim() + '%'
    };
  }

  db.todo.findAll({ where: where }).then(function (todos) {
    return res.json(todos);
  }, function (e) {
    return res.status(500).json(e);
  });
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
  db.todo.findById(parseInt(req.params.id, 10)).then(function (todo) {
    if (todo) {
      return res.json(todo.toJSON());
    } else {
      return res.status(404).send();
    }
  }, function (e) {
    return res.status(500).json(e);
  });
});

// POST /todos
app.post('/todos', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then(function (todo) {
    return res.json(todo.toJSON());
  }, function (e) {
    res.status(400).json(e);
  });
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

db.sequelize.sync(/*{force: true}*/).then(function () {
  app.listen(PORT, function () {
    console.log('Express listening on port '+ PORT);
  });
});
