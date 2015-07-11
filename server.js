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

// Connect to our database (hosted on modulus.io)
mongoose.connect("mongodb://node:noder@apollo.modulusmongo.net:27017/pepoZ7oz");

var User = require("./app/models/user");


// ROUTES FOR OUR API
// ==========================================

// Basic route for the home page
app.get("/", function(req, res) {
  res.send("Welcome to the home page");
});

// Get an instance of the Express router
var apiRouter = express.Router();

// Middleware to use for all requests
apiRouter.use(function(req, res, next) {
  // Do logging
  console.log("Somebody just came to our app!");
  // We will add more to the middleware later, this is where we will authenticate users
  next();
});

// Test route to make sure everything is working
// Accesed at GET http://localhost:8080/api
apiRouter.get("/", function(req, res) {
  res.json({ message: "Horray! Welcome to the API"});
});

// On routes that end in /users
// -------------------------------------------
apiRouter.route("/users")
  // Create a user (accessed at POST http://localhost:8080/api/users)
  .post(function(req, res) {
    // Create a new instance of the User model
    var user = new User();
    // Ser the users info (comes from the request)
    user.name = req.body.name;
    user.username = req.body.username;
    user.password = req.body.password;
    // Save the user and check for errors
    user.save(function(err) {
      if (err) {
        // Duplicate entry
        if (err.code == 11000){
          return res.json({ success: false, message: "A user with that username already exists."});
        }else{
          return res.send(err);
        }
      }
      res.json({ message: "User created!"});
    });
  })

  // Get all the users (accesed at GET http://localhost:8080/api/users)
  .get(function(req, res) {
    User.find(function(err, users) {
      if (err) {
        res.send(err);
      }

      // Return the users
      res.json(users);
    });
  });

// On routes that end in /users/:user_id
// ---------------------------------------------
apiRouter.route("/users/:user_id")

  // Get the user with that id
  // (Accesed at GET http://localhost:8080/api/users/:user_id)
  .get(function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
      if (err) {
        res.send(err);
      }
      // Return that user
      res.json(user);
    });
  })

  // Update the user with this id
  // (Accessed at PUT http://localhost:8080/api/users/:user_id)
  .put(function(req, res) {
    // User our user model to find the user we want
    User.findById(req.params.user_id, function(err, user) {
      if (err) {
        res.send(err);
      }
      // Update the user's info only if its new
      if (req.body.name) {
        user.name = req.body.name;
      }
      if (req.body.username) {
        user.username = req.body.username;
      }
      if (req.body.password) {
        user.password = req.body. password;
      }
      // Save the user
      user.save(function(err) {
        if (err) {
          res.send(err);
        }
        res.json({ message: "User updated!" });
      });
    });
  })

  // Delete the user with this id
  .delete(function(req, res) {
    User.remove({
      _id: req.params.user_id
    }, function(err, user) {
      if (err) {
        return res.send(err);
      }
      res.json({ message: "User deleted!"});
    });
  });

// REGISTER OUR ROUTES -----------------------
// All of our routes will be prefixed with /api
app.use("/api", apiRouter);

// START THE SERVER
// ===========================================
app.listen(port);
console.log("Magic happens on port " + port);





