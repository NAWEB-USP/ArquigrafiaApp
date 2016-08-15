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

.factory('LoginService', function($q, $http, ServerName) {
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
        logoutUser: function(name) {
            
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
    }
  };
})

.factory('Photos', function($http, ServerName) {
  return {
    all: function() {
      return $http.get(ServerName.get() + "/api/photos").then(function(result){
        return result.data;
      });
    },
    remove: function(photoId) {
      return $http.delete(ServerName.get() + "/api/photos/" + photoId).then(function(result){
        return result.data;
      })
    },
    get: function(photoId) {
      return $http.get(ServerName.get() + "/api/photos/" + photoId).then(function(result){
        return result.data;
      });
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

.factory("Camera", function($q) {
  return {
    getPicture: function(options){
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        q.resolve(result);
      }, function (error) {
        q.reject(error);
      }, options);
      
      return q.promise;
    }
  }
})
.factory("Geolocation", function($http){
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
    }
  }
});
