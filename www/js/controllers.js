angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, LoginService, $ionicPopup, $state, $ionicLoading) {
    $scope.show = function() {
    $ionicLoading.show({
        template: '<p>Carregando...</p><ion-spinner></ion-spinner>'
      });
    };

    $scope.hide = function(){
      $ionicLoading.hide();
    };

    $scope.data = {};
    $scope.login = function() {
        $scope.show($ionicLoading);
        LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
            $state.go('tab.dash');
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

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats, $http) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
    var chats = Chats.all();
    chats.then(function(result){
      $scope.chats = result;
    });
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
