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
  /* Definição e variáveis */
  $scope.serverName = ServerName.get();
  $scope.detail = {};
  /* Carrega informações da foto */
  var photo = Photos.get($stateParams.photoId);
  photo.then(function(result){
    $scope.photo = result;
  })
  /* Carrega avaliação do usuário atual da foto */
  var evaluation = Photos.getEvaluation($stateParams.photoId, window.localStorage.getItem("user_id"));
  evaluation.then(function(result){
    $scope.binomials = result;
    $scope.detail.personal = result[0]["knownArchitecture"];
    $scope.detail.local = result[0]["areArchitecture"];
  })
  /* Envia avaliação da foto */
  $scope.postEvaluation = function() {
    var x;
    var data = {};
    for(x in $scope.binomials) {
      data[$scope.binomials[x].id.toString()] = document.getElementById($scope.binomials[x].id.toString()).value.toString();
    }
    if($scope.detail.personal == "yes") {
      data["knownArchitecture"] = "yes";
    }
    else {
      data["knownArchitecture"] = "no";
    }
    if($scope.detail.local == "yes") {
      data["areArchitecture"] = "yes";
    }
    else {
      data["areArchitecture"] = "no";
    }
    var evaluation = Photos.postEvaluation($stateParams.photoId, window.localStorage.getItem("user_id"), data);
  }
  /* Exibe informações da foto */
  $scope.showInformation = function() {
    document.getElementById("info-container").style.display = "initial";
    document.getElementById("evaluation-container").style.display = "none";
  }
  /* Exibe binômios para avaliação */
  $scope.showEvaluation = function() {
    document.getElementById("info-container").style.display = "none";
    document.getElementById("evaluation-container").style.display = "initial";
  }
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
  $scope.moreUploadsCanBeLoaded = true;
  $scope.moreEvaluationsCanBeLoaded = true;
  $scope.uploadsShowing = true;
  $scope.evaluationsShowing = false;
  var maxIdUpload = 0;
  var maxIdEvaluation = 0;
  
  /* Pega os dados do usuário */
  var account = Profiles.getProfile(window.localStorage.getItem("user_id"));
  account.then(function(result){
    $scope.account = result;
  });

  /* Exibe avaliações */
  $scope.showEvaluations = function() {
    document.getElementById("evaluations").style.display = "initial";
    document.getElementById("uploads").style.display = "none";
    $scope.evaluationsShowing = true;
    $scope.uploadsShowing = false;
  }

  /* Exibe uploads */
  $scope.showUploads = function() {
    document.getElementById("uploads").style.display = "initial";
    document.getElementById("evaluations").style.display = "none";
    $scope.evaluationsShowing = false;
    $scope.uploadsShowing = true;
  }
  
  /* Pega as fotos do usuário */
  var user_photos = Profiles.getPhotos(window.localStorage.getItem("user_id"));
  user_photos.then(function(result){
    $scope.photos = result;
    maxIdUpload = result[result.length-1].id;
    if (result.length < 20) {
      $scope.moreUploadsCanBeLoaded = false;
    }
  });

  /* Pega as avaliações do usuário */
  var user_evaluated_photos = Profiles.getEvaluatedPhotos(window.localStorage.getItem("user_id"));
  user_evaluated_photos.then(function(result){
    $scope.evaluations = result["photos"];
    maxIdEvaluation = result["max_id"];
    if (result["photos"].length < 20) {
      $scope.moreEvaluationsCanBeLoaded = false;
    }
  });

  /* Carrega mais fotos do usuário */
  $scope.loadMorePhotos = function() {
    Profiles.getMorePhotos(window.localStorage.getItem("user_id"), maxIdUpload).then(function(result){
      maxIdUpload = result[result.length-1].id;
      $scope.photos = $scope.photos.concat(result);
      if (result.length < 20) {
        $scope.moreUploadsCanBeLoaded = false;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  }

  /* Carrega mais avaliações de usuário */
  $scope.loadMoreEvaluations = function() {
    Profiles.getMoreEvaluatedPhotos(window.localStorage.getItem("user_id"), maxIdEvaluation).then(function(result){
      maxIdEvaluation = result["max_id"];
      $scope.evaluations = $scope.evaluations.concat(result["photos"]);
      if (result["photos"].length < 20) {
        $scope.moreEvaluationsCanBeLoaded = false;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  }

  /* Atualiza as fotos e avaliações do usuário */
  $scope.doRefresh = function() {
    $scope.moreUploadsCanBeLoaded = true;
    $scope.moreEvaluationsCanBeLoaded = true;
    Profiles.getPhotos(window.localStorage.getItem("user_id")).then(function(result){
      $scope.photos = result;
      maxIdUpload = result[result.length-1].id;
      if (result.length < 20) {
        $scope.moreUploadsCanBeLoaded = false;
      }
    });
    Profiles.getEvaluatedPhotos(window.localStorage.getItem("user_id")).then(function(result){
      $scope.evaluations = result["photos"];
      maxIdEvaluation = result["max_id"];
      if (result["photos"].length < 20) {
        $scope.moreEvaluationsCanBeLoaded = false;
      }
    })
    .finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
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

.controller('UserFollowersCtrl', function($scope, $http, $stateParams, ServerName, Profiles) {
  $scope.serverName = ServerName.get();
  var followers = Profiles.getFollowers($stateParams.userId);
  followers.then(function(result){
    $scope.followers = result;
  })
})

.controller('UserFollowingCtrl', function($scope, $http, $stateParams, ServerName, Profiles) {
  $scope.serverName = ServerName.get();
  var following = Profiles.getFollowing($stateParams.userId);
  following.then(function(result){
    $scope.following = result;
  })
})

.controller('CameraCtrl', function($scope, $http, ServerName, Camera) {
  $scope.hideData = true;

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
  $scope.data = {};
  $scope.postPhoto = function(){
    
    var address = ServerName.get() + "/photos";

    console.log($scope.data.title);

    // $http.post(address, {
    //   photo_name:  $scope.data.title,
    //   photo_imageAuthor: $scope.data.author,
    //   tags: $scope.data.tags,
    //   photo_country: $scope.data.country
    // }).then(function(response){
    //   $scope.response = response;
    // });
  };
});
