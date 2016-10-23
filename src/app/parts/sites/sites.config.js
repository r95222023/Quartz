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
                        contentClass:'admin-card-container',
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
            .state('quartz.admin-default.site-setting', {
                data: {
                    layout: {
                        // sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        contentClass:'admin-card-container',
                        footer: false
                    }
                },
                resolve: {
                    getSyncTime: _core.syncTime,
                    authData: ['$auth', function ($auth) {
                        return $auth.waitForAuth()
                    }]
                },
                url: '/admin/:siteName/setting/',
                params: {
                    siteName: ''
                },
                template: '<ui-view></ui-view>',
                // set the controller to load for this page
                controller: 'SiteSettingCtrl',
                controllerAs: 'common'
            })
            .state('quartz.admin-default.site-setting.basic', {
                url: 'basic',
                templateUrl: 'app/parts/sites/settings/basic.tmpl.html'
            })
            .state('quartz.admin-default.site-setting.analytics', {
                url: 'analytics',
                templateUrl: 'app/parts/sites/settings/analytics.html'
            })
            .state('quartz.admin-default.site-setting.advance', {
                url: 'advance',
                templateUrl: 'app/parts/sites/settings/advance.tmpl.html',
                controller: 'SiteSettingAdvanceCtrl',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.site-setting.payment', {
                url: 'payment',
                templateUrl: 'app/parts/sites/settings/payment.tmpl.html',
                // set the controller to load for this page
                controller: 'SiteSettingPaymentCtrl',
                controllerAs: 'payment'
            })
            .state('quartz.admin-default.template', {
                data: {
                    layout: {
                        // sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        footer: false
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
