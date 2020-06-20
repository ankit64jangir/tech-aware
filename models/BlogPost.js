const mongoose = require('mongoose');
const express = require('express');
const findOrCreate = require('mongoose-findorcreate')
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));



const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const BlogPost = mongoose.model("BlogPost", postSchema);



module.exports = BlogPost;
