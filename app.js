const express = require('express');
const bodyParser = require("body-parser");




const app = express();
app.use(express.static(__dirname + '/public'));



// EJS
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

// Express body parser
app.use(express.urlencoded({ extended: true }));



app.get("/", function(req, res){
  res.render("welcome");
});




let port = process.env.PORT;
if (port == null || port =="") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
