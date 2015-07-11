// BASE SETUP
// =========================================

// CALL THE PACKAGES -----------------------
var express = require("express");       // Call express
var app = express();                    // Define our app using express
var bodyParser = require("body-parser");// Get body-parser
var morgan = require("morgan");         // Used to see requests
var mongoose = require("mongoose");     // To work with the database
var port = process.env.PORT || 8080;    // Set the port for our app

// APP CONFIGURATION -----------------------
// Use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// Configure our app to handle CORS requests
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, content-type, \Authorization");
  next(); 
});

// Log all request to the console
app.use(morgan("dev"));

// ROUTES FOR OUR API
// ==========================================

// Basic route for the home page
app.get("/", function(req, res) {
  res.send("Welcome to the home page");
});

// Get an instance of the Express router
var apiRouter = express.Router();

// Test route to make sure everything is working
// Accesed at GET http://localhost:8080/api
apiRouter.get("/", function(req, res) {
  res.json({ message: "Horray! Welcome to the API"});
});

// More routes for the API will happen here

// REGISTER OUR ROUTES -----------------------
// All of our routes will be prefixed with /api
app.use("/api", apiRouter);

// START THE SERVER
// ===========================================
app.listen(port);
console.log("Magic happens on port" + port);





