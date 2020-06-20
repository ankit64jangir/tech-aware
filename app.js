const express = require('express');
const bodyParser = require("body-parser");
const flash = require('connect-flash');



const app = express();
app.use(express.static(__dirname + '/public'));


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

app.get("/", function(req, res) {
  res.render("welcome");
});

// Login Page
app.get('/login', (req, res) => res.render('login'));



// Register Page
app.get('/register', (req, res) => res.render('register'));


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
