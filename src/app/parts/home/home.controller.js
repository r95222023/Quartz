(function () {
    'use strict';

    angular
        .module('app.parts.home')
        .controller('HomePageController', HomePageController);

    /* @ngInject */
    function HomePageController($firebase, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;

        var ref = new Firebase('https://cpdb1.firebaseio.com/');
        ref.child('list').orderByChild('private').equalTo(false).once('child_added', function(snap){
            console.log(snap.val())
        }, function(err){
            console.log(err)
        });
        ref.child('list/id1').once('value', function(snap){
            console.log(snap.val())
        }, function(err){
            console.log(err)
        })
    }
})();
