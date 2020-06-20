require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const flash = require('connect-flash');
const mongoose = require('mongoose');
const _ = require('lodash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('./config/auth');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')


const app = express();
app.use(express.static(__dirname + '/public'));

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));



// EJS
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

// Express body parser
app.use(express.urlencoded({
  extended: true
}));


// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});




const User = require('./models/User');
const BlogPost = require('./models/BlogPost');


app.get("/", forwardAuthenticated, function(req, res) {
  res.render("welcome");
});

//404 Page
app.get("/page404", function(req, res) {
  res.render("404");
});


// Dashboard
app.get('/dashboard', ensureAuthenticated, function(req, res) {
  res.render('dashboard', {
    user: req.user
  });
});


app.get("/blog", function(req, res) {
  BlogPost.find({}, function(err, posts) {
    res.render("blog", {
      posts: posts
    });
  });
});


app.get("/welcomeBlog", function(req, res) {
  BlogPost.find({}, function(err, welcomePosts) {
    res.render("welcomeBlog", {
      welcomePosts: welcomePosts
    });
  });
});

app.get("/compose", ensureAuthenticated, function(req, res) {
  res.render("compose", {
    user: req.user
  });
});

app.post("/compose", function(req, res) {
var today = new Date();
  const post = new BlogPost({
    author: req.body.authorName,
    title: req.body.newTitle,
    content: req.body.newPost
  });
  post.save(function(err) {
    if (!err) {
      res.redirect("/blog");
    }
  });
});


app.get("/posts/:postid", function(req, res) {
  const postReq = _.lowerCase(req.params.postName);
  const requestedPostid = req.params.postid;


  BlogPost.findOne({
    _id: requestedPostid
  }, function(err, post) {
    res.render("post", {
      title: post.title,
      author: post.author,
      content: post.content,
      date: post.date
    });
  });
});

app.get("/welcomePosts/:postid", function(req, res) {
  const postReq = _.lowerCase(req.params.postName);
  const requestedPostid = req.params.postid;


  BlogPost.findOne({
    _id: requestedPostid
  }, function(err, welcomePost) {
    res.render("welcomePost", {
      title: welcomePost.title,
      author: welcomePost.author,
      content: welcomePost.content,
      date: welcomePost.date
    });
  });
});




app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] })
);

app.get('/auth/google/techaware',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect Dashboard.
    res.redirect('/dashboard');
  });



// Login Page
app.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
app.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
app.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
