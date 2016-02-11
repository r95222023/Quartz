(function () {
    'use strict';

    angular
        .module('app.parts.pages')
        .config(productsConfig);

    /* @ngInject */
    function productsConfig($stateProvider, qtMenuProvider,$translatePartialLoaderProvider) {
        var tmplRoot='app/parts/pages/templates/',
            templateList=['button'];
        $translatePartialLoaderProvider.addPart('app/parts/pages');
        $stateProvider
            .state('quartz.admin-default.pageManager', {
                url: '/dashboard/pageManager',
                templateUrl: 'app/parts/pages/page-manager.tmpl.html',
                controller: 'PageManagerController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.widgetManager', {
                url: '/dashboard/widgetManager',
                templateUrl: 'app/parts/pages/widget-manager.tmpl.html',
                controller: 'WidgetManagerController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.pageEditor', {
                data: {
                    layout: {
                        sideMenuSize: 'hidden'
                    }
                },
                resolve:{
                    getAllTemplates:['customService', function(customService){
                        return customService.getAllTemplates(templateList, tmplRoot)
                    }],
                    customWidgets:['$q','$firebase', function($q,$firebase){
                        var def=$q.defer();
                        $firebase.ref('widgets').once('value', function(snap){
                            def.resolve(snap.val())
                        });
                        return def.promise;
                    }]
                },
                url: '/dashboard/pageEditor/:pageName',
                templateUrl: 'app/parts/pages/page-editor.tmpl.html',
                controller: 'PageEditorController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.widgetEditor', {
                data: {
                    layout: {
                        sideMenuSize: 'hidden'
                    }
                },
                resolve:{
                    getAllTemplates:['customService', function(customService){
                        return customService.getAllTemplates(templateList, tmplRoot)
                    }]
                },
                url: '/dashboard/widgetEditor/:widgetName',
                templateUrl: 'app/parts/pages/widget-editor.tmpl.html',
                controller: 'WidgetEditorController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.customPage', {
                url: '/:pageName/?id&params1&params2&cate&subCate&queryString&tag',
                resolve:{
                    getAllTemplates:['customService', function(customService){
                        return customService.getAllTemplates(templateList, tmplRoot)
                    }]
                },
                templateUrl: 'app/parts/pages/custom-page.tmpl.html',
                controller: 'CustomPageController',
                controllerAs: 'customPage'
            });

        qtMenuProvider.addMenu({
            name: 'MENU.PAGES.MENUNAME',
            icon: 'fa fa-pencil-square-o',
            type: 'dropdown',
            priority: 1.5,
            children:[
                {
                    name: 'MENU.PAGES.PAGEMANAGER',
                    state: 'quartz.admin-default.pageManager',
                    params: {cate: 'all',subCate:'all',queryString:''},
                    type: 'link'
                },
                {
                    name: 'MENU.PAGES.WIDGETMANAGER',
                    state: 'quartz.admin-default.widgetManager',
                    params: {cate: 'all',subCate:'all',queryString:''},
                    type: 'link'
                }
            ]

        });
    }
})();
