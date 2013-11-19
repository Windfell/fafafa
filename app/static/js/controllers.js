'use strict';

/* Controllers */

app.controller('Main', function() {
	
});

app.controller('Header', function($rootScope) {
    $rootScope.progress = 100;

});

app.controller('Profile', function($scope, $http, $rootScope, $timeout, $location, userService) {
    $scope.password_changed = false;

    if (!($rootScope.user)) {
        $location.path('login');
    }

    $scope.new_password = function() {
        if ($scope.new_password_form.password1 == $scope.new_password_form.password2 && $scope.new_password_form.password1.length > 3) {
            $scope.password_error = false;
            $http.post('/user/password', $scope.new_password_form).
            success(function(data, status, headers, config) {
                if (data['result'] == 'error') {
                    $scope.password_error = true;
                }
                else {
                    $rootScope.user = data['user'];
                    $scope.password_changed = true;
                    $timeout(function() {
                        $scope.password_changed = false;
                    }, 5000);                    
                }
            }).
            error(function(data, status, headers, config) {
                console.log(status);
            });
        }
    }

    $scope.new_info = function() {
        if ($rootScope.user.email && $rootScope.user.username) {
            $scope.info_changed = false;
            $http.post('/user/change', {user: $rootScope.user}).
                success(function(data, status, headers, config) {
                    $scope.change_errors= [];
                    if (data['result'] == 'error') {
                        if (data['exists']) {
                            $scope.change_errors.push("Username or email already exists");
                        }
                        else {
                            var errors = data['errors'];
                            if (errors['username']) {
                                $scope.change_errors.push("Username must be between 3 and 15 characters");
                            } 
                            if (errors['email']) {
                                $scope.change_errors.push("Invalid email");
                            }
                        }
                    }
                    else {
                        $rootScope.user = data['user'];
                        $scope.info_changed = true;
                        $timeout(function() {
                            $scope.info_changed = false;
                        }, 5000);                    
                    }
                }).
                error(function(data, status, headers, config) {
                    console.log(status);
                });            
            }
        else {
        	$scope.change_errors = [];
        	$scope.change_errors.push('Please enter a valid username and email');
        }
    }

    $scope.logout = function($scope) {
        userService.logout();
    }

    $scope.FBLink = function() {
        FB.login(function(response) {}, {scope: 'email'});
    }

    $scope.FBUnlink = function() {
        FB.api('/me/permissions', 'DELETE', function(response){});
        if ($rootScope.user.password) {
        	$http.post('/user/fb/unlink').
            success(function(data, status, headers, config) {
                if (data['result'] == 'error') {
                    $scope.need_password = true;
                }
                else {
                    $scope.need_password = false;
                    $rootScope.user = data['user']
                }
            }).
            error(function(data, status, headers, config) {
                console.log(status);
            });
    	}
        else {
        	$scope.need_password = true;
        }
    }
        
})

app.controller('Login', function($scope, $http, $rootScope, $location) {
    if ($rootScope.user) {
        $location.path('/');
    }

    $scope.login = function() {
    	if ($scope.login_form) {
    		if ($scope.login_form.email && $scope.login_form.password) {
	            $http.post('/user/login', $scope.login_form).
	                success(function(data, status, headers, config) {
	                    if (data['result'] === 'error') {
               		    	$scope.login_errors = [];
	                        if (data['error'] === 'password') {
	                            $scope.login_errors.push('Incorrect password');
	                        }
	                        else if (data['error'] === 'not_found') {
	                            $scope.login_errors.push('Email not found');
	                        }
	                        else if (data['error'] === 'fb') {
	                            $scope.login_errors.push('Please login with Facebook');
	                        }
	                    }
	                    else {
	                        $rootScope.user = data['user'];
	                        $location.path('/');
	                    }
	                }).
	                error(function(data, status, headers, config) {
	                    console.log(status);
	                });
		        }
		        else {
      		    	$scope.login_errors = [];
		        	$scope.login_errors.push('Please enter a valid email and password');
		        }	
    	}
    	else {
	    	$scope.login_errors = [];
    		$scope.login_errors.push('Please enter a valid email and password');
    	}
    }


    $scope.FBLogin = function() {
        FB.login(function(response) {}, {scope: 'email'});
    }

    $scope.signUp = function() {
        if ($scope.signup_form.username && $scope.signup_form.email && $scope.signup_form.password) {
            $http.post('/user/register', $scope.signup_form).
                success(function(data, status, headers, config) {
                    if (data['result'] == 'error') {
                        $scope.signup_errors = [];
                        if (data['email']) {
                            $scope.signup_errors.push('Invalid email');
                        }
                        if (data['exists']) {
                            $scope.signup_errors.push('Username or email already exists');
                        }
                        if (data['password']) {
                            $scope.signup_errors.push('Password must be greater than 3 characters');
                        }
                        if (data['username']) {
                            $scope.signup_errors.push('Username must be between 3 and 15 characters');
                        }
                    }
                    else {
                        $rootScope.user = data['user'];
                        $location.path('/');
                    }
                }).
                error(function(data, status, headers, config) {
                    console.log(status);
                });
            }
    }
});