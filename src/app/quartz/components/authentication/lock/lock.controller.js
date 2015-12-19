(function() {
    'use strict';

    angular
        .module('quartz.components')
        .controller('LockController', LockController);

    /* @ngInject */
    function LockController($state, qtSettings) {
        var vm = this;
        vm.loginClick = loginClick;
        vm.user = {
            name: 'Morris Onions',
            email: 'info@oxygenna.com',
            password: ''
        };
        vm.qtSettings = qtSettings;

        ////////////////

        // controller to handle login check
        function loginClick() {
            // user logged in ok so goto the dashboard
            $state.go('quartz.admin-default.dashboard-general');
        }
    }
})();
