'use strict';

// Declare app level module which depends on filters, and services

var app = angular.module('app', []).
config(['$routeProvider', function($routeProvider, $httpProvider) {
	$routeProvider.when('/', {templateUrl: '/static/partials/home.html', controller: 'Main'});
  $routeProvider.when('/profile', {templateUrl: '/static/partials/profile.html', controller: 'Profile'});
  $routeProvider.when('/login', {templateUrl: '/static/partials/login.html', controller: 'Login'});
	$routeProvider.otherwise({redirectTo: '/'});
}]);

app.run(function($window, $http, $rootScope, userService) {
	$window.fbAsyncInit = function() {
		FB.init({
      appId      : '512587888752895', // App ID
      channelUrl : '//www.fafafa.co/static/vendor/channel.html', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

      FB.Event.subscribe('auth.authResponseChange', function(response) {
        // Here we specify what we do with the response anytime this event occurs. 
        if (response.status === 'connected') {
          // The response object is returned with a status field that lets the app know the current
          // login status of the person. In this case, we're handling the situation where they 
          // have logged in to the app.
          FB.api('/me', function(response) {
            userService.fbLogin(response);
        });
      } else if (response.status === 'not_authorized') {
        // In this case, the person is logged into Facebook, but not into the app, so we call
        // FB.login() to prompt them to do so. 
        // In real-life usage, you wouldn't want to immediately prompt someone to login 
        // like this, for two reasons:
        // (1) JavaScript created popup windows are blocked by most browsers unless they 
        // result from direct interaction from people using the app (such as a mouse click)
        // (2) it is a bad experience to be continually prompted to login upon page load.
        // FB.login();
      } else {
        // In this case, the person is not logged into Facebook, so we call the login() 
        // function to prompt them to do so. Note that at this stage there is no indication
        // of whether they are logged into the app. If they aren't then they'll see the Login
        // dialog right after they log in to Facebook. 
        // The same caveats as above apply to the FB.login() call here.
        // FB.login();
      }
    });
  };

  // Load the SDK asynchronously
  (function(d){
  	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
  	if (d.getElementById(id)) {return;}
  	js = d.createElement('script'); js.id = id; js.async = true;
  	js.src = "//connect.facebook.net/en_US/all.js";
  	ref.parentNode.insertBefore(js, ref);
  }(document));

  });