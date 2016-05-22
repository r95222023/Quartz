(function () {
    'use strict';

    angular
        .module('app.parts.home')
        .controller('HomePageController', HomePageController);

    /* @ngInject */
    function HomePageController($firebase, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;
        console.log('home')

        $firebase.ref('sites/list').once(function(snap){
            console.log(snap.val())
        })
        $firebase.ref('sites/list').orderByChild('example').equalTo(true).limitToFirst(10).once('value', function(snap){
            vm.examples= snap.val();
        })
    }
})();
