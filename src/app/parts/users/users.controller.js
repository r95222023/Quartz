(function () {
    'use strict';

    angular
        .module('app.parts.users')
        .controller('AllUsersController', AllUsersController)
        .controller('SiteUsersController', SiteUsersController);

    /* @ngInject */
    function AllUsersController($firebase, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        usersCtrl("users/list", vm, $firebase);
    }

    /* @ngInject */
    function SiteUsersController($firebase, $stateParams, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        usersCtrl("sites/detail/"+$stateParams.siteName+"/users/list", vm, $firebase);
    }

    function usersCtrl(userListRefUrl, vm, $firebase) {
        vm.paginator = $firebase.paginator(userListRefUrl);
        vm.paginator.onReorder('name');
        vm.onPaginate = function (page, size) { //to prevent this being overwritten
            vm.paginator.get(page, size)
        };
        vm.onReorder = function (orderBy) {
            vm.paginator.onReorder(orderBy);
        }
    }
})();
