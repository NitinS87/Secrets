//jshint esversion:6

require("dotenv").config();
//to use express.js
const express = require("express");
//to load the details from page to app.js
const bodyParser = require("body-parser");
//to use ejs scriplet tags
const ejs = require("ejs");
//to connect to database
const mongoose = require("mongoose");

const encrypt = require("mongoose-encryption");
const app = express();

console.log(process.env.SECRET);
//set to load this file at startup
app.set('view engine', 'ejs');

//to use bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));

//to access this folder and load the css file at startup
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
  res.render("home");
});
app.get("/register", function(req, res){
  res.render("register");
});
app.get("/login", function(req, res){
  res.render("login");
});

app.get("/secrets", function(req, res){
  res.sender("secrets");
})

app.post("/register", function(req, res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if(err){
      console.log(err);
    }
    else{
      res.render("secrets");
    }
  })
});
app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
        if(foundUser){
          if(foundUser.password === password){
            res.render("secrets");
          }
        }
      }
  });
});

app.listen(3000, function() {
  console.log("Server started successfully");
});
