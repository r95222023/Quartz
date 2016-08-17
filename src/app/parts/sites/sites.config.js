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
                    authData: ['$auth', function ($auth) {
                        return $auth.waitForAuth()
                    }]
                },
                url: '/admin/mysites',
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
                    authData: ['$auth', function ($auth) {
                        return $auth.waitForAuth()
                    }]
                },
                url: '/admin/allsites',
                templateUrl: 'app/parts/sites/all-sites.tmpl.html',
                // set the controller to load for this page
                controller: 'AllSitesController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.siteSetting-basic', {
                data: {
                    layout: {
                        // sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        footer: false
                    }
                },
                url: '/admin/:siteName/configure',
                templateUrl: 'app/parts/sites/configure.tmpl.html',
                // set the controller to load for this page
                controller: 'SiteSettingCtrl',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.siteSetting-external-lib', {
                url: '/:siteName/?id&params&params2&devMode',
                resolve: {
                    getSyncTime: ['syncTime', function (syncTime) {
                        return syncTime.onReady();
                    }],
                    authData: ['$auth', function ($auth) {
                        return $auth.waitForAuth()
                    }]
                },
                data: {
                    layout: {
                        footer: false
                    }
                },
                templateUrl: 'app/parts/sites/settings/external-lib.tmpl.html',
                controller: 'SiteSettingCtrl',
                controllerAs: 'vm'
            })

            .state('quartz.admin-default.siteSetting-payment', {
                data: {
                    layout: {
                        // sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        footer: false
                    }
                },
                url: '/admin/:siteName/payment',
                templateUrl: 'app/parts/sites/payment.tmpl.html',
                // set the controller to load for this page
                controller: 'SiteSettingCtrl',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.template', {
                data: {
                    layout: {
                        // sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        footer: false
                    }
                },
                resolve: {
                    site: function () {
                        return {}
                    }
                },
                url: '/admin/templateMgr',
                templateUrl: 'app/parts/sites/template.tmpl.html',
                // set the controller to load for this page
                controller: 'TemplateCtrl',
                controllerAs: 'vm'
            });
    }
})();
