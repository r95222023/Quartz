(function () {
    'use strict';

    angular
        .module('app.parts.analytics')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $stateProvider
            .state('quartz.admin-default.lists', {
                data: {
                    //toolbarShrink: true,
                    footer: false
                },
                url: '/admin/:siteName/lists',
                templateUrl: 'app/parts/data/lists.tmpl.html',
                // set the controller to load for this page
                controller: 'CustomListController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default-no-scroll.fileManager', {
                data: {
                    layout: {
                        // sideMenuSize: 'hidden',
                        // showToolbar: false,
                        // //toolbarShrink: true,
                        contentClass: 'full-height',
                        // innerContentClass:'full-height',
                        footer: false
                    }
                },
                resolve:{
                    fileManager:['$ocLazyLoad','$rootScope','injectCSS',function($ocLazyLoad,$rootScope,injectCSS){
                        var load = $ocLazyLoad.load({
                            serie:true,
                            files:[
                                'assets/modules/bootstrap/dist/js/bootstrap.min.js',
                                'assets/modules/file-manager/angular-filemanager.min.js',
                                'assets/modules/file-manager/angular-filemanager.config.js'
                            ]
                        });
                        injectCSS.set('bootstrapcss', 'assets/modules/bootswatch/paper/bootstrap.min.css');
                        injectCSS.set('filemanagercss', 'assets/modules/file-manager/angular-filemanager.min.css');

                        var clean =$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
                            console.log(event, toState, toParams, fromState, fromParams, options)
                            injectCSS.remove('bootstrapcss');
                            injectCSS.remove('filemanagercss');
                            clean();
                        });
                        return load;
                    }]
                },
                url: '/admin/:siteName/files',
                // set the controller to load for this page
                // controller: 'FileManagerController',
                // controllerAs: 'vm',
                template: '<angular-filemanager></angular-filemanager>'
            })
            .state('quartz.admin-default.i18n', {
                data: {
                    //toolbarShrink: true,
                    footer: false
                },
                url: '/admin/:siteName/i18n',
                templateUrl: 'app/parts/data/i18n.tmpl.html',
                // set the controller to load for this page
                controller: 'I18nController',
                controllerAs: 'vm'
            });
    }
})();
