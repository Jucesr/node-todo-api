const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: "First test todo"
},{
  _id: new ObjectID(),
  text: "Second test todos",
  completed: true,
  completedAt: 333
}];

beforeEach( (done) =>{
  Todo.remove({

  }).then( () => {
    return Todo.insertMany(todos);
  }).then( () => {
    done();
  }).catch( (e) => {
    console.log('There was an error ', e);
  } );
});

describe( 'POST /todos', () => {


  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect( (res) =>{
        expect(res.body.text).toBe(text);
      })
      .end( (err, res) =>{
        if(err){
          return done(err);
        }

        Todo.find({text}).then( (todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch( (e) => done(e) );

      })
  });

  it('should not create todo with invialid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end( (err, res) =>{
        if(err){
          return done(err);
        }

        Todo.find().then( (todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch( (e) => done(e) );

      });
  });
  });

describe( 'GET /todos', () =>{

  it('should get all todos', (done) =>{
    request(app)
      .get('/todos')
      .expect(200)
      .expect( (res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });

});

describe( 'GET /todos/:id', () => {

  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect( (res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var dumId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${dumId}`)
      .expect(404)
      .end(done);

  });

  it('should return 404 if non-object ids', (done) => {

    request(app)
      .get('/todos/1234abvc')
      .expect(404)
      .end(done);

  });

});

describe( 'DELETE /todos/:id', () => {

  it('should delete a todo', (done) =>{
    let id = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect( (res) => {
        expect(res.body.doc.text).toBe(todos[0].text);
        //expect(res.body.doc.length).toBe(1);
      })
      .end( (err, res) => {
        if(err)
          return done(err);

        Todo.findById( id ). then( (doc) =>{
          expect(doc).toNotExist();
          done();
        }).catch( (e) => {
          done(e);



        } );

      });


  });



  it('should return 404 if todo not found', (done) => {
    let id = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);

  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/todos/123abc')
      .expect(404)
      .end(done);
  });

});

describe( 'PATCH /todos/:id', () =>{

  it('should update a todo', (done) => {
    let id = todos[1]._id.toHexString();
    let text = 'This is the new text';

    request(app)
      .patch(`/todos/${id}`)
      .send({
        completed: true,
        text: text
      })
      .expect(200)
      .expect( (res) => {
        expect(res.body.doc.text).toBe(text);
        expect(res.body.doc.completed).toBe(true);
        expect(res.body.doc.completedAt).toBeA('number');
      })
      .end(done);

  });

  it('should clear completedAt when todo is not completed', (done) => {
    var hexId = todos[1]._id.toHexString();
    var text = 'This should be the new text!!';

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.doc.text).toBe(text);
        expect(res.body.doc.completed).toBe(false);
        expect(res.body.doc.completedAt).toNotExist();
      })
      .end(done);
  });

});
