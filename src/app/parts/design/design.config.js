(function () {
    'use strict';

    angular
        .module('app.parts.design')
        .config(pagesConfig);

    /* @ngInject */
    function pagesConfig($stateProvider, qtMenuProvider, $translatePartialLoaderProvider) {
        var tmplRoot = 'app/parts/design/templates/',
            templateList = ['button'];
        $translatePartialLoaderProvider.addPart('app/parts/design');
        $stateProvider
            .state('quartz.admin-default.pageManager', {
                url: '/admin/:siteName/pageManager',
                templateUrl: 'app/parts/design/page-manager.tmpl.html',
                controller: 'PageManagerController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.widgetManager', {
                url: '/admin/:siteName/widgetManager',
                templateUrl: 'app/parts/design/widget-manager.tmpl.html',
                controller: 'WidgetManagerController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default-no-scroll.pageEditor', {
                data: {
                    layout: {
                        sideMenuSize: 'hidden',
                        showToolbar: false,
                        // //toolbarShrink: true,
                        contentClass: 'layout-fill',
                        // innerContentClass:'full-height',
                        footer: false
                    }
                },
                resolve: {
                    customWidgets: ['$q', '$firebase', function ($q, $firebase) {
                        var def = $q.defer();
                        $firebase.ref('widgets/detail@selectedSite').once('value', function (snap) {
                            def.resolve(snap.val())
                        });
                        return def.promise;
                    }],
                    pageData:['$firebaseStorage', '$stateParams', function($firebaseStorage, $stateParams){
                        return $firebaseStorage.getWithCache('pages/detail/' + $stateParams.pageName + '@selectedSite');
                    }]
                },
                url: '/admin/:siteName/pageEditor/?id&pageName&params',
                templateUrl: 'app/parts/design/page-editor.tmpl.html',
                controller: 'PageEditorController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default-no-scroll.widgetEditor', {
                data: {
                    layout: {
                        sideMenuSize: 'hidden',
                        showToolbar: false,
                        //toolbarShrink: true,
                        contentClass:'full-height',
                        footer: false
                    }
                },
                resolve:{
                    widgetData:['$lazyLoad', '$stateParams', function($lazyLoad, $stateParams){
                        return $lazyLoad.load('widget',$stateParams.widgetName);
                    }]
                },
                url: '/admin/:siteName/widgetEditor/?id&widgetName',
                templateUrl: 'app/parts/design/widget-editor.tmpl.html',
                controller: 'WidgetEditorController',
                controllerAs: 'vm'
            })
            .state('customPage', {
                url: '/:siteName/:pageName/?id&params&params2&cate&subCate&queryString&tag&devMode',
                resolve: {
                    getSyncTime: ['syncTime', function (syncTime) {
                        return syncTime.onReady();
                    }],
                    authData: ['$auth', function ($auth) {
                        return $auth.waitForAuth()
                    }],
                    pageData:['$lazyLoad', '$stateParams', function($lazyLoad, $stateParams){
                        return $lazyLoad.load('page', $stateParams.pageName);
                    }]
                },
                templateUrl: 'app/parts/design/custom-page.tmpl.html',
                controller: 'CustomPageController',
                controllerAs: 'customPage'
            })
            .state('previewFrame', {
                url: '/preview/:siteName/:pageName/',
                templateUrl: 'app/parts/design/custom-page.tmpl.html',
                controller: 'PreviewFrameController',
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
                    }]/*,
                    sitesData:['sitesService', function(sitesService){
                        return sitesService.onReady();
                    }]*/
                },
                data: {
                    layout: {
                        footer: false
                    }
                },
                templateUrl: 'app/parts/design/setting/setting.tmpl.html',
                controller: 'SiteSettingCtrl',
                controllerAs: 'vm'
            });
    }
})();
