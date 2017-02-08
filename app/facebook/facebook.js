'use strict';

angular.module('ngSocial.facebook', ['ngRoute','ngFacebook','ngSanitize'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/facebook', {
    templateUrl: 'facebook/facebook.html',
    controller: 'FacebookCtrl'
  });
}])
 
.config( function( $facebookProvider ) {
    // setting facebook app id
    $facebookProvider.setAppId('1296023090411218');
    //setting facebbok permissions
    $facebookProvider.setPermissions("user_videos, user_birthday,email,public_profile,user_about_me,user_posts,publish_actions,user_photos,user_location");
}) 


.controller('FacebookCtrl', ['$scope','$sce','$facebook', function($scope, $sce, $facebook) {
    $scope.isLoggedIn = false;
    var accessToken = localStorage.getItem('accessToken');
    var resAuthResponse = '';
    
    //login in app 
    $scope.login = function(){
        $facebook.login().then(function(res){
            if(res.status == 'connected'){
                localStorage.setItem('accessToken', res.authResponse.accessToken);
                accessToken = localStorage.getItem('accessToken');
                resAuthResponse = res.authResponse;
                // after successfull login 
                refresh();
            }
        },function(err){
            console.log("loginError",err)
        });
    }   

    function refresh(){
        var url_me = 'https://graph.facebook.com/v2.8/me?access_token='+accessToken;
        $facebook.api('/me?access_token='+accessToken,{ locale: 'en_US', fields: 'birthday, albums, name, email, first_name, last_name, location, gender, religion, about, link'}).then(function(res){
            $scope.welcomeMsg = "Welecome:" + res.name;
            $scope.userInfo = res;
            // profile pic by passing type
            //$scope.userInfo.profilePicURL = 'https://graph.facebook.com/'+ res.id +'/picture?type=large'
            $scope.isLoggedIn = true;   
            localStorage.setItem('isLoggedIn', true);
            // get profile pic
            $facebook.api('/me/picture?access_token='+accessToken).then(function(response){
                $scope.userInfo.profilePicURL = response.data.url;
            });

            // get facebook posts
            $facebook.api('/me/posts?access_token='+accessToken).then(function(posts){
                $scope.arrPosts = posts.data;
            });

            // show permissions
            $facebook.api('me/permissions?access_token='+accessToken).then(function(response){
                $scope.arrPermissions = response.data;
            }); 
            console.log("lOGGED IN"); 
        },function(err){
            console.log("err",err);
            $scope.welcomeMsg = "";
        })
    } 

    // logout from app
    $scope.logout = function(){ 
        $facebook.logout().then(function(){
            $scope.isLoggedIn = false;
            $scope.hasAccessToken = false;
            localStorage.setItem("isLoggedIn", false);
            localStorage.removeItem('accessToken');
            $scope.welcomeMsg = "";
            console.log("lOGGED OUT");
        });
    };

    // post the status
    $scope.postStatus = function(){
        var body = this.body;
        $facebook.api('/me/feed?access_token='+accessToken, 'post', {message: body}).then(function(response){
            $scope.msg = 'Thanks for Posting.';
            refresh();
        });
    };

    // for trusted html
    $scope.trustAsHtml = function(html){
        return $sce.trustAsHtml(html);
    }
     
    if(accessToken){
        $scope.login();
        $scope.hasAccessToken = true;
        refresh();
    };
}]);