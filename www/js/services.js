angular.module('starter.services', [])

.factory('LoginService', function($q, $http) {
    return {
        loginUser: function(name, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post("http://localhost:8000/api/login", {login : name, password : pw}).then(function(result){
              //adicionar aviso de carregando
              if (result.data.valid == 'true') {
                deferred.resolve('Welcome ' + name + '!');
              } else {
                deferred.reject('Wrong credentials.');
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
