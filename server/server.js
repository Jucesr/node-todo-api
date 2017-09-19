require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

var app = express();
var port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) =>{
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then( (doc) =>{
    res.send(doc);
  }, (e) =>{
    res.status(400).send(e);
  });
});

app.get('/todos', (req, res) =>{
  Todo.find().then( (todos) => {
    res.send({todos});
  }).catch( (e) => {
    res.status(400).send(e);
  } );
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if( ObjectID.isValid(id) ){

    Todo.findById(id).then( (todo) => {

      if(todo){
        res.send({todo});
      }else{
        res.status(404).send();
      }

    }).catch( (e) => {
      res.status(400).send();
    });

  }else{
    res.status(404).send();
  }


});

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then( (doc) => {

    if(!doc)
      return res.status(404).send();

    res.status(200).send({doc});

  }).catch( (e) => res.status(404).send());

});

app.patch('/todos/:id', (req, res) => {

  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id))
    return res.status(404).send();


  if( _.isBoolean(body.completed) && body.completed ){
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate( id, { $set: body}, { new: true }).then( (doc) => {
    if(!doc)
      return res.status(404).send();

    res.status(200).send({doc});
  }).catch( (e) => {
    res.status(404).send();
  } );


});

app.post('/users', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let user = new User({
    email: body.email,
    password: body.password
  });

  user.save().then( () => {
    return user.generateAuthToken();
  }).then( (token) => {
    res.header('x-auth',token).send(user);
  }).catch( (e) => {
    res.status(400).send(e);
  } );


});

app.post('/users/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  var temp_user;

  User.findByCredentials(body.email, body.password).then( (user) => {
    temp_user = user;
    return user.generateAuthToken()
  }).then( (token) =>{
    res.header('x-auth',token).send(temp_user);
  }).catch( (e) => {
    res.status(400).send();
  });

  // password = jwt.verify();
  //
  // User.findOne({body}).then( (user) =>{
  //   res.status(200).send(user);
  // });
});

app.get('/users/me',authenticate, (req, res) => {
  res.send(req.user);
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
})

module.exports = {app};
