// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ui.select', 'ngSanitize'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('welcome', {
      url: '/welcome',
      templateUrl: 'templates/welcome.html', 
      controller: 'WelcomeCtrl'
  })

  .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html', 
      controller: 'LoginCtrl'
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/feed',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'FeedCtrl'
      }
    }
  })

  .state('tab.search', {
      url: '/search',
      views: {
        'tab-search': {
          templateUrl: 'templates/tab-search.html',
          controller: 'SearchCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('tab.photo-detail', {
    url: '/photos/:photoId', 
    views: {
      'tab-account': {
        templateUrl: 'templates/photo-detail.html',
        controller: 'PhotoDetailCtrl'
      }
    }
  })

  .state('tab.users', {
    url: '/users',
    abstract: true,  
    templateUrl: 'templates/users.html', 
    controller: 'UsersCtrl'
  })

  .state('tab.user-detail', {
    url: '/users/:userId', 
    templateUrl: 'templates/user-detail.html', 
    controller: 'UserDetailCtrl'
  })

  .state('tab.users-following', {
    url: '/users/:userId/following', 
    views: {
      'tab-account': {
        templateUrl: 'templates/user-following.html', 
        controller: 'UserFollowingCtrl'
      }
    }
  })

  .state('tab.users-followers', {
    url: '/users/:userId/followers', 
    views: {
      'tab-account': {
        templateUrl: 'templates/user-followers.html', 
        controller: 'UserFollowersCtrl'
      }
    }
  })

  .state('tab.camera', {
    url: '/camera',
    views: {
      'tab-camera': {
        templateUrl: 'templates/camera.html',
        controller: 'CameraCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/welcome');

});
