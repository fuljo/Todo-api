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
    res.status(500).json(e);
  });
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
  db.todo.findById(parseInt(req.params.id, 10)).then(function (todo) {
    if (todo) {
      return res.json(todo.toJSON());
    } else {
      res.status(404).send();
    }
  }, function (e) {
    res.status(500).json(e);
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
  db.todo.destroy({
    where: {
      id: parseInt(req.params.id, 10)
    }
  }).then(function (n) {
    if (n > 0) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  }, function (e) {
    res.status(500).json(e);
  });
});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};

  //Validate completed
  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }
  //Validate description
  if (body.hasOwnProperty('description')) {
    attributes.description = body.description.trim();
  }

  db.todo.findById(parseInt(req.params.id, 10)).then( function (todo) {
    if (todo) {
      todo.update(attributes).then(function (todo) {
        res.json(todo.toJSON());
      }, function (e) {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, function (e) {
    res.status(500).json(e);
  });
})

db.sequelize.sync(/*{force: true}*/).then(function () {
  app.listen(PORT, function () {
    console.log('Express listening on port '+ PORT);
  });
});
