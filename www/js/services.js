angular.module('starter.services', [])

.factory('ServerName', function(){
  //var serverName = "http://localhost:8000";
  var serverName = "http://valinhos.ime.usp.br:51080";
  return {
    get: function () { 
      return serverName; 
    }
  }
})

.factory('PopUpService', function($ionicPopup, $ionicLoading, $q, $rootScope) {
  return {
    showSpinner : function (message) {
      $ionicLoading.show({
        template: '<p>' + message + '</p><ion-spinner></ion-spinner>'
      });
    }, 
    hideSpinner : function () {
      $ionicLoading.hide();
    }, 
    showPopUp : function (title, message) {
      $ionicPopup.alert({
        title: title,
        template: message
      });
    },
    showReport : function (){
      var deferred = $q.defer();
      $rootScope.information = {};
      $rootScope.datas = [{
            "id": "typeImage",
            "name": "Imagem",
            "select": false
        }, {
            "id": "typeTitle",
            "name": "Título",
            "select": false
        }, {
            "id": "typeAuthor",
            "name": "Autor",
            "select": false
        }, {
            "id": "typeDescription",
            "name": "Descrição",
            "select": false
        }, {
            "id": "typeAddress",
            "name": "Endereço",
            "select": false
        }];

      var template = '<div ng-repeat="data in datas" > ' +
        '<ion-checkbox ng-model="data.select" style="border:none">{{data.name}}</ion-checkbox>'+
    '</div>'+
    '<p ng-if="showErrorData">*Favor inserir campo a ser denunciado</p>' +

        '<label for="typeReport">Tipo de denúncia:</label>' +
        '<select id="typeReport" ng-model="information.typeReport"> ' +
          '<option value="inapropriate">Conteúdo inapropriado</option> ' +
          '<option value="repeat">Conteúdo repetido</option>' +
        '</select> ' +
        '<p ng-if="showErrorType">*Favor inserir tipo de denuncia</p>' +
      '</div> ' +
      '<div> ' +
        '<label for="observation">Observação</label> ' +
        '<textarea id="observation" ng-model="information.observation"></textarea>' +
      '</div>';
      
      var popup = $ionicPopup.show({
        title: 'Denunciar',
        template: template,
        scope: $rootScope,
        buttons: [ 
          {text: "Enviar",
          type: 'button-arq',
          onTap: function(e){
            $rootScope.showErrorData = true;
            $rootScope.showErrorType = false;

            for(var i = 0; i < $rootScope.datas.length; i++){
              if($rootScope.datas[i].select == true){
                $rootScope.showErrorData = false;
                break;
              }
            }
            
            if (!$rootScope.information.typeReport){
              $rootScope.showErrorType = true;
            }

            if($rootScope.showErrorType || $rootScope.showErrorData){
              e.preventDefault();
              return null;
            }
              
            var results = { dataTypeReport : $rootScope.datas,
                            typeReport: $rootScope.information.typeReport,
                            observationReport: $rootScope.information.observation
             };
            return results;
          }},
          {text: "Cancelar",
          type: 'button-arq',
          onTap: function(e){
            return null;
          }}]
      }).then(function(result){
        deferred.resolve(result);
      });   
      return deferred.promise;   
    }
  }
})

.factory('ReportService',function($http, ServerName){
  return {
    post: function(photoId, dataTypeReport, typeReport, observationReport){
      return $http.post(ServerName.get() + "/api/photos/" + photoId + "/report" ,
                        { params: {data_type_report : dataTypeReport, type_report : typeReport, 
                          observation_report: observationReport, 
                          user_id : window.localStorage.getItem("user_id")} }).then(function(result){
        return result.data;
      });
    }
  }
})

.factory('LoginService', function($q, $http, $ionicHistory, $state, ServerName) {
    return {
        loginUser: function(name, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post(ServerName.get() + "/api/login", {login : name, password : pw}).then(function(result){
              if (result.data.valid == 'true') {
                deferred.resolve(result.data);
              } else {
                deferred.reject(result.data);
              }
            });
            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise; 
        }, 
        logoutUser: function(name, token) {
          return $http.post(ServerName.get() + "/api/logout", {login : name, token : token}).then(function(result){
            return result.data;
          });
        }, 
        verifyCredentials: function() {
          if(window.localStorage.getItem("logged_user") == null) {
            $state.go('login');
          }
          else {
            return $http.post(ServerName.get() + "/api/auth", {login : window.localStorage.getItem("logged_user"), token : window.localStorage.getItem(window.localStorage.getItem("logged_user")), id : window.localStorage.getItem("user_id")}).then(function(result){
              if (result.data["auth"] != true) {
                window.localStorage.removeItem(window.localStorage.getItem("logged_user"));
                window.localStorage.removeItem("logged_user");
                window.localStorage.removeItem("user_id");
                $ionicHistory.clearHistory();
                $ionicHistory.clearCache().then(function(){ $state.go('login', {}, {reload: true}) });     
              }
            });
          }
        }
    }
})

.factory('Feed', function($http, ServerName){
  return {
    all: function() {
      return $http.get(ServerName.get() + "/api/users").then(function(result){
        return result.data;
      });
    },
    get: function(userId) {
      return $http.get(ServerName.get() + "/api/feed/" + userId).then(function(result){
        return result.data;
      });
    },
    more: function(userId, maxId) {
      return $http.get(ServerName.get() + "/api/loadMore/" + userId, { params: {max_id : maxId} }).then(function(result){
        return result.data;
      });
    }, 
    getMostRecent: function() {
      return $http.get(ServerName.get() + "/api/recent/").then(function(result){
        return result.data;
      });
    }, 
    getMoreMostRecent: function(maxId) {
      return $http.get(ServerName.get() + "/api/moreRecent/", { params: {max_id : maxId} }).then(function(result){
        return result.data;
      });
    }
  };
})

.factory('Photos', function($http, $state, $stateParams, $ionicHistory, ServerName, PopUpService) {
  return {
    all: function() {
      return $http.get(ServerName.get() + "/api/photos").then(function(result){
        return result.data;
      });
    },
    remove: function(photoId) {
      var params = {};
      var logged_user = window.localStorage.getItem("logged_user");
      params.token                     = window.localStorage.getItem(logged_user);
      params.user_id                   = window.localStorage.getItem("user_id");
      return $http.delete(ServerName.get() + "/api/photos/" + photoId, {params: params}).then(function(result){
        return result.data;
      })
    },
    get: function(photoId, userId) {
      return $http.get(ServerName.get() + "/api/photos/" + photoId, { params: {user_id : userId} }).then(function(result){
        return result.data;
      });
    }, 
    sendWithPhoto: function(image, data, isNewPhoto) {
      PopUpService.showSpinner('Enviando...');
      var address = ServerName.get() + "/api/photos";

      var onSuccess = function(response){
        console.log("Code = " + response.responseCode);
        console.log("Response = " + response.response);
        console.log("Sent = " + response.bytesSent);
        PopUpService.hideSpinner();
        $state.go('tab.account');
        $ionicHistory.clearCache();
      };

      var onFail = function(error){ 
        console.log("Error code = " + error.responseCode);
        console.log("Error source = " + error.source);
        console.log("error target = " + error.target);
        PopUpService.hideSpinner();
        PopUpService.showPopUp('Erro', 'Houve um erro, tente novamente mais tarde');
      };

      var options = new FileUploadOptions();
    
      var params = {};
      var logged_user = window.localStorage.getItem("logged_user");
      params.token                     = window.localStorage.getItem(logged_user);
      params.user_id                   = window.localStorage.getItem("user_id");
      params.photo_allowCommercialUses = data.commercialUsage;
      params.photo_allowModifications  = data.modifications;
      params.photo_name                = data.title;
      params.photo_imageAuthor         = data.author;
      params.tags                      = data.tags;
      params.photo_country             = data.country;
      params.photo_city                = data.city;
      params.photo_description         = data.description;
      params.photo_district            = data.district;
      params.photo_state               = data.state;
      params.photo_street              = data.address;
      params.authorized                = data.authorized;

      options.params = params;
      options.fileKey = "photo";
      options.httpMethod = (isNewPhoto) ? "POST" : "PUT" ;
      options.headers = {
        Connection: "close"
      };

      var transfer = new FileTransfer();
      transfer.upload(image, address, onSuccess, onFail, options);
    },
    put: function(data) {
      PopUpService.showSpinner('Enviando...');

      var onSuccess = function(response){
        console.log("Code = " + response.responseCode);
        console.log("Response = " + response.response);
        console.log("Sent = " + response.bytesSent);
        PopUpService.hideSpinner();
        $state.go('tab.account');
        $ionicHistory.clearCache();
      };

      var onFail = function(error){ 
        console.log("Error code = " + error.responseCode);
        console.log("Error source = " + error.source);
        console.log("error target = " + error.target);
        PopUpService.hideSpinner();
        PopUpService.showPopUp('Erro', 'Houve um erro, tente novamente mais tarde');
      };

      var address = ServerName.get() + "/api/photos/" + $stateParams.photoId;

      var params = {};
      var logged_user = window.localStorage.getItem("logged_user");
      params.token                     = window.localStorage.getItem(logged_user);
      params.user_id                   = window.localStorage.getItem("user_id");
      params.photo_allowCommercialUses = data.commercialUsage;
      params.photo_allowModifications  = data.modifications;
      params.photo_name                = data.title;
      params.photo_imageAuthor         = data.author;
      params.tags                      = data.tags;
      params.photo_country             = data.country;
      params.photo_city                = data.city;
      params.photo_description         = data.description;
      params.photo_district            = data.district;
      params.photo_state               = data.state;
      params.photo_street              = data.address;
      params.authorized                = data.authorized;

      $http.put(address, params).then(onSuccess, onFail);
    },
    getEvaluation: function(photoId, userId) {
      return $http.get(ServerName.get() + "/api/photos/" + photoId + "/evaluation/" + userId).then(function(result){
        return result.data;
      });
    }, 
    postEvaluation: function(photoId, userId, data) {
      return $http.post(ServerName.get() + "/api/photos/" + photoId + "/evaluation/" + userId, { params: {data : data} }).then(function(result){
        return result.data;
      });
    }, 
    averageEvaluation: function(photoId, userId) {
      return $http.get(ServerName.get() + "/api/photos/" + photoId + "/averageEvaluation/" + userId).then(function(result){
        return result.data;
      });
    }
  };
})

.factory('Profiles', function($http, ServerName) {
  return {
    create: function(data) {
      return $http.post(ServerName.get() + "/api/users", {data}).then(function(result){
        return result.data;
      });
    }, 
    getProfile: function(userId) {
      return $http.get(ServerName.get() + "/api/profile/" + userId).then(function(result){
        return result.data;
      });
    }, 
    getPhotos: function(userId) {
      return $http.get(ServerName.get() + "/api/userPhotos/" + userId).then(function(result){
        return result.data;
      });
    }, 
    getMorePhotos: function(userId, maxId) {
      return $http.get(ServerName.get() + "/api/moreUserPhotos/" + userId, { params: {max_id : maxId} }).then(function(result){
        return result.data;
      });
    }, 
    getFollowers: function(userId) {
      return $http.get(ServerName.get() + "/api/profile/" + userId + "/followers").then(function(result){
        return result.data;
      });
    }, 
    getFollowing: function(userId) {
      return $http.get(ServerName.get() + "/api/profile/" + userId + "/following").then(function(result){
        return result.data;
      });
    }, 
    getEvaluatedPhotos: function(userId) {
      return $http.get(ServerName.get() + "/api/profile/" + userId + "/evaluatedPhotos").then(function(result){
        return result.data;
      });  
    }, 
    getMoreEvaluatedPhotos: function(userId, maxId) {
      return $http.get(ServerName.get() + "/api/profile/" + userId + "/moreEvaluatedPhotos", { params: {max_id : maxId} }).then(function(result){
        return result.data;
      });
    }
  }
})

.factory('Search', function($http, ServerName) {
  return {
    getSearch: function(query, userId) {
      return $http.post(ServerName.get() + "/api/search", {q : query, user_id : userId}).then(function(result){
        return result.data;
      });
    }, 
    getMoreSearch: function(query, maxId) {
      return $http.post(ServerName.get() + "/api/moreSearch", {q : query, max_id : maxId}).then(function(result){
        return result.data;
      });
    } 
  }
})

.factory('Tags', function($http, ServerName){
  return {
    all: function() {
      return $http.get(ServerName.get() + "/api/tags").then(function(result){
        return result.data;
      });
    },
    remove: function(id) {},
    get: function(id) {}
  }
})

.factory('Camera', function($q) {
  return {
    getPicture: function(options){
      return null;
    },
    takePicture: function(option){
      return null;
    }
  }
})

.factory('Geolocation', function($http, $q, PopUpService){
  return {
    getAddress: function(latitude, longitude) {
      return $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude).then(function(data){
        if(data.data.results[0]) {
          var address = {};
          var formattingAddress = {};
          var result = data.data.results[0].address_components;
          for(var i = 0; i < result.length; i++) {
            if(result[i].types.indexOf("country") != -1) //achou country
              address.country = result[i].long_name;
            else if(result[i].types.indexOf("administrative_area_level_1") != -1) //achou state
              address.state = result[i].short_name;
            else if(result[i].types.indexOf("locality") != -1)//achou city
              address.city = result[i].long_name;
            else if(result[i].types.indexOf("sublocality") != -1)//achou bairro
              address.district = result[i].long_name;
            else if(result[i].types.indexOf("route") != -1)//achou rua
              formattingAddress.route = result[i].long_name;
            else if(result[i].types.indexOf("street_number") != -1)//achou numero
              formattingAddress.number = result[i].long_name;
          }
          address.address = formattingAddress.route + ", " + formattingAddress.number;
          return address;
        }
      });
    },
    getCoordinates: function(image){
      var latitude, longitude;
      var result = {};
      var deferred = $q.defer();
      var convertDegToDec = function(arr) {
        return (arr[0].numerator + arr[1].numerator/60 + (arr[2].numerator/arr[2].denominator)/3600).toFixed(4);
      };

      EXIF.getData(image, function(){
        longitude = EXIF.getTag(image, "GPSLongitude");
        latitude = EXIF.getTag(image, "GPSLatitude");

        if(latitude != null || longitude != null){
          latitude = convertDegToDec(latitude);
          longitude = convertDegToDec(longitude);

          //Coordenadas negativas
          if(EXIF.getTag(this,"GPSLongitudeRef") === "W") longitude = -1 * longitude;
          if(EXIF.getTag(this,"GPSLatitudeRef") === "S") latitude = -1 * latitude;
          result.latitude = latitude;
          result.longitude = longitude;
          deferred.resolve(result);
        }
        else {
          navigator.geolocation.getCurrentPosition(function(position){
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            result.latitude = latitude;
            result.longitude = longitude;
            deferred.resolve(result);
          }, function (error) {
            PopUpService.hideSpinner();
            PopUpService.showPopUp("Sua imagem não possui dados de localização",  "Não foi possivel preencher o endereço automaticamente");
          }, {timeout: 5000} );
        }
        
        
      });

      return deferred.promise;
    }
  }
});
