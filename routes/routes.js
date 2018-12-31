var routes = function(app, flash, util, assert, Yelp, User, bcrypt, Business) {
  var db = require('../config/db.js');

  app.get('/', function(req, res) {
    var location = req.session.location;
    if (location !== undefined) {
      res.redirect('/bars');
    } else {
      res.render('index.html', {
        user: req.session.user
      });
    };
  });

  app.get('/bars', function(req, res) {

    var location = req.session.location;
    // console.log(location);
    if (location === undefined) {
      req.flash('error', 'Input location to search for a bar near you');
      res.redirect('/');
    };
    // console.log('location: ' + location);
    const client = Yelp.client(process.env.YELP_API_KEY);

    var myPromise = new Promise(function(resolve, reject) {
      // search bars at location
      client.search({
        term: 'Bars',
        location: location,
        limit: 10
      })
      .then(function (data) {
        var businesses = data.jsonBody.businesses;
        // console.log('this is the data: ' + util.inspect(data.jsonBody.businesses));
        for (var i = 0; i < businesses.length; i++) {
          // add a count to each business
          businesses[i].count = (i + 1);
        };
        // console.log(businesses);
        resolve(businesses);
      })
      .catch(function (err) {
        reject(err);
      });
    });

    myPromise
      .then(function whenOk(response) {
        res.render('index.html', {
          user: req.session.user,
          businesses: response
        });
      })
      .catch(function notOk(err) {
        console.log(err);
      });
  });

  app.post('/bars', function(req, res) {

      var location = req.body.sIndex
      req.session.location = location;

    // console.log('location: ' + location);
    const client = Yelp.client(process.env.YELP_API_KEY);

    var myPromise = new Promise(function(resolve, reject) {
      // search bars at location
      client.search({
        term: 'Bars',
        location: location,
        limit: 10
      })
      .then(function (data) {
        var businesses = data.jsonBody.businesses;
        // console.log('this is the data: ' + util.inspect(data.jsonBody.businesses));
        for (var i = 0; i < businesses.length; i++) {
          // add a count to each business
          businesses[i].count = (i + 1);
        };
        // console.log(businesses);
        resolve(businesses);
      })
      .catch(function (err) {
        reject(err);
      });
    });

    myPromise
      .then(function whenOk(response) {
        res.render('index.html', {
          user: req.session.user,
          businesses: response
        });
      })
      .catch(function notOk(err) {
        console.log(err);
      });
  });

  app.get('/register', isLoggedIn, function(req, res) {
    console.log(req.session);
    console.log(res.locals);
    console.log(req.session.flash);
    res.render('register.html', {
      success_message: req.flash('success'),
      error_message: req.flash('error')
    });
  });

  app.post('/register', function(req, res) {
    var newUser = new User();
    var userEmail = req.body.userEmail.toLowerCase();
    var userPassword = req.body.userPassword;
    var verifyPassword = req.body.verifyPassword;

    User.findOne({ 'email': userEmail }, function(err, user) {
      // display error if err is not null
      assert.equal(null, err, err);
      // if user does not exist check password
      if (!user) {
        if (userPassword !== verifyPassword) {
          // console.log('Passwords do not match');
          req.flash('error', 'Passwords do not match');
          res.redirect('/register');
        } else {
          // if passwords match create new user and save to database
          newUser.email = userEmail;
          newUser.password = newUser.generateHash(verifyPassword);
          newUser.created_at = Date();

          newUser.save(function(err) {
            assert.equal(null, err, err);
          });

          // assign user session to session objects
          req.session.user = newUser._id;
          // console.log('You are registered');
          req.flash('success', 'You are registered');
          res.redirect('/dashboard');
        };
      } else {
        // user exists
        req.flash('error', 'Email already exists');
        res.redirect('/register');
      }
    });
  });

  app.get('/login', isLoggedIn, function(req, res) {

    res.render('login.html', {
      success_message: req.flash('success'),
      error_message: req.flash('error')
    });
  });

  app.post('/login', function(req, res) {
    var user = new User();
    var userEmail = req.body.userEmail;
    var password = req.body.userPassword;

    User.findOne({ 'email': userEmail }, function(err, user) {
      // display error if err is not null
      assert.equal(null, err, err);
      // if user does not exist display error message
      if (!user) {
        req.flash('error', 'Incorrect email or does not exist');
        res.redirect('/login');
      } else {
        // if exists, authenticate password
        bcrypt.compare(password, user.password, function(err, result) {
          assert.equal(null, err, err);
          // if passwords match assign user id to session object
          if (result === true) {
            req.session.user = user._id;
            req.flash('success', 'You are logged in');
            res.redirect('/dashboard');
            // if passwords are incorrect redirect back to login
          } else {
            req.flash('error', 'Password incorrect');
            res.redirect('/login');
          }
        });
      }
    });
  });

  app.get('/logout', function(req, res) {
    if (req.session.user) {
      req.session.destroy(function(err) {
        if (err) {
          next(err);
        } else {
          res.redirect('/login');
        }
      });
    };
  });

  app.get('/dashboard', requireLogin, function(req, res) {
    Business.find({ 'userId': req.session.user }, function(err, businesses) {
      res.render('dashboard.html', {
        user: req.session.user,
        businesses: businesses,
        success_message: req.flash('success'),
        error_message: req.flash('error')
      });
    });
  });

  app.post('/rsvp/:businessAlias', requireLogin, function(req, res) {
    var newBusiness = new Business();
    var businessAlias = req.params.businessAlias;
    var userId = req.session.user;
    // console.log(businessAlias);
    // console.log(userId);
    const client = Yelp.client(process.env.YELP_API_KEY);

    client.business(businessAlias).then(function(response) {
      // console.log(response);
      var name = response.jsonBody.name;
      var image_url = response.jsonBody.image_url;
      var link = response.jsonBody.url;
      var review_count = response.jsonBody.review_count;
      var rating = response.jsonBody.rating;
      var location = response.jsonBody.location.display_address;
      var phone = response.jsonBody.display_phone;
      var categories = response.jsonBody.categories;
      var price = response.jsonBody.price;

      Business.findOne({ 'business_name': name }, function(err, business) {
        if (err) {
          console.log('err');
        };

        if (!business) {
          newBusiness.userId = userId;
          newBusiness.business_name = name;
          newBusiness.business_url = link;
          newBusiness.business_image = image_url;
          newBusiness.business_price = price;
          newBusiness.business_location = location;
          newBusiness.business_phone_number = phone;
          newBusiness.business_categories = categories;
          newBusiness.business_reviews = review_count;
          newBusiness.business_ratings = rating;

          newBusiness.save(function(err) {
            assert.equal(null, err, err);
            req.flash('success', "You are now RSVP'd to " + name);
            res.redirect('/bars');
          });
        } else {
          req.flash('error', "You have already RSVP'd to " + name);
          res.redirect('/bars');
        };
      });
    }).catch(function(err) {
      assert.equal(null, err, err);
    });
  });

  app.post('/delete/rsvp/:businessId', function(req, res) {
    var businessId = req.params.businessId;

    Business.remove({ '_id': businessId }, function(err, business) {
      if (err) {
        throw err;
      };
      req.flash('success', 'Poll was successfully deleted');
      res.redirect('/dashboard');
    });
  });

  app.get('/settings', requireLogin, function(req, res) {
    res.render('settings.html', {
      user: req.session.user
    });
  });

  app.post('/settings', function(req, res) {
    var user = new User();

    var currentPassword = req.body.currentPassword;
    var newPassword = req.body.newPassword;
    var verifyNewPassword = req.body.verifyNewPassword;

    User.findOne({ '_id': req.session.user }, function(err, user) {

      if (err) {
        throw err;
      }
      if (currentPassword === newPassword) {
        req.flash('error', 'New password cannot be previous password');
        res.redirect('/settings');
      } else if (newPassword === verifyNewPassword) {

        bcrypt.compare(currentPassword, user.password, function(err, result) {

          if (err) {
            throw err;
          };

          // if password match hash in db change old password with new
          if (result === true) {

            user.password = user.generateHash(newPassword);

            user.save(function(err) {
              if (err) {
                throw err;
              } else {
                req.flash('success', 'Your password has successfully changed');
                res.redirect('/settings');
              }
            })
            // if does not match redirect to settings and display error message
          } else {
            req.flash('error', 'Current password was incorrect');
            res.redirect('/settings');
          }
        });
      } else  {
        req.flash('error', 'New password did not match');
        res.redirect('/settings');
      };
    });
  });
}
// middleware to require login
var requireLogin = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash('error', 'Login required');
    res.redirect('/login');
  }
};

// middleware to check if logged in
var isLoggedIn = function(req, res, next) {
  if (!req.session.user) {
    next();
  } else {
    req.flash('error', 'Already logged in');
    res.redirect('/dashboard');
  }
}

// middleware to title case string
var titleCase = function(string) {
  var tempStr;
  for (var i = 0; i < string.length; i++) {
    tempStr = string[0].toUpperCase() + string.slice(1);
  };
  return tempStr;
};

module.exports = routes;
