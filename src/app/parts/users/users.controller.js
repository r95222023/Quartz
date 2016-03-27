(function () {
    'use strict';

    angular
        .module('app.parts.users')
        .controller('UsersController', UsersController);

    /* @ngInject */
    function UsersController($firebase, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;

    }
})();
