angular.module('starter.services', [])

.factory('LoginService', function($q, $http) {
    return {
        loginUser: function(name, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post("http://valinhos.ime.usp.br:51080/api/login", {login : name, password : pw}).then(function(result){
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

.factory('Feed', function($http){
  return {
    all: function() {
      return $http.get("http://valinhos.ime.usp.br:51080/api/users").then(function(result){
        return result.data;
      });
    },
    remove: function(){
      //
    },
    get: function(userId){
      return $http.get("http://valinhos.ime.usp.br:51080/api/feed/" + userId).then(function(result){
        return result.data;
      });
    }
  };
})

.factory('User', function($http) {
  return {
    allPhotos: function(userId) {
      return $http.get("http://valinhos.ime.usp.br:51080/api/photos").then(function(result){
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

.factory('Chats', function($http) {
  return {
    all: function() {
      return $http.get("http://valinhos.ime.usp.br:51080/api/photos").then(function(result){
        return result.data;
      });
    },
    remove: function(chat) {
      //chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      /*for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }*/
      return null;
    }
  };
})

.factory('Profiles', function($http){
  return {
    all: function() {},
    remove: function(id) {},
    get: function(userName) { //endereco precisa que servidor seja atualizado
      return $http.get("http://valinhos.ime.usp.br:51080/api/users/" + userName).then(function(result){
        return result.data;
      })
    }
  }
});
