angular.module('starter.services', [])

.factory('LoginService', function($q) {
    return {
        loginUser: function(name, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;
 
            if (name == 'user' && pw == 'secret') {
                deferred.resolve('Welcome ' + name + '!');
            } else {
                deferred.reject('Wrong credentials.');
            }
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
      return $http.get("http://localhost:8000/api/users").then(function(result){
        return result.data;
      });
    },
    remove: function(){
      //
    },
    get: function(userId){
      return $http.get("http://localhost:8000/api/feed/" + userId).then(function(result){
        return result.data;
      });
    }
  };
})

.factory('Chats', function($http) {
  return {
    all: function() {
      return $http.get("http://localhost:8000/api/photos").then(function(result){
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
});
