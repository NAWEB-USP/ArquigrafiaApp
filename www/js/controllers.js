angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, LoginService, ServerName, $ionicPopup, $state, $ionicLoading) {
    /* Mostra spinner */
    $scope.show = function() {
    $ionicLoading.show({
        template: '<p>Carregando...</p><ion-spinner></ion-spinner>'
      });
    };
    /* Esconde o spinner */
    $scope.hide = function(){
      $ionicLoading.hide();
    };

    $scope.serverName = ServerName.get();
    $scope.data = {};
    /* Faz o login */
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
  /* Verifica se o usuário está logado */
  $scope.$on('$ionicView.enter', function() {
    if(window.localStorage.getItem("logged_user") == null) {
      $state.go('login');
    }
  })
  /* Definição de variáveis */
  $scope.serverName = ServerName.get();
  $scope.moreDataCanBeLoaded = true;
  var maxId = 0;
  /* Carrega o feed inicial */
  Feed.get(window.localStorage.getItem("user_id")).then(function(result){
    $scope.photos = result;
    maxId = result[result.length-1].photo_id;
    if (result.length < 20) {
      $scope.moreDataCanBeLoaded = false;
    }
  });
  /* Adiciona mais fotos ao feed */
  $scope.loadMoreData = function() {
    Feed.more(window.localStorage.getItem("user_id"), maxId).then(function(result){
      maxId = result[result.length-1].photo_id;
      $scope.photos = $scope.photos.concat(result);
      if (result.length < 20) {
        $scope.moreDataCanBeLoaded = false;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  }
  /* Atualiza o feed */
  $scope.doRefresh = function() {
    $scope.moreDataCanBeLoaded = true;
    Feed.get(window.localStorage.getItem("user_id")).then(function(result){
      $scope.photos = result;
      maxId = result[result.length-1].photo_id;
      if (result.length < 20) {
        $scope.moreDataCanBeLoaded = false;
      }
    })
    .finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });;
  }
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
      $scope.pictureURI = imageData;
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
      $scope.pictureURI = "data:image/jpeg;base64," + imageData;
      console.log($scope.pictureURI);
    }, function(error) {
      console.log(error);
    });
  };
});
