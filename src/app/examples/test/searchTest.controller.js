(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('SearchTestController', SearchTestController);

    /* @ngInject */
    function SearchTestController(injectJS, $elasticSearch, $q, customService, $scope, dragulaService, $timeout, $firebase, $rootScope, qtNotificationsService, Auth, $state, $mdSidenav, config) {
        var vm = this;
        injectJS.set('testjs','assets/test/test.js').then(function () {
            console.log('resolved');
        })
    }
})();
