var mongoose = require('mongoose');

mongoose.connect(process.env.mongodb://marype:networkengineering12@ds145694.mlab.com:45694/nightrate, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('mongodb connected');
  };
});

module.exports = mongoose;
