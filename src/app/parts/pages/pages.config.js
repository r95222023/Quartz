(function () {
    'use strict';

    angular
        .module('app.parts.pages')
        .config(pagesConfig);

    /* @ngInject */
    function pagesConfig($stateProvider, qtMenuProvider, $translatePartialLoaderProvider) {
        var tmplRoot = 'app/parts/pages/templates/',
            templateList = ['button'];
        $translatePartialLoaderProvider.addPart('app/parts/pages');
        $stateProvider
            .state('quartz.admin-default.pageManager', {
                url: '/admin/:siteName/pageManager',
                templateUrl: 'app/parts/pages/page-manager.tmpl.html',
                controller: 'PageManagerController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.widgetManager', {
                url: '/admin/:siteName/widgetManager',
                templateUrl: 'app/parts/pages/widget-manager.tmpl.html',
                controller: 'WidgetManagerController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default-no-scroll.pageEditor', {
                data: {
                    layout: {
                        sideMenuSize: 'hidden',
                        showToolbar: false,
                        // //toolbarShrink: true,
                        // contentClass: 'full-height',
                        // innerContentClass:'full-height',
                        footer: false
                    }
                },
                resolve: {
                    getAllTemplates: ['customService', function (customService) {
                        return customService.getAllTemplates(templateList, tmplRoot)
                    }],
                    customWidgets: ['$q', '$firebase', function ($q, $firebase) {
                        var def = $q.defer();
                        $firebase.ref('widgets/detail@selectedSite').once('value', function (snap) {
                            def.resolve(snap.val())
                        });
                        return def.promise;
                    }]
                },
                url: '/admin/:siteName/pageEditor/?id&pageName&params',
                templateUrl: 'app/parts/pages/page-editor.tmpl.html',
                controller: 'PageEditorController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default-no-scroll.widgetEditor', {
                data: {
                    layout: {
                        sideMenuSize: 'hidden',
                        showToolbar: false,
                        //toolbarShrink: true,
                        footer: false
                    }
                },
                resolve: {
                    getAllTemplates: ['customService', function (customService) {
                        return customService.getAllTemplates(templateList, tmplRoot)
                    }]
                },
                url: '/admin/:siteName/widgetEditor/?id&widgetName',
                templateUrl: 'app/parts/pages/widget-editor.tmpl.html',
                controller: 'WidgetEditorController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.customPage', {
                url: '/:siteName/:pageName/?id&params&params2&cate&subCate&queryString&tag&devMode',
                resolve: {
                    getAllTemplates: ['customService', function (customService) {
                        return customService.getAllTemplates(templateList, tmplRoot)
                    }], getSyncTime: ['syncTime', function (syncTime) {
                        return syncTime.onReady();
                    }],
                    authData: ['$auth', function ($auth) {
                        return $auth.waitForAuth()
                    }]
                },
                data: {
                    layout: {
                        sideMenuSize: 'hidden',
                        showToolbar: false,
                        //toolbarShrink: true,
                        footer: false
                    }
                },
                templateUrl: 'app/parts/pages/custom-page.tmpl.html',
                controller: 'CustomPageController',
                controllerAs: 'customPage'
            })
            .state('quartz.admin-default.siteSetting', {
                url: '/:siteName/?id&params&params2&devMode',
                resolve: {
                    getSyncTime: ['syncTime', function (syncTime) {
                        return syncTime.onReady();
                    }],
                    authData: ['$auth', function ($auth) {
                        return $auth.waitForAuth()
                    }],
                    sitesData:['sitesService', function(sitesService){
                        return sitesService.onReady();
                    }]
                },
                data: {
                    layout: {
                        footer: false
                    }
                },
                templateUrl: 'app/parts/pages/setting/setting.tmpl.html',
                controller: 'SiteSettingCtrl',
                controllerAs: 'vm'
            });
    }
})();
