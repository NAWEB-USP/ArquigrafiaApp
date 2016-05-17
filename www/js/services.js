angular.module('starter.services', [])

.factory('Chats', function($http) {
  // Might use a resource here that returns a JSON array
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
