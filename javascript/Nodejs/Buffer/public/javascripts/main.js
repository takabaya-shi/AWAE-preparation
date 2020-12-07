var passwordApp = angular.module('passwordApp', []);

passwordApp.controller('PasswordCtrl', function ($scope, $http, $window) {
  $scope.password = '';
  $scope.login = {};

  $scope.enter_password = function() {
    $http.post('/login', {password: $scope.password}).then(function(response) {
            console.log(response.data);
            if(response.data.status === 'ok') {
                $window.location.href = "/admin";
            }
            $scope.login = response.data;
        }, function(response) {
            console.log(response.data);
            $scope.login = response.data;
        });
    }

    $scope.logout = function() {
        $http.get('/logout').then(function(response) {
            if(response.data.status === 'ok') {
                $window.location.href = "/admin";
            }
        }, function(response) { });
    }

  

});