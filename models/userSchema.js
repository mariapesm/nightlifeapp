var mongoose = require('mongoose'),
    // mongoose schema method
    Schema = mongoose.Schema,
    // mongoose objectId
    ObjectId = Schema.ObjectId,
    bcrypt = require('bcrypt-nodejs');

// load database
var db = require('../config/db.js');

var userSchema = new Schema({
  id: ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    trim: true
  }
});

// generate hash method
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// we need to create a model using the userSchema
// User model will take in db connection
var User = db.model('User', userSchema);

module.exports = User;
