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

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

//to hash those passwords
// const md5 = require("md5");
//to salt and hash those password
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
// const encrypt = require("mongoose-encryption");
const app = express();

// console.log(process.env.SECRET);
//set to load this file at startup
app.set('view engine', 'ejs');

//to use bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));

//to access this folder and load the css file at startup
app.use(express.static("public"));

// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, {secret: process.env.SECRET, enryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});
app.get("/register", function(req, res) {
  res.render("register");
});
app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/secrets", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
  // res.render("secrets");
});

app.post("/register", function(req, res) {
  //bcrypt hashing and salting
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //   // Store hash in your password DB.
  //   const newUser = new User({
  //     email: req.body.username,
  //     password: hash
  //   });
  //   newUser.save(function(err) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.render("secrets");
  //     }
  //   })
  // });

  //when you are using md5
  // const newUser = new User({
  //   email: req.body.username,
  //   password: md5(req.body.password)
  // });
  // newUser.save(function(err){
  //   if(err){
  //     console.log(err);
  //   }
  //   else{
  //     res.render("secrets");
  //   }
  // })

  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });

    }
  });
});
app.post("/login", function(req, res) {
  // const username = req.body.username;
  // const password = md5(req.body.password);
  //
  // User.findOne({email: username}, function(err, foundUser){
  //   if(err){
  //     console.log(err);
  //   }
  //   else{
  //       if(foundUser){
  //         if(foundUser.password === password){
  //           res.render("secrets");
  //         }
  //       }
  //     }
  // });

  //to bcrypt salt and hash those passwords
  // const username = req.body.username;
  // const password = req.body.password;
  //
  // User.findOne({
  //   email: username
  // }, function(err, foundUser) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if (foundUser) {
  //       bcrypt.compare(password, foundUser.password, function(err, result) {
  //         // result == true
  //         if (result === true) {
  //           res.render("secrets");
  //         }
  //
  //       });
  //
  //     }
  //   }
  // });
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  })
});

app.listen(3000, function() {
  console.log("Server started successfully");
});
