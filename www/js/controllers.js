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

.controller('LoginCtrl', function($scope, $state, PopUpService, LoginService, ServerName) {
    var serverName = ServerName.get();
    /* Verifica se o usuário já está logado */
    $scope.$on('$ionicView.enter', function() {
      if(window.localStorage.getItem("logged_user") != null) {
        $state.go('tab.dash');
      }
    })
    /* Definição de variáveis */
    $scope.data = {};
    $scope.cadastro= function(){
      var ref = cordova.InAppBrowser.open(serverName + '/users/account', '_blank', 'location=yes, hardwareback=no');
      ref.show();
    }

    /* Faz o login */
    $scope.login = function() {
        PopUpService.showSpinner('Carregando...');
        LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
            window.localStorage.setItem("logged_user", data.login);
            window.localStorage.setItem(data.login, data.token);
            window.localStorage.setItem("user_id", data.id);
            $state.go('tab.dash', {}, {reload: true});
        }).error(function(data) {
            PopUpService.showPopUp('Falha no login!', 'Usuário ou senha incorretos!');
        }).finally(function($ionicLoading) {  
          PopUpService.hideSpinner(); 
        });
    }
})

.controller('FeedCtrl', function($scope, $state, Feed, ServerName, LoginService, PopUpService, ReportService) {
  /* Verifica se o usuário está autorizado */
  $scope.$on('$ionicView.enter', function() {
    LoginService.verifyCredentials();
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
    });
    
  }
  /* Report */   
  $scope.report = function(photoId){
    PopUpService.showReport().then(function(result){
      if(result != null){
        ReportService.post(photoId, result.dataTypeReport, result.typeReport, 
                           result.observationReport).then(function(response){
          PopUpService.showPopUp('Sucesso', 'Denuncia realizada com sucesso.');
        });
      }
    });
  }
})

.controller('SearchCtrl', function($scope, $state, $ionicScrollDelegate, Photos, Search, PopUpService, LoginService, ServerName, Feed) {
  /* Verifica se o usuário está autorizado */
  $scope.$on('$ionicView.enter', function() {
    LoginService.verifyCredentials();
  })
  /* Definição de variáveis */
  $scope.serverName = ServerName.get();
  $scope.moreDataCanBeLoaded = true;
  var last_search_terms = "";
  var maxId = 0;
  $scope.photos = [];
  /* Realiza busca */
  $scope.search = function() {
    last_search_terms = document.getElementById('search-bar').value;
    if (last_search_terms.length <= 3) {
      PopUpService.showPopUp("Erro!", "Digite mais do que 3 caracteres para realizar uma busca");
      return;
    }
    PopUpService.showSpinner("Carregando...");
    $scope.moreDataCanBeLoaded = true;
    Search.getSearch(last_search_terms, window.localStorage.getItem("user_id")).then(function(result){
      if (result.length < 20) {
        $scope.moreDataCanBeLoaded = false;
      }
      $scope.photos = [];
      if (result.length > 0) { 
        $scope.photos = Object.keys(result).map(function(k) { return result[k] }).sort(function(a, b) { return b.id - a.id; });
        maxId = $scope.photos[$scope.photos.length-1].id;
      }
      if (result.length == 0) {
        document.getElementById("search-placeholder").style.display = "block";
      }
      $ionicScrollDelegate.scrollTop();
      PopUpService.hideSpinner();
    }); 
  }

  /* Recupera mais resultados da busca */
  $scope.loadMoreResults = function() {
    Search.getMoreSearch(last_search_terms, maxId).then(function(result){
      maxId = result[result.length-1].id;
      $scope.photos = $scope.photos.concat(result);
      if (result.length < 20) {
        $scope.moreDataCanBeLoaded = false;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  }
})

.controller('PhotoDetailCtrl', function($scope, $stateParams, $state, Photos, ServerName, PopUpService, LoginService) {
  /* Verifica se o usuário está autorizado */
  $scope.$on('$ionicView.enter', function() {
    LoginService.verifyCredentials();
  })
  /* Definição de variáveis */
  $scope.serverName = ServerName.get();
  $scope.detail = {};
  $scope.user_id = window.localStorage.getItem("user_id");
  /* Carrega informações da foto */
  var photo = Photos.get($stateParams.photoId, window.localStorage.getItem("user_id"));
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
    PopUpService.showSpinner("Enviando impressões...");
    Photos.postEvaluation($stateParams.photoId, window.localStorage.getItem("user_id"), data).then(function(result) {
      PopUpService.hideSpinner();
      PopUpService.showPopUp('Sucesso', 'Impressões registradas com sucesso.');
    });
    $state.reload();
  }
  /* Exibe informações da foto */
  $scope.showInformation = function() {
    document.getElementById("photo-info-container").style.display = "initial";
    document.getElementById("evaluation-container").style.display = "none";
    document.getElementById("evaluation-average-container").style.display = "none";
    if (document.getElementById("showInformation").className.indexOf("active") == -1) {
      document.getElementById("showEvaluation").className = document.getElementById("showEvaluation").className.replace('active','');
      if (document.getElementById("showAverage") != null)
        document.getElementById("showAverage").className = document.getElementById("showAverage").className.replace('active','');
      document.getElementById("showInformation").className += " active";
    }
  }
  /* Exibe binômios para avaliação */
  $scope.showEvaluation = function() {
    document.getElementById("photo-info-container").style.display = "none";
    document.getElementById("evaluation-container").style.display = "initial";
    document.getElementById("evaluation-average-container").style.display = "none";
    if (document.getElementById("showEvaluation").className.indexOf("active") == -1) {
      document.getElementById("showInformation").className = document.getElementById("showInformation").className.replace('active','');
      if (document.getElementById("showAverage") != null)
        document.getElementById("showAverage").className = document.getElementById("showAverage").className.replace('active','');
      document.getElementById("showEvaluation").className += " active";
    }
  }
  /* Exibe gráfico com a média das avaliações */
  $scope.showAverage = function() {
    document.getElementById("photo-info-container").style.display = "none";
    document.getElementById("evaluation-container").style.display = "none";
    document.getElementById("evaluation-average-container").style.display = "initial";
    if (document.getElementById("showAverage").className.indexOf("active") == -1) {
      document.getElementById("showEvaluation").className = document.getElementById("showEvaluation").className.replace('active','');
      document.getElementById("showInformation").className = document.getElementById("showInformation").className.replace('active','');
      document.getElementById("showAverage").className += " active";
    }
  }
  /* Configuração do gráfico com as médias das avaliações */
  var count = 0;
  var l1 = [];
  var l2 = [];
  var tickPos = [];
  var avgData = [];
  var userData = [];
  function getGraphData() {
    var averageEvaluation = Photos.averageEvaluation($stateParams.photoId, window.localStorage.getItem("user_id"));
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
  }
  getGraphData();
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
      PopUpService.showSpinner('Processando');
      Photos.remove(id).then(function(data) {
        PopUpService.hideSpinner();
        PopUpService.showPopUp(data.message);
        $state.go('tab.account', {}, {reload: true});
      });
    }
  }

  $scope.editPhoto = function(id) {
    $state.go('tab.edit-photo', {photoId: id});
  }
})

.controller('AccountCtrl', function($scope, $state, $timeout, $ionicHistory, Profiles, ServerName, LoginService) {
  /* Verifica se o usuário está autorizado */
  $scope.$on('$ionicView.enter', function() {
    LoginService.verifyCredentials();
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
    if (document.getElementById("showEvaluations").className.indexOf("active") == -1) {
      document.getElementById("showUploads").className = document.getElementById("showUploads").className.replace('active','');
      document.getElementById("showEvaluations").className += " active";
    }
    $scope.evaluationsShowing = true;
    $scope.uploadsShowing = false;
  }

  /* Exibe uploads */
  $scope.showUploads = function() {
    document.getElementById("uploads").style.display = "initial";
    document.getElementById("evaluations").style.display = "none";
    if (document.getElementById("showUploads").className.indexOf("active") == -1) {
      document.getElementById("showEvaluations").className = document.getElementById("showEvaluations").className.replace('active','');
      document.getElementById("showUploads").className += " active";
    }
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
    var account = Profiles.getProfile(window.localStorage.getItem("user_id"));
    account.then(function(result){
      $scope.account = result;
    });
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

.controller('UserFollowersCtrl', function($scope, $http, $stateParams, ServerName, Profiles, LoginService) {
  /* Verifica se o usuário está autorizado */
  $scope.$on('$ionicView.enter', function() {
    LoginService.verifyCredentials();
  })
  /* Definição de variáveis */
  $scope.serverName = ServerName.get();
  /* Pega as seguidores do usuário */
  var followers = Profiles.getFollowers($stateParams.userId);
  followers.then(function(result){
    $scope.followers = result;
  })
})

.controller('UserFollowingCtrl', function($scope, $http, $stateParams, ServerName, Profiles, LoginService) {
  /* Verifica se o usuário está autorizado */
  $scope.$on('$ionicView.enter', function() {
    LoginService.verifyCredentials();
  })
  /* Definição de variáveis */
  $scope.serverName = ServerName.get();
  /* Pega os seguidos do usuário */
  var following = Profiles.getFollowing($stateParams.userId);
  following.then(function(result){
    $scope.following = result;
  })
})

.controller('CameraCtrl', function($scope, $http, $state, ServerName, Tags, Camera, 
                                   Geolocation, PopUpService, LoginService, Photos, Profiles) {
  /* Verifica se o usuário está autorizado */
  $scope.$on('$ionicView.enter', function() {
    LoginService.verifyCredentials();
  })
  /* Declaracao de variavel */
  $scope.hideData = true;
  $scope.showAditional = false;
  var longitude = null;
  var latitude = null;
  $scope.data = {};
  $scope.data.tags = [];

  var user_data = Profiles.getProfile(window.localStorage.getItem('user_id'));
  user_data.then(function(result) {
    $scope.data.author = result.name;
  })

  /* Tags */
  var tags = Tags.all();
  tags.then(function(result){
    $scope.tags = result;
  });

  $scope.getTag = function(newValue, oldValue){
    if($scope.data.tags.indexOf(newValue.name) == -1)
      $scope.data.tags.push(newValue.name);
  }

  $scope.addTag = function(){
    var tag = prompt("Digite o nome da tag:");
    tag = tag.trim().toLowerCase();
    if($scope.data.tags.indexOf(tag) == -1)
      $scope.data.tags.push(tag);
 }

  $scope.removeTag = function(tag){
    var position = $scope.data.tags.indexOf(tag);
    $scope.data.tags.splice(position, 1);
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

  $scope.shouldShow = function() {
    if ($scope.hideData && (typeof $scope.imageURI != 'undefined'))
      return true;
    else
      return false;
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

    navigator.camera.getPicture(function (imageURI) {      
      var geoImage = new Image();
      geoImage.onload = function(){
        PopUpService.showSpinner('Carregando...');

        var coordinates = Geolocation.getCoordinates(geoImage);
        coordinates.then(function(coordinates){
          latitude = coordinates.latitude;
          longitude = coordinates.longitude;


          if(latitude != null || longitude != null){
            var result = Geolocation.getAddress(latitude, longitude);
            result.then(function(address){
              $scope.data.country   = address.country;
              $scope.data.city      = address.city;
              $scope.data.district  = address.district;
              $scope.data.state     = address.state;
              $scope.data.address   = address.address;
              PopUpService.hideSpinner();
            }); 
          } else { PopUpService.hideSpinner(); }
        });               
      }

      $scope.$apply(function() {
        $scope.imageURI = imageURI;
        geoImage.src = imageURI;
        $scope.hideData = false;
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
        PopUpService.showSpinner('Carregando...');

        var coordinates = Geolocation.getCoordinates(geoImage);
        coordinates.then(function(coordinates){
          latitude = coordinates.latitude;
          longitude = coordinates.longitude;

          if(latitude != null || longitude != null){
            var result = Geolocation.getAddress(latitude, longitude);
            result.then(function(address){
              $scope.data.country   = address.country;
              $scope.data.city      = address.city;
              $scope.data.district  = address.district;
              $scope.data.state     = address.state;
              $scope.data.address   = address.address;
              PopUpService.hideSpinner();
            }); 
          } else { PopUpService.hideSpinner(); }
        });               
      }

      $scope.$apply(function() {
        $scope.imageURI = imageURI;
        geoImage.src = imageURI;
        $scope.hideData = false;
      });

    }, function(error) {
      console.log(error);
    }, optionsGet);
  };

  /* Envio de foto */
  $scope.postPhoto = function(){ 
    Photos.sendWithPhoto($scope.imageURI, $scope.data, true); 
  };
})

.controller('EditPhotoCtrl', function($scope, $http, $state, $stateParams, 
                                      ServerName, Photos, Tags, Camera, Geolocation, PopUpService, LoginService) {
  /* Verifica se o usuário está autorizado */
  $scope.$on('$ionicView.enter', function() {
    LoginService.verifyCredentials();
  })
  /* Definindo variaveis */
  $scope.showAditional = false;
  var longitude = null;
  var latitude = null;
  var editedPhoto = false;
  $scope.data = {};
  $scope.data.tags = [];

  /* Preenchendo campos de photo */
  var photo = Photos.get($stateParams.photoId, window.localStorage.getItem("user_id"));
  photo.then(function(result) {
    var photo = result['photo'];
    $scope.imageURI = ServerName.get() + "/arquigrafia-images/" + result['photo'].id + "_home.jpg";

    $scope.data.commercialUsage = (photo.allowCommercialUses == "YES") ? true : false;
    $scope.data.modifications = photo.allowModifications.toLowerCase();
    $scope.data.title = photo.name;
    $scope.data.author = photo.imageAuthor;
    if(typeof result['tags'] != 'undefined' || result['tags'][0] != "")
      $scope.data.tags = result['tags'];
    $scope.data.country = photo.country;
    $scope.data.city = photo.city;
    $scope.data.description = photo.description;
    $scope.data.district = photo.district;
    $scope.data.state = photo.state;
    $scope.data.address = photo.address;
    $scope.data.authorized = (photo.authorized == "1") ? true : false;
  })

  /* Tags */
  var tags = Tags.all();
  tags.then(function(result){
    $scope.tags = result;
  });

  $scope.getTag = function(newValue, oldValue){
    if($scope.data.tags.indexOf(newValue.name) == -1)
      $scope.data.tags.push(newValue.name);
  }

  $scope.addTag = function(){
    var tag = prompt("Digite o nome da tag:");
    if(tag != null) {
      tag = tag.trim().toLowerCase();
      if($scope.data.tags.indexOf(tag) == -1)
        $scope.data.tags.push(tag);
    }
  }

  $scope.removeTag = function(tag){
    var position = $scope.data.tags.indexOf(tag);
    $scope.data.tags.splice(position, 1);
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

    navigator.camera.getPicture(function (imageURI) {
      var geoImage = new Image();
      geoImage.onload = function(){
        PopUpService.showSpinner('Carregando...');

        var coordinates = Geolocation.getCoordinates(geoImage);
        coordinates.then(function(coordinates){
          latitude = coordinates.latitude;
          longitude = coordinates.longitude;


          if(latitude != null || longitude != null){
            var result = Geolocation.getAddress(latitude, longitude);
            result.then(function(address){
              $scope.data.country   = address.country;
              $scope.data.city      = address.city;
              $scope.data.district  = address.district;
              $scope.data.state     = address.state;
              $scope.data.address   = address.address;
              PopUpService.hideSpinner();
            }); 
          } else { PopUpService.hideSpinner(); }
        });               
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
        PopUpService.showSpinner('Carregando...');

        var coordinates = Geolocation.getCoordinates(geoImage);
        coordinates.then(function(coordinates){
          latitude = coordinates.latitude;
          longitude = coordinates.longitude;

          if(latitude != null || longitude != null){
            var result = Geolocation.getAddress(latitude, longitude);
            result.then(function(address){
              $scope.data.country   = address.country;
              $scope.data.city      = address.city;
              $scope.data.district  = address.district;
              $scope.data.state     = address.state;
              $scope.data.address   = address.address;
              PopUpService.hideSpinner();
            }); 
          } else { PopUpService.hideSpinner(); }
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
    if(editedPhoto) {
      Photos.sendWithPhoto($scope.imageURI, $scope.data, false); 
    }
    else {
      Photos.put($scope.data);
    }
  };

});
