(function () {
    'use strict';

    angular
        .module('app.parts.home')
        .controller('HomePageController', HomePageController);

    /* @ngInject */
    function HomePageController($firebase, qtNotificationsService, $state, $mdDialog, config,$ocLazyLoad,$injector) {
        var vm = this;
        // $ocLazyLoad.load(['https://cdn.rawgit.com/angular-ui/bootstrap/gh-pages/ui-bootstrap-1.2.5.js',{type: 'css',path:'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.css'}])
        //     .then(function(){
        //         var $uibModal = $injector.get("$uibModal");
        //         console.log($uibModal)
        //     });
        $firebase.ref('sites/list').orderByChild('example').equalTo(true).limitToFirst(10).once('value', function(snap){
            vm.examples= snap.val();
        })
    }
})();
