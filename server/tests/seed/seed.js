const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const todos = [{
  _id: new ObjectID(),
  text: "First test todo"
  },{
  _id: new ObjectID(),
  text: "Second test todos",
  completed: true,
  completedAt: 333
}];


const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
  _id: userOneId,
  email: 'julio@example.com',
  password: 'mypassword',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
  _id: userTwoId,
  email: 'cesar@example.com',
  password: 'myotherpassword'
  }
]

const populateTodos = (done) =>{
  Todo.remove({

  }).then( () => {
    return Todo.insertMany(todos);
  }).then( () => {
    done();
  }).catch( (e) => {
    console.log('There was an error ', e);
  } );
};

const populateUsers = (done) =>{
  User.remove({}).then( () =>{
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then( () => done() );
}

module.exports = {
  todos,
  users,
  populateTodos,
  populateUsers
}
