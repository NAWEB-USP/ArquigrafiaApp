angular.module('starter.controllers', ['highcharts-ng'])

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

.controller('SearchCtrl', function($scope, Photos, Search, ServerName, Feed, $http, $state) {
  $scope.$on('$ionicView.enter', function() {
    if(window.localStorage.getItem("logged_user") == null) {
      $state.go('login');
    }
  })
  /* Definição de variáveis */
  $scope.serverName = ServerName.get();
  $scope.moreDataCanBeLoaded = true;
  var maxId = 0;
  /* Mostra as fotos mais recentes */
  Feed.getMostRecent().then(function(result){
    $scope.photos = result;
    maxId = result[result.length-1].id;
    if (result.length < 20) {
      $scope.moreDataCanBeLoaded = false;
    }
  });
  /* Carrega mais fotos recentes */
  $scope.loadMoreData = function() {
    Feed.getMoreMostRecent(maxId).then(function(result){
      maxId = result[result.length-1].id;
      $scope.photos = $scope.photos.concat(result);
      if (result.length < 20) {
        $scope.moreDataCanBeLoaded = false;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  }
  /* Realiza busca */
  $scope.search = function() {
    Search.getSearch().then(function(result){
      $scope.moreDataCanBeLoaded = false;
      $scope.photos = Object.keys(result).map(function(k) { return result[k] }).sort(function(a, b) { return b.id - a.id; });
    }); 
  }
})

.controller('PhotoDetailCtrl', function($scope, $http, $stateParams, $ionicHistory, Photos, ServerName, $state) {
  $scope.serverName = ServerName.get();
  $scope.detail = {};
  /* Carrega informações da foto */
  var photo = Photos.get($stateParams.photoId);
  photo.then(function(result){
    $scope.photo = result;
  })
  /* Retorna para a página anterior */
  $scope.goBack = function() {
    window.history.back();
  };
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
    document.getElementById("photo-info-container").style.display = "initial";
    document.getElementById("evaluation-container").style.display = "none";
    document.getElementById("evaluation-average-container").style.display = "none";
  }
  /* Exibe binômios para avaliação */
  $scope.showEvaluation = function() {
    document.getElementById("photo-info-container").style.display = "none";
    document.getElementById("evaluation-container").style.display = "initial";
    document.getElementById("evaluation-average-container").style.display = "none";
  }
  /* Exibe gráfico com a média das avaliações */
  $scope.showAverage = function() {
    document.getElementById("photo-info-container").style.display = "none";
    document.getElementById("evaluation-container").style.display = "none";
    document.getElementById("evaluation-average-container").style.display = "initial";
  }
  /* Configuração do gráfico com as médias das avaliações */
  var averageEvaluation = Photos.averageEvaluation($stateParams.photoId, window.localStorage.getItem("user_id"));
  var count = 0;
  var l1 = [];
  var l2 = [];
  var tickPos = [];
  var avgData = [];
  var userData = [];
  averageEvaluation.then(function(result){
    var binomials = result["binomials"];
    var average = result["average"];
    var user_evaluation = result["user_evaluation"];
    for (x in binomials) {
      l1.push(binomials[x].firstOption);
      l2.push(binomials[x].secondOption);
      if(typeof average[count] != 'undefined') {
        avgData.push([parseInt(average[count].avgPosition), count]);
      }
      if(typeof user_evaluation[x] != 'undefined') {
        userData.push([parseInt(user_evaluation[x].evaluationPosition), count]);
      }
      tickPos.push(count++);
    }
    $scope.averageData = avgData;
  })
  $scope.chartConfig = {
    options: {
      credits: {
        enabled: false,
      },
      chart: {
        marginRight: 80,
      },
      tooltip: {
        formatter: function() {
          return ''+ l1[this.y] + '-' + l2[this.y] + ': <br>' + this.series.name + '= ' + this.x;
        },
        crosshairs: [true,true]
      }
    },
    title: {
      text: ''
    },
    xAxis: {
      lineColor: '#000',
      min: 0,
      max: 100,
    },
    yAxis: [{
      lineColor: '#000',
      lineWidth: 1,
      tickAmount: count,
      tickPositions: tickPos,
      title: {
        text: ''
      },
      labels: {
        formatter: function() {
          return l1[this.value];
        }
      }
    },
    {
      lineWidth: 1,
      tickAmount: count,
      tickPositions: tickPos,
      opposite: true,
      title: {
        text: ''
      },
      labels: {
        formatter: function() {
          return l2[this.value];
        }
      },
    }],
    series: [{
      data: avgData,
      yAxis: 1,
      name: 'Média',
      marker: {
        symbol: 'circle',
        enabled: true
      },
      color: '#999999',
    },
    {
      data: userData,
      yAxis: 0,              
      name: 'Sua impressão',
      marker: {
        symbol: 'circle',
        enabled: true
      },              
      color: '#000000',
    }]
  }

  /*Operacoes de foto */
  $scope.deletePhoto = function(id) {
    if(confirm("Deseja mesmo deletar esta foto? " + id)) {
      Photos.remove(id).then(function() {
        alert("Foto deletada com sucesso");
        $state.go('tab.dash', {}, {reload: true});
      });
    }
  }

  $scope.editPhoto = function(id) {
    $state.go('tab.edit-photo', {photoId: id});
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
      console.log(result);
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
    LoginService.logoutUser(window.localStorage.getItem("logged_user"), window.localStorage.getItem(window.localStorage.getItem("logged_user"))).then(function(data) {
      window.localStorage.removeItem(window.localStorage.getItem("logged_user"));
      window.localStorage.removeItem("logged_user");
      window.localStorage.removeItem("user_id");
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache().then(function(){ $state.go('login', {}, {reload: true}) });
    })
  }
})

.controller('UserFollowersCtrl', function($scope, $http, $stateParams, ServerName, Profiles) {
  /* Definição de variáveis */
  $scope.serverName = ServerName.get();
  /* Pega as seguidores do usuário */
  var followers = Profiles.getFollowers($stateParams.userId);
  followers.then(function(result){
    $scope.followers = result;
  })
})

.controller('UserFollowingCtrl', function($scope, $http, $stateParams, ServerName, Profiles) {
  /* Definição de variáveis */
  $scope.serverName = ServerName.get();
  /* Pega os seguidos do usuário */
  var following = Profiles.getFollowing($stateParams.userId);
  following.then(function(result){
    $scope.following = result;
  })
})

.controller('CameraCtrl', function($scope, $http, $state, ServerName, Tags, Camera, Geolocation) {
  /* Declaracao de variavel */
  $scope.hideData = true;
  $scope.showAditional = false;
  var longitude = null;
  var latitude = null;
  $scope.data = {};
  $scope.data.tags = [];

  /* Tags */
  var tags = Tags.all();
  tags.then(function(result){
    $scope.tags = result;
  });

  $scope.getTag = function(newValue, oldValue){
    if($scope.data.tags.indexOf(newValue.name) == -1)
      $scope.data.tags.push(newValue.name);
    console.log($scope.data.tags);
  }

  $scope.addTag = function(){
    var tag = prompt("Digite o nome da tag:");
    tag = tag.trim().toLowerCase();
    if($scope.data.tags.indexOf(tag) == -1)
      $scope.data.tags.push(tag);
    console.log($scope.data.tags);
 }

  $scope.removeTag = function(tag){
    var position = $scope.data.tags.indexOf(tag);
    $scope.data.tags.splice(position, 1);
    console.log($scope.data.tags);
  }

  /* Controle de tela */
  $scope.toggle = function() {
    $scope.showAditional = !$scope.showAditional;
  }

  $scope.forward = function() {
    $scope.hideData = false;
  }

  $scope.back = function() {
    $scope.hideData = true;
  }

  //utility funct based on https://en.wikipedia.org/wiki/Geographic_coordinate_conversion
  var convertDegToDec = function(arr) {
      return (arr[0].numerator + arr[1].numerator/60 + (arr[2].numerator/arr[2].denominator)/3600).toFixed(4);
  };

  /* Tirar foto */
  $scope.takePicture = function(options) {
    var optionsTake = {
      quality: 70,
      destinationType: navigator.camera.DestinationType.NATIVE_URI,
      sourceType: navigator.camera.PictureSourceType.CAMERA,
      encodingType: navigator.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false //para testes nao ocuparem mta memoria, para release colocar true
    };

    var onSuccess = function(position){
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      if(latitude != null || longitude != null){
          var result = Geolocation.getAddress(latitude, longitude);
          result.then(function(address){
            $scope.data.country   = address.country;
            $scope.data.city      = address.city;
            $scope.data.district  = address.district;
            $scope.data.state     = address.state;
            $scope.data.address   = address.address;
          }); 
        }
    };
    var onFail = function(error) {
      alert("Code: " + error.code + " Message: " + error.message);
    };

    navigator.camera.getPicture(function (imageURI) {
      
      var geoImage = new Image();
      geoImage.onload = function(){
        navigator.geolocation.getCurrentPosition(onSuccess, onFail);        
      }

      $scope.$apply(function() {
        $scope.imageURI = imageURI;
        geoImage.src = imageURI;
      });

    }, function(error) {
      console.log(error) 
    }, optionsTake);
  };

  /* Selecionar foto */
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
      var geoImage = new Image();
      geoImage.onload = function(){
        EXIF.getData(geoImage, function(){
          longitude = EXIF.getTag(geoImage, "GPSLongitude");
          longitude = convertDegToDec(longitude);
          latitude = EXIF.getTag(geoImage, "GPSLatitude");
          latitude = convertDegToDec(latitude);

          //Coordenadas negativas
          if(EXIF.getTag(this,"GPSLongitudeRef") === "W") longitude = -1 * longitude;
          if(EXIF.getTag(this,"GPSLatitudeRef") === "S") latitude = -1 * latitude;

          if(latitude != null || longitude != null){
            var result = Geolocation.getAddress(latitude, longitude);
            result.then(function(address){
              $scope.data.country   = address.country;
              $scope.data.city      = address.city;
              $scope.data.district  = address.district;
              $scope.data.state     = address.state;
              $scope.data.address   = address.address;
            }); 
          }
        });
      }
      $scope.$apply(function() {
        $scope.imageURI = imageURI;
        geoImage.src = imageURI;
      });

    }, function(error) {
      console.log(error);
    }, optionsGet);
  };

  /* Envio de foto */
  $scope.postPhoto = function(){
    
    var address = ServerName.get() + "/api/photos";
    var image = $scope.imageURI;

    var onSuccess = function(response){
      console.log("Code = " + response.responseCode);
      console.log("Response = " + response.response);
      console.log("Sent = " + response.bytesSent);
      $state.go('tab.photo-detail', {'photoId': response.response});
    };

    var onFail = function(error){
      console.log("Error code = " + error.responseCode);
      console.log("Error source = " + error.source);
      console.log("error target = " + error.target);
      alert("Houve um erro, tente novamente mais tarde");
    };

    var options = new FileUploadOptions();
    

    var params = {};
    params.user_id                   = window.localStorage.getItem("user_id");
    params.photo_allowCommercialUses = $scope.data.commercialUsage;
    params.photo_allowModifications  = $scope.data.modifications;
    params.photo_name                = $scope.data.title;
    params.photo_imageAuthor         = $scope.data.author;
    params.tags                      = $scope.data.tags;
    params.photo_country             = $scope.data.country;
    params.photo_city                = $scope.data.city;
    params.photo_description         = $scope.data.description;
    params.photo_district            = $scope.data.district;
    params.photo_state               = $scope.data.state;
    params.photo_street              = $scope.data.address;
    params.authorized                = $scope.data.authorized;

    options.params = params;
    options.fileKey = "photo";

    var transfer = new FileTransfer();
    transfer.upload(image, address, onSuccess, onFail, options);
  };
})

.controller('EditPhotoCtrl', function($scope, $http, $state, $stateParams, ServerName, Photos, Tags, Camera, Geolocation) {
  /* Definindo variaveis */
  $scope.showAditional = false;
  var longitude = null;
  var latitude = null;
  var editedPhoto = false;
  $scope.data = {};
  $scope.data.tags = [];

  /* Preenchendo campos de photo */
  var photo = Photos.get($stateParams.photoId);
  photo.then(function(result) {
    console.log(result['photo']);
    console.log(result['tags']);
    var photo = result['photo'];
    $scope.imageURI = ServerName.get() + "/arquigrafia-images/" + result['photo'].id + "_home.jpg";

    $scope.data.commercialUsage = (photo.allowCommercialUses == "YES") ? true : false;
    $scope.data.modifications = photo.allowModifications.toLowerCase();
    $scope.data.title = photo.name;
    $scope.data.author = photo.imageAuthor;
    if(typeof result['tags'] != 'undefined')
      $scope.data.tags = result['tags'];
    $scope.data.country = photo.country;
    $scope.data.city = photo.city;
    $scope.data.description = photo.description;
    $scope.data.district = photo.district;
    $scope.data.state = photo.state;
    $scope.data.address = photo.address;
    $scope.data.authorized = (photo.authorized == "1") ? true : false;

    console.log($scope.data);
  })

  /* Tags */
  var tags = Tags.all();
  tags.then(function(result){
    $scope.tags = result;
  });

  $scope.getTag = function(newValue, oldValue){
    if($scope.data.tags.indexOf(newValue.name) == -1)
      $scope.data.tags.push(newValue.name);
    console.log($scope.data.tags);
  }

  $scope.addTag = function(){
    var tag = prompt("Digite o nome da tag:");
    if(tag != null) {
      tag = tag.trim().toLowerCase();
      if($scope.data.tags.indexOf(tag) == -1)
        $scope.data.tags.push(tag);
      console.log($scope.data.tags);
    }
  }

  $scope.removeTag = function(tag){
    var position = $scope.data.tags.indexOf(tag);
    $scope.data.tags.splice(position, 1);
    console.log($scope.data.tags);
  }

  /* Controle de tela */
  $scope.toggle = function() {
    $scope.showAditional = !$scope.showAditional;
  }

  $scope.forward = function() {
    $scope.hideData = false;
  }

  $scope.back = function() {
    $scope.hideData = true;
  }

  /* Tirar foto */
  $scope.takePicture = function(options) {
    var optionsTake = {
      quality: 70,
      destinationType: navigator.camera.DestinationType.NATIVE_URI,
      sourceType: navigator.camera.PictureSourceType.CAMERA,
      encodingType: navigator.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false //para testes nao ocuparem mta memoria, para release colocar true
    };

    var onSuccess = function(position){
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      if(latitude != null || longitude != null){
          var result = Geolocation.getAddress(latitude, longitude);
          result.then(function(address){
            $scope.data.country   = address.country;
            $scope.data.city      = address.city;
            $scope.data.district  = address.district;
            $scope.data.state     = address.state;
            $scope.data.address   = address.address;
          }); 
        }
    };
    var onFail = function(error) {
      alert("Code: " + error.code + " Message: " + error.message);
    };

    navigator.camera.getPicture(function (imageURI) {
      
      var geoImage = new Image();
      geoImage.onload = function(){
        navigator.geolocation.getCurrentPosition(onSuccess, onFail);
      }

      $scope.$apply(function() {
        $scope.imageURI = imageURI;
        geoImage.src = imageURI;
        editedPhoto = true;
      });

    }, function(error) {
      console.log(error) 
    }, optionsTake);
  };

  /* Selecionar foto */
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
      var geoImage = new Image();
      geoImage.onload = function(){
        EXIF.getData(geoImage, function(){
          longitude = EXIF.getTag(geoImage, "GPSLongitude");
          longitude = convertDegToDec(longitude);
          latitude = EXIF.getTag(geoImage, "GPSLatitude");
          latitude = convertDegToDec(latitude);

          //Coordenadas negativas
          if(EXIF.getTag(this,"GPSLongitudeRef") === "W") longitude = -1 * longitude;
          if(EXIF.getTag(this,"GPSLatitudeRef") === "S") latitude = -1 * latitude;

          if(latitude != null || longitude != null){
            var result = Geolocation.getAddress(latitude, longitude);
            result.then(function(address){
              $scope.data.country   = address.country;
              $scope.data.city      = address.city;
              $scope.data.district  = address.district;
              $scope.data.state     = address.state;
              $scope.data.address   = address.address;
            }); 
          }
        });
      }
      $scope.$apply(function() {
        $scope.imageURI = imageURI;
        geoImage.src = imageURI;
        editedPhoto = true;
      });

    }, function(error) {
      console.log(error);
    }, optionsGet);
  };

  /* Envio de foto */
  $scope.postPhoto = function(){
    
    var address = ServerName.get() + "/api/photos/" + $stateParams.photoId;
    console.log(address);
    var image = $scope.imageURI;

    var onSuccess = function(response){
      console.log("Sucesso");
      console.log(response.response);
      $state.go('tab.photo-feed-detail', {'photoId': $stateParams.photoId});
    };

    var onFail = function(error){
      console.log("Erro");
      alert("Houve um erro, tente novamente mais tarde");
    };

    
    

    var params = {};
    params.user_id                   = window.localStorage.getItem("user_id");
    params.photo_allowCommercialUses = $scope.data.commercialUsage;
    params.photo_allowModifications  = $scope.data.modifications;
    params.photo_name                = $scope.data.title;
    params.photo_imageAuthor         = $scope.data.author;
    params.tags                      = $scope.data.tags;
    params.photo_country             = $scope.data.country;
    params.photo_city                = $scope.data.city;
    params.photo_description         = $scope.data.description;
    params.photo_district            = $scope.data.district;
    params.photo_state               = $scope.data.state;
    params.photo_street              = $scope.data.address;
    params.authorized                = $scope.data.authorized;

    if(editedPhoto) {
      var options = new FileUploadOptions();
      options.params = params;
      options.httpMethod = "PUT";
      options.fileKey = "photo";

      var transfer = new FileTransfer();
      transfer.upload(image, address, onSuccess, onFail, options);
    }
    else {
      $http.put(address, params).then(onSuccess, onFail);
    }
  };

});
