const mongoose = require('mongoose');
const express = require('express');
const findOrCreate = require('mongoose-findorcreate')
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  googleId: String,
  date: {
    type: Date,
    default: Date.now
  }
});

UserSchema.plugin(findOrCreate);

const User = mongoose.model('User', UserSchema);




module.exports = User;
