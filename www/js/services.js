angular.module('starter.services', [])

.factory('ServerName', function(){
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
    remove: function(){
      //
    },
    get: function(userId){
      return $http.get(ServerName.get() + "/api/feed/" + userId).then(function(result){
        return result.data;
      });
    }
  };
})

.factory('User', function($http, ServerName) {
  return {
    allPhotos: function(userId) {
      return $http.get(ServerName.get() + "/api/photos").then(function(result){
        var user_photos = [];
        var i;
        for(i = 0; i < result.data.length; i++){
          if(result.data[i].user_id == userId) {
            user_photos.push(result.data[i]);

          }
        }
        return user_photos;
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
      //chats.splice(chats.indexOf(chat), 1);
    },
    get: function(photoId) {
      return $http.get(ServerName.get() + "/api/photos/" + photoId).then(function(result){
        return result.data;
      });
    }
  };
})

.factory('Profiles', function($http, ServerName){
  return {
    all: function() {},
    remove: function(id) {},
    get: function(userName) { //endereco precisa que servidor seja atualizado
      return $http.get(ServerName.get() + "/api/users/" + userName).then(function(result){
        return result.data;
      })
    }
  }
});
