const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err){
    return console.log('Unable to connect to MongoDB server');
  }

  console.log('Connected to MongoDB server');

  db.collection('Users').findOneAndUpdate( {
    _id: new ObjectID('59b1e45ce2be86076c297727')
  },{
    $set: {
      name: 'Cesar'
    },
    $inc: {
      age: 10
    }
  }, {
    returnOriginal: false
  }).then( (res) =>{
    console.log(res);
  } );

  //db.close();
});
