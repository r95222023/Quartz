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
                        // sideMenuSize: 'hidden',
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
            icon: 'zmdi zmdi-square-o',
            type: 'link',
            priority: 1.2,
            state: 'quartz.admin-default.mysites'
        });
        qtMenuProvider.addMenu({
            name: 'MENU.ALLSITES',
            icon: 'zmdi zmdi-square-o',
            type: 'link',
            priority: 1.2,
            state: 'quartz.admin-default.allsites'
        });
        //// dynamic menu group 由quartz.run控制
        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.SITEMENU',
            icon: 'fa fa-pencil-square-o',
            type: 'dropdown',
            priority: 1.2,
            children: [
                {
                    name: 'MENU.SITES.CONFIG',
                    type: 'link',
                    state: 'quartz.admin-default.site-configure'
                },
                {
                    name: 'MENU.PAGES.PAGEMANAGER',
                    state: 'quartz.admin-default.pageManager',
                    params: {cate: 'all', subCate: 'all', queryString: ''},
                    type: 'link'
                },
                {
                    name: 'MENU.PAGES.WIDGETMANAGER',
                    state: 'quartz.admin-default.widgetManager',
                    params: {cate: 'all', subCate: 'all', queryString: ''},
                    type: 'link'
                },
                {
                    name: 'MENU.PRODUCTS.MANAGER',
                    state: 'quartz.admin-default.productManager',
                    type: 'link'
                },
                {
                    name: 'MENU.USERS.SITEUSER',
                    state: 'quartz.admin-default.siteusers',
                    type: 'link'
                },
                {
                    name: 'MENU.PRODUCTS.ORDERHISTORY',
                    state: 'quartz.admin-default.orderHistory',
                    type: 'link'
                }
            ]
        });
    }
})();
