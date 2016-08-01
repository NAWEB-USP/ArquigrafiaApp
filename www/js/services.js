angular.module('starter.services', [])

.factory('ServerName', function(){
  var serverName = "http://localhost:8000"; //http://valinhos.ime.usp.br:51080
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
    remove: function(photo) {
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
});
