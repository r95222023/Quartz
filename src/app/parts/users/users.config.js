(function () {
    'use strict';

    angular
        .module('app.parts.users')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/parts/users');

        $stateProvider
            .state('quartz.admin-default.users', {
                url: '/admin/:siteName/users/',
                params:{
                    siteName:''
                },
                data: {
                    layout: {
                        // sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        contentClass: 'admin-card-container',
                        footer: false
                    }
                },
                template: '<ui-view></ui-view>'
            })
            .state('quartz.admin-default.users.list', {
                url: 'list/?superAdmin',
                params:{
                    superAdmin:''
                },
                templateUrl: 'app/parts/users/user-list.tmpl.html',
                controller: 'SiteUsersController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.users.classes', {
                url: 'user-classes/',
                templateUrl: 'app/parts/users/user-classes.tmpl.html',
                // set the controller to load for this page
                controller: 'UserClassesController',
                controllerAs: 'vm'
            });
    }
})();
