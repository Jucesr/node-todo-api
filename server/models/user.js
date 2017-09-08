var mongoose = require('mongoose');

var User = mongoose.model('User', {
  email: {
    require: true,
    trim: true,
    type: String,
    minLengh: 1
  }
});

module.exports = {User};
