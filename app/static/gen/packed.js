'use strict';var app=angular.module('app',[]).config(['$routeProvider',function($routeProvider,$httpProvider){$routeProvider.when('/',{templateUrl:'/static/partials/home.html',controller:'Main'});$routeProvider.when('/profile',{templateUrl:'/static/partials/profile.html',controller:'Profile'});$routeProvider.when('/login',{templateUrl:'/static/partials/login.html',controller:'Login'});$routeProvider.otherwise({redirectTo:'/'});}]);app.run(function($window,$http,$rootScope,userService){$window.fbAsyncInit=function(){FB.init({appId:'512587888752895', channelUrl:'//www.fafafa.co/static/vendor/channel.html', status:true, cookie:true, xfbml:true
});FB.Event.subscribe('auth.authResponseChange',function(response){if(response.status==='connected'){

FB.api('/me',function(response){userService.fbLogin(response);});}else if(response.status==='not_authorized'){



}else{


}});};(function(d){var js,id='facebook-jssdk',ref=d.getElementsByTagName('script')[0];if(d.getElementById(id)){return;}
js=d.createElement('script');js.id=id;js.async=true;js.src="//connect.facebook.net/en_US/all.js";ref.parentNode.insertBefore(js,ref);}(document));});'use strict';app.service('userService',function($rootScope,$http,$location,$timeout){this.logout=function(){if($rootScope.user.facebook){FB.logout(function(response){});}
$http.post('/user/logout').success(function(data,status,headers,config){$rootScope.user=null;$location.path('/');}).error(function(data,status,headers,config){console.log(status);});}
this.fbLogin=function(response){$rootScope.$apply(function(){ $http.post('/user/fb',{user:response}).success(function(data,status,headers,config){if(data['result']==='success'){$rootScope.user=data['user'];if($location.path()==='/login'){$location.path('/');}}
else{$rootScope.facebook_error=data['error'];$timeout(function(){$rootScope.facebook_error=false;},5000);}}).error(function(data,status,headers,config){console.log(status);});})}});app.service('progressService',function($rootScope,$timeout){var progress;var self=this;var requests=0;this.start=function(iteration){if(arguments.length===0){requests=requests+1;$rootScope.progress=0;$timeout.cancel(progress);}
progress=$timeout(function(){var remaining=100-$rootScope.progress;$rootScope.progress=$rootScope.progress+(0.15*Math.pow(1-Math.sqrt(remaining),2));self.start(true);},200);}
this.complete=function(){requests=requests-1;if(requests===0){$rootScope.progress=100;$timeout.cancel(progress);}}});app.factory('httpInterceptor',function(progressService,$rootScope){return{request:function(config){if(config['method']==='POST'){progressService.start();}
return config;},response:function(response){if(response['config']['method']==='POST'){progressService.complete();}
return response;},responseError:function(response){if(response['config']['method']==='POST'){progressService.complete();return response;}}};});app.config(function($httpProvider){$httpProvider.interceptors.push('httpInterceptor');});'use strict';app.controller('Main',function(){});app.controller('Header',function($rootScope){$rootScope.progress=100;});app.controller('Profile',function($scope,$http,$rootScope,$timeout,$location,userService){$scope.password_changed=false;if(!($rootScope.user)){$location.path('login');}
$scope.new_password=function(){if($scope.new_password_form.password1==$scope.new_password_form.password2&&$scope.new_password_form.password1.length>3){$scope.password_error=false;$http.post('/user/password',$scope.new_password_form).success(function(data,status,headers,config){if(data['result']=='error'){$scope.password_error=true;}
else{$rootScope.user=data['user'];$scope.password_changed=true;$timeout(function(){$scope.password_changed=false;},5000);}}).error(function(data,status,headers,config){console.log(status);});}}
$scope.new_info=function(){if($rootScope.user.email&&$rootScope.user.username){$scope.info_changed=false;$http.post('/user/change',{user:$rootScope.user}).success(function(data,status,headers,config){$scope.change_errors=[];if(data['result']=='error'){if(data['exists']){$scope.change_errors.push("Username or email already exists");}
else{var errors=data['errors'];if(errors['username']){$scope.change_errors.push("Username must be between 3 and 15 characters");}
if(errors['email']){$scope.change_errors.push("Invalid email");}}}
else{$rootScope.user=data['user'];$scope.info_changed=true;$timeout(function(){$scope.info_changed=false;},5000);}}).error(function(data,status,headers,config){console.log(status);});}
else{$scope.change_errors=[];$scope.change_errors.push('Please enter a valid username and email');}}
$scope.logout=function($scope){userService.logout();}
$scope.FBLink=function(){FB.login(function(response){},{scope:'email'});}
$scope.FBUnlink=function(){FB.api('/me/permissions','DELETE',function(response){});if($rootScope.user.password){$http.post('/user/fb/unlink').success(function(data,status,headers,config){if(data['result']=='error'){$scope.need_password=true;}
else{$scope.need_password=false;$rootScope.user=data['user']}}).error(function(data,status,headers,config){console.log(status);});}
else{$scope.need_password=true;}}})
app.controller('Login',function($scope,$http,$rootScope,$location){if($rootScope.user){$location.path('/');}
$scope.login=function(){if($scope.login_form){if($scope.login_form.email&&$scope.login_form.password){$http.post('/user/login',$scope.login_form).success(function(data,status,headers,config){if(data['result']==='error'){$scope.login_errors=[];if(data['error']==='password'){$scope.login_errors.push('Incorrect password');}
else if(data['error']==='not_found'){$scope.login_errors.push('Email not found');}
else if(data['error']==='fb'){$scope.login_errors.push('Please login with Facebook');}}
else{$rootScope.user=data['user'];$location.path('/');}}).error(function(data,status,headers,config){console.log(status);});}
else{$scope.login_errors=[];$scope.login_errors.push('Please enter a valid email and password');}}
else{$scope.login_errors=[];$scope.login_errors.push('Please enter a valid email and password');}}
$scope.FBLogin=function(){FB.login(function(response){},{scope:'email'});}
$scope.signUp=function(){if($scope.signup_form.username&&$scope.signup_form.email&&$scope.signup_form.password){$http.post('/user/register',$scope.signup_form).success(function(data,status,headers,config){if(data['result']=='error'){$scope.signup_errors=[];if(data['email']){$scope.signup_errors.push('Invalid email');}
if(data['exists']){$scope.signup_errors.push('Username or email already exists');}
if(data['password']){$scope.signup_errors.push('Password must be greater than 3 characters');}
if(data['username']){$scope.signup_errors.push('Username must be between 3 and 15 characters');}}
else{$rootScope.user=data['user'];$location.path('/');}}).error(function(data,status,headers,config){console.log(status);});}}});