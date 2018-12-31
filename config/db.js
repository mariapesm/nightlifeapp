var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('mongodb connected');
  };
});

module.exports = mongoose;
