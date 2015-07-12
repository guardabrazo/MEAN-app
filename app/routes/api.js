var User = require("../models/user");
var jwt = require("jsonwebtoken");
var config = require("../../config");

// Super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {
  // Get an instance of the Express router
  var apiRouter = express.Router();

  // Route for authenticating a user (POST http://localhost:8080/api/authenticate)
  apiRouter.post("/authenticate", function(req, res) {

    // Find the user
    // Select the name username and password explicitly
    User.findOne({
      username: req.body.username
    }).select("name username password").exec(function(err, user) {
      if (err) {
        throw err;
      }
      // No user with that username was found
      if (!user) {
        res.json({
          success: false,
          message: "Authentication failed. User not found"
        });
      }else if (user) {
        // Check if password matches
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
          res.json({
            success: false,
            message: "Authentication failed. Wrong password"
          });
        }else{
          // If user is found and password is right
          var token = jwt.sign({
            name: user.name,
            username: user.username
          }, superSecret, {
            expiresInMinutes: 1440 //Expires in 24 hours
          });

          // Return the information including token as JSON
          res.json({
            success: true,
            message: "Enjoy your token!",
            token: token
          });
        }
      }
    });
  });


  // Middleware to use for all requests
  apiRouter.use(function(req, res, next) {
    
    // Check header or url parameter or post parameters for token
    var token = req.body.token || req.param("token") || req.headers["x-access-token"];

    // Decode token
    if (token) {
      // Verifies secret and checks exp
      jwt.verify(token, superSecret, function(err, decoded) {
        if (err) {
          return res.status(403).send({
            success: false,
            message: "Failed to authenticate token"
          });
        } else {
          // If everything is good, save to request for use in other routes
          req.decoded = decoded;

          next();
        }
      });
    } else {
      // If there is no token
      // Return an HTTP response of 403 (acces forbidden) and error message
      return res.status(403).send({
        success: false,
        message: "No token provided"
      });
    }

  });

  // Test route to make sure everything is working
  // Accesed at GET http://localhost:8080/api
  apiRouter.get("/", function(req, res) {
    res.json({ message: "Horray! Welcome to the API"});
  });

  // API endpoint to get user information
  apiRouter.get("/me", function(req, res) {
    res.send(req.decoded);
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

  return apiRouter;

};