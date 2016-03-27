(function() {
    'use strict';

    angular
        .module('app.parts.users')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/parts/users');

        $stateProvider
        .state('quartz.admin-default.allusers', {
            url: '/admin/users',
            templateUrl: 'app/parts/users/all-users.tmpl.html',
            // set the controller to load for this page
            controller: 'UsersController',
            controllerAs: 'vm'
        });

        qtMenuProvider.addMenu({
            name: 'MENU.ALLUSERS',
            icon: 'zmdi zmdi-accounts',
            type: 'link',
            priority: 1.5,
            state: 'quartz.admin-default.allusers'
        });
    }
})();
