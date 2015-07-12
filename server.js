// BASE SETUP
// =========================================

// CALL THE PACKAGES -----------------------
var express = require("express");       // Call express
var app = express();                    // Define our app using express
var bodyParser = require("body-parser");// Get body-parser
var morgan = require("morgan");         // Used to see requests
var mongoose = require("mongoose");     // To work with the database
var config = require("./config");
var path = require("path");

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

// Log all requests to the console
app.use(morgan("dev"));

// Connect to our database (hosted on modulus.io)
mongoose.connect(config.database);

// Set static files location
// Used for request that our frontend will make
app.use(express.static(__dirname + "/public"));

// ROUTES FOR OUR API
// ==========================================
var apiRoutes = require("./app/routes/api")(app, express);
app.use("/api", apiRoutes);

// MAIN CATCHALL ROUTE -----------------------
// SEND USERS TO FRONTEND --------------------
// Has to be registered after API ROUTES
app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/app/views/index.html"));
});

// START THE SERVER
// ===========================================
app.listen(config.port);
console.log("Magic happens on port " + config.port);





