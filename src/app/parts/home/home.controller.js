(function () {
    'use strict';

    angular
        .module('app.parts.home')
        .controller('HomePageController', HomePageController);

    /* @ngInject */
    function HomePageController($firebase, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        $firebase.ref('sites/list').orderByChild('example').equalTo(true).limitToFirst(10).once('value', function(snap){
            vm.examples= snap.val();
        })
    }
})();
