'use strict';

/* Services */

app.service('userService', function($rootScope, $http, $location, $timeout) {
	this.logout = function() {
		if ($rootScope.user.facebook) {
			FB.logout(function(response) {});
		}
		$http.post('/user/logout')
			.success(function(data, status, headers, config) {
				$rootScope.user = null; 
				$location.path('/');
			})
			.error(function(data, status, headers, config) {
				console.log(status);
			});
	}

	this.fbLogin = function(response) {
		$rootScope.$apply(function() {
			// http://stackoverflow.com/questions/16299362/angular-js-http-post-not-working-no-error
			$http.post('/user/fb', {user:response})
			.success(function(data, status, headers, config) {
				if (data['result'] === 'success') {
					$rootScope.user = data['user'];
					if ($location.path() === '/login') {
						$location.path('/');
					}
				}
				else {
					$rootScope.facebook_error = data['error'];
                    $timeout(function() {
                        $rootScope.facebook_error = false;
                    }, 5000);  
				}

			})
			.error(function(data, status, headers, config) {
				console.log(status);
			});
		})

	}
});

app.service('progressService', function($rootScope, $timeout) {
	var progress;
	var self = this;
	var requests = 0;

	this.start = function(iteration) {
		if (arguments.length === 0) {
			/*
			New posts call this function without the iteration parameter. 
			In this case, stop any previous progress calculations, and start fresh 
			*/
			requests = requests + 1;
			$rootScope.progress = 0;
			$timeout.cancel(progress);
		}

		progress = $timeout(function() {
			var remaining = 100 - $rootScope.progress;
			$rootScope.progress = $rootScope.progress + (0.15 * Math.pow(1 - Math.sqrt(remaining), 2));		
			self.start(true);
		}, 200);
	}

	this.complete = function() {
		// One request has completed. If there are none left, set progress to 100;
		requests = requests - 1;
		if (requests === 0) {
			$rootScope.progress = 100;
			$timeout.cancel(progress);
		}
	}
});

app.factory('httpInterceptor', function (progressService, $rootScope) {
    return {
        request: function (config) {
        	if (config['method'] === 'POST') {
	        	progressService.start();
        	}
        	return config;
        },
        response: function (response) {
        	if (response['config']['method'] === 'POST') {
	        	progressService.complete();
        	}
            return response;
        },
        responseError: function (response) {
        	if (response['config']['method'] === 'POST') {
        		progressService.complete();
            	return response;
            }
        }
    };
});
app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
});
