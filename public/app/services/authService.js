angular.module("authService", [])

  // ============================================
  // Factory for handling tokens
  // Inject $window to store token client-side
  // ============================================
  .factory("AuthToken", function($window) {

    var authTokenFactory = {};

    // Get the token out of local storage
    authTokenFactory.getToken = function() {
      return $window.localStorage.getItem("token");
    };

    // Function to set token or clear token
    // If a token is passed, set the token
    // If there is no token, clear it from local storage
    authTokenFactory.setToken = function(token) {
      if (token) {
        $window.localStorage.setItem("token", token);
      } else {
        $window.localStorage.removeItem("token");
      }
    };

    return authTokenFactory;

  })

  // =============================================
  // Auth factory to login and get information
  // Inject $http for communicating with the API
  // Inject $q to return promise objects
  // Inject AuthToken to manage tokens
  // =============================================
  .factory("Auth", function($http, $q, AuthToken) {

    // Create auth factory object
    var authFactory = {};

    // Log a user in
    authFactory.login = function(username, password) {
      // Return the promise object and its data
      return $http.post("/api/authenticate", {
        username: username,
        password: password
      })
        .success(function(data) {
          AuthToken.setToken(data.token);
          return data;
        });
    };

    // Log a user out by clearing the token
    authFactory.logout = function() {
      // Clear the token
      AuthToken.setToken();
    };

    // Check if a user is logged in
    // Checks if there is a local token
    authFactory.isLoggedIn = function() {
      if (AuthToken.getToken()) {
        return true;
      } else {
        return false;
      }
    };

    // Get the logged in user
    authFactory.getUser = function() {
      if (AuthToken.getToken()) {
        return $http.get("/api/me");
      } else {
        return $q.reject({ message: "User has no token" });
      }
    };

    return authFactory;

  })

  // ===================================================
  // Application configuration to integrate token into requests
  // ===================================================
  .factory("AuthInterceptor", function($q, $location, AuthToken) {

    var interceptorFactory = {};

    // This will happen on all HTTP requests
    interceptorFactory.request = function(config) {

      // Grab the token
      var token = AuthToken.getToken();

      // If the token exists, add it to the header as x-access-token
      if (token) {
        config.headers["x-access-token"] = token;
      }

      return config;
    };

    // Happens on response errors
    interceptorFactory.responseError = function(response) {

      // If our server returns a 403 forbidden response
      if (response.status == 403) {
        AuthToken.setToken();
        $location.path("/login");
      }

      // Return the errors from the server as a promise
      return $q.reject(response);
    };

    return interceptorFactory;
    
  });
