(function() {
    'use strict';

    angular
        .module('app.examples.dashboards')
        .controller('DashboardGeneralController', DashboardGeneralController);

    /* @ngInject */
    function DashboardGeneralController($scope, $timeout, $mdToast, geoip) {
        var vm = this;
        vm.geoip=geoip;
    }
})();
