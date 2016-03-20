(function () {
    'use strict';

    angular
        .module('app.parts.sites')
        .config(sitesConfig);

    /* @ngInject */
    function sitesConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/parts/sites');

        $stateProvider
            .state('quartz.admin-default.mysites', {
                data: {
                    layout: {
                        sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        footer: false
                    }
                },
                resolve: {
                    authData: ['Auth', function (Auth) {
                        return Auth.$waitForAuth()
                    }]
                },
                url: '/mysites',
                templateUrl: 'app/parts/sites/my-sites.tmpl.html',
                // set the controller to load for this page
                controller: 'MySitesController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.allsites', {
                data: {
                    layout: {
                        sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        footer: false
                    }
                },
                resolve: {
                    authData: ['Auth', function (Auth) {
                        return Auth.$waitForAuth()
                    }]
                },
                url: '/allsites',
                templateUrl: 'app/parts/sites/all-sites.tmpl.html',
                // set the controller to load for this page
                controller: 'AllSitesController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.site-configure', {
                data: {
                    layout: {
                        // sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        footer: false
                    }
                },
                url: '/:siteName/configure',
                templateUrl: 'app/parts/sites/configure.tmpl.html',
                // set the controller to load for this page
                controller: 'SiteConfigureController',
                controllerAs: 'vm'
            });

        qtMenuProvider.addMenu({
            name: 'MENU.MYSITES',
            icon: 'zmdi zmdi-home',
            type: 'link',
            priority: 1.2,
            state: 'quartz.admin-default.mysites'
        });
        qtMenuProvider.addMenu({
            name: 'MENU.ALLSITES',
            icon: 'zmdi zmdi-home',
            type: 'link',
            priority: 1.2,
            state: 'quartz.admin-default.allsites'
        });
    }
})();
