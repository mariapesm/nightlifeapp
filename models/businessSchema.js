var mongoose = require('mongoose'),
    // mongoose schema method
    Schema = mongoose.Schema,
    // mongoose objectId
    ObjectId = Schema.ObjectId;

// load database
var db = require('../config/db.js');

var businessSchema = new Schema({
  id: ObjectId,
  userId: {
    type: String,
    required: true,
    trim: true
  },
  business_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  business_url: {
    type: String,
    required: true,
    trim: true
  },
  business_image: {
    type: String,
    trim: true
  },
  business_price: {
    type: String,
    trim: true
  },
  business_location: {
    type: String,
    trim: true
  },
  business_phone_number: {
    type: String,
    trim: true
  },
  business_categories: [],
  business_reviews: {
    type: String,
    trim: true
  },
  business_ratings: {
    type: String,
    trim: true
  }
});

var Business = db.model('Business', businessSchema);

module.exports = Business;
