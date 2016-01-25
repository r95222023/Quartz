(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('SearchTestController', SearchTestController);

    /* @ngInject */
    function SearchTestController($elasticSearch, $q, $scope, dragulaService, $timeout, $firebase, $rootScope, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        dragulaService.options($scope, 'drag-container', {
            moves: function (el, container, handle) {
                console.log(handle.classList.contains('dragable-widget'));
                return !handle.classList.contains('dragable-widget');
            }
        });
        vm.rows = [{name: 'row 1', widgets: [{name: '1 1'}, {name: '1 2'}, {name: '1 3'}]}, {
            name: 'row 2',
            widgets: [{name: '2 1'}, {name: '2 2'}, {name: '2 3'}]
        }, {name: 'row 3', widgets: [{name: '3 1'}, {name: '3 2'}, {name: '3 3'}]}];
    }
})();
