angular.module('starter.controllers', [])

.controller('WelcomeCtrl', function($scope, $state) {
    /* Verifica se o usuário está logado */
    $scope.$on('$ionicView.enter', function() {
      if(window.localStorage.getItem("logged_user") != null) {
        $state.go('tab.dash');
      }
      else {
        $state.go('login');
      }
    })
})

.controller('LoginCtrl', function($scope, LoginService, ServerName, $ionicPopup, $state, $ionicLoading) {
    /* Verifica se o usuário já está logado */
    $scope.$on('$ionicView.enter', function() {
      if(window.localStorage.getItem("logged_user") != null) {
        $state.go('tab.dash');
      }
    })
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
            $state.go('tab.dash', {}, {reload: true});
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
    maxId = result[result.length-1]['photo'].id;
    if (result.length < 20) {
      $scope.moreDataCanBeLoaded = false;
    }
  });
  /* Adiciona mais fotos ao feed */
  $scope.loadMoreData = function() {
    Feed.more(window.localStorage.getItem("user_id"), maxId).then(function(result){
      maxId = result[result.length-1]['photo'].id;
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
      maxId = result[result.length-1]['photo'].id;
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
    console.log(result);
    $scope.photo = result;
  })
})

.controller('AccountCtrl', function($scope, $http, $state, $timeout, $ionicHistory, Profiles, ServerName, LoginService) {
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
  
  /* Pega os dados do usuário */
  var account = Profiles.getProfile(window.localStorage.getItem("user_id"));
  account.then(function(result){
    $scope.account = result;
  });
  
  /* Pega as fotos do usuário */
  var user_photos = Profiles.getPhotos(window.localStorage.getItem("user_id"));
  user_photos.then(function(result){
    $scope.photos = result;
    maxId = result[result.length-1].id;
    if (result.length < 20) {
      $scope.moreDataCanBeLoaded = false;
    }
  });

  /* Carrega mais fotos do usuário */
  $scope.loadMorePhotos = function() {
    Profiles.getMorePhotos(window.localStorage.getItem("user_id"), maxId).then(function(result){
      maxId = result[result.length-1].id;
      $scope.photos = $scope.photos.concat(result);
      if (result.length < 20) {
        $scope.moreDataCanBeLoaded = false;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  }

  /* Atualiza as fotos do usuário */
  $scope.doRefresh = function() {
    $scope.moreDataCanBeLoaded = true;
    Profiles.getPhotos(window.localStorage.getItem("user_id")).then(function(result){
      $scope.photos = result;
      maxId = result[result.length-1].id;
      if (result.length < 20) {
        $scope.moreDataCanBeLoaded = false;
      }
    })
    .finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });;
  }

  /* Desloga o usuário */
  $scope.logout = function() {
    window.localStorage.removeItem(window.localStorage.getItem("logged_user"));
    window.localStorage.removeItem("logged_user");
    window.localStorage.removeItem("user_id");
    $ionicHistory.clearHistory();
    $ionicHistory.clearCache().then(function(){ $state.go('login', {}, {reload: true}) });
  }
})

.controller('CameraCtrl', function($scope, $http, ServerName, Tags, Camera) {
  $scope.hideData = true;
  var tags = Tags.all();
  tags.then(function(result){
    $scope.tags = result;
  });

  $scope.forward = function() {
    $scope.hideData = false;
  }

  $scope.back = function() {
    $scope.hideData = true;
  }

  $scope.takePicture = function(options) {
    var optionsTake = {
      quality: 70,
      destinationType: navigator.camera.DestinationType.NATIVE_URI,
      sourceType: navigator.camera.PictureSourceType.CAMERA,
      encodingType: navigator.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false //para testes nao ocuparem mta memoria, para release colocar true
    };

    navigator.camera.getPicture(function (imageURI) {
      $scope.$apply(function() {
        $scope.imageURI = imageURI;
      });

    }, function(error) {
      console.log(error) 
    }, optionsTake);
  };

  $scope.getPicture = function(options) {
    var optionsGet = {
      quality: 70,
      destinationType: navigator.camera.DestinationType.NATIVE_URI,
      sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
      encodingType: navigator.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false
    };

    navigator.camera.getPicture(function (imageURI) {
      $scope.$apply(function() {
        $scope.imageURI = imageURI;
      });

    }, function(error) {
      console.log(error);
    }, optionsGet);
  };

  $scope.showTags - function(select){
    console.log(select);
  };

  $scope.data = {};
  $scope.postPhoto = function(){
    
    var address = ServerName.get() + "/api/photos";

    console.log($scope.data.title);

    $http.post(address, {
      photo_allowCommercialUses: $scope.data.commercialUsage,
      photo_allowModifications: $scope.data.modifications,
      photo_name:  $scope.data.title,
      photo_imageAuthor: $scope.data.author,
      tags: $scope.data.tags,
      photo_country: $scope.data.country,
      photo_city: $scope.data.city,
      photo_description: $scope.data.description,
      photo_district: $scope.data.disctrict,
      photo_state: $scope.data.state,
      photo_street: $scope.data.address,
      authorized: $scope.data.authorized
    }).then(function(response){
      $scope.response = response;
    });
  };
});
