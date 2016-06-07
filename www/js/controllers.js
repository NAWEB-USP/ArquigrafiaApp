angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, LoginService, ServerName, $ionicPopup, $state, $ionicLoading) {
    $scope.show = function() {
    $ionicLoading.show({
        template: '<p>Carregando...</p><ion-spinner></ion-spinner>'
      });
    };

    $scope.hide = function(){
      $ionicLoading.hide();
    };

    $scope.serverName = ServerName.get();

    $scope.data = {};
    $scope.login = function() {
        $scope.show($ionicLoading);
        LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
            window.localStorage.setItem("logged_user", data.login);
            window.localStorage.setItem(data.login, data.token);
            window.localStorage.setItem("user_id", data.id);
            $state.go('tab.dash');
        }).error(function(data) {
            var alertPopup = $ionicPopup.alert({
                title: 'Falha no login!',
                template: 'Usuário ou senha incorretos!'
            });
        }).finally(function($ionicLoading) { 
          $scope.hide($ionicLoading);  
        });
    }
})

.controller('FeedCtrl', function($scope, Feed, ServerName, $http, $state) {
  $scope.$on('$ionicView.enter', function() {
    if(window.localStorage.getItem("logged_user") == null) {
      $state.go('login');
    }
  })
  var user = Feed.get(window.localStorage.getItem("user_id"));
  user.then(function(result){
    $scope.photos = result;
  });
  $scope.serverName = ServerName.get();
})

.controller('PhotosCtrl', function($scope, Photos, ServerName, $http, $state) {
  $scope.$on('$ionicView.enter', function() {
    if(window.localStorage.getItem("logged_user") == null) {
      $state.go('login');
    }
  })
    var photos = Photos.all();
    photos.then(function(result){
      $scope.photos = result;
    });
  $scope.remove = function(photo) {
    Photos.remove(photo);
  };
  $scope.serverName = ServerName.get();
})

.controller('PhotoDetailCtrl', function($scope, $http, $stateParams, Photos, ServerName) {
  $scope.serverName = ServerName.get();
  var photo = Photos.get($stateParams.photoId);
  photo.then(function(result){
    $scope.photo = result;
  })
})

.controller('AccountCtrl', function($scope, $http, $state, User, Profiles, ServerName) {
  $scope.$on('$ionicView.enter', function() {
    if(window.localStorage.getItem("logged_user") == null) {
      $state.go('login');
    }
    // window.localStorage.removeItem(window.localStorage.getItem("logged_user"));
    // window.localStorage.removeItem("logged_user");
  })

  $scope.serverName = ServerName.get();
  
  var account = Profiles.get(window.localStorage.getItem("logged_user"));
  account.then(function(result){
    $scope.account = result;
  });
  
  var user_photos = User.allPhotos(window.localStorage.getItem("user_id"));
  user_photos.then(function(result){
    $scope.user_photos = result;
  });

})

.controller('CameraCtrl', function($scope, ServerName, Camera) {

  $scope.takePicture = function(options) {
    var options = {
      quality: 50,
      targetWidth: 200,
      targetHeight: 200,
      sourceType: 1
    };

    Camera.getPicture(options).then(function(imageData) {
      $scope.picture = imageData;
    }, function(error) {
      console.log(error) 
    });
  };

  $scope.getPicture = function(options) {
    var options = {
      quality: 50,
      targetWidth: 200,
      targetHeight: 200,
      sourceType: 0
    };

    Camera.getPicture(options).then(function(imageData) {
      $scope.picture = imageData;
      console.log(imageData);
    }, function(error) {
      console.log(error);
    });
  };
});
