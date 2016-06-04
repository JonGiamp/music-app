angular.module('pMusic.controllers', ['ionic', 'pMusic.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $ionicLoading, $timeout, User, Recommendations) {
    // Functions for loading
    var showLoading = function() {
        $ionicLoading.show({
            template: '<i class="ion-loading-c"></i>',
            noBackdrop: true
        });
    }

    var hideLoading = function() {
        $ionicLoading.hide();
    }
    // Set load first time
    showLoading();

    Recommendations.init()
        .then(function(){
            $scope.currentSong = Recommendations.queue[0];
            Recommendations.playCurrentSong();
        })
        .then(function() {
            // turn loading off
            hideLoading();
            $scope.currentSong.loaded = true;
        });

  	// fired when we favorite / skip a song.
	$scope.sendFeedback = function (bool) {
        // first, add to favorites if they favorited
        if (bool) User.addSongToFavorites($scope.currentSong);

		// set variable for the correct animation sequence
	    $scope.currentSong.rated = bool;
	    $scope.currentSong.hide = true;

        // Prepare next song
        Recommendations.nextSong();

	    $timeout(function() {
		    // update current song in scope
		    $scope.currentSong = Recommendations.queue[0];
            $scope.currentSong.loaded = true;
	    }, 250);

        Recommendations.playCurrentSong().then(function() {
            $scope.currentSong.loaded = true;
        });
	}

    // used for retrieving the next album image.
    // if there isn't an album image available next, return empty string.
    $scope.nextAlbumImg = function() {
        if (Recommendations.queue.length > 1) {
            return Recommendations.queue[1].image_large;
        }

        return '';
    }

})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, $window, User) {
    // get the list of our favorites from the user service
    $scope.favorites = User.favorites;
    $scope.username = User.username;

    $scope.removeSong = function(song, index) {
        User.removeSongFromFavorites(song, index);
    }

    $scope.openSong = function(song) {
        $window.open(song.open_url, "_system");
    }

})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, $window, User, Recommendations) {
    // Affiche le nombre de favoris
    $scope.favCount = User.favoriteCount;

    $scope.enteringFavorites = function() {
        User.newFavorites = 0;
        Recommendations.haltAudio();
    }

    $scope.leavingFavorites = function () {
        Recommendations.init();
    }

    $scope.logout = function() {
        User.destroySession();

        // instead of using $state.go, we're going to redirect
        // reason : we need to ensure views aren't cached
        $window.location.href = 'index.html';
    }

})

/*
Controller for our Splash screen
*/
.controller('SplashCtrl', function($scope, $state, User) {

  // attempt to signup/login via User.auth
  $scope.submitForm = function(username, signingUp) {
    User.auth(username, signingUp).then(function(){
      // session is now set, so lets redirect to discover page
      $state.go('tab.discover');

    }, function() {
      // error handling here
      alert('Hmm... try another username.');

    });
  }

});