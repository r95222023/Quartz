(function () {
    'use strict';

    angular
        .module('app.parts.pages')
        .config(productsConfig);

    /* @ngInject */
    function productsConfig($stateProvider, qtMenuProvider) {
        $stateProvider
            .state('quartz.admin-default.pageManager', {
                url: '/dashboard/pageManager',
                templateUrl: 'app/parts/pages/manager.tmpl.html',
                controller: 'PageManagerController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.pageEditor', {
                data: {
                    layout: {
                        sideMenuSize: 'hidden'
                    }
                },
                url: '/dashboard/pageEditor/:pageName',
                templateUrl: 'app/parts/pages/editor.tmpl.html',
                controller: 'PageEditorController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.customPage', {
                url: '/:pageName/?params1&params2',
                templateUrl: 'app/parts/pages/custom-page.tmpl.html',
                controller: 'CustomPageController',
                controllerAs: 'vm'
            });

        qtMenuProvider.addMenu({
            name: 'MENU.PAGES.MANAGER',
            icon: 'fa fa-pencil-square-o',
            type: 'link',
            priority: 1.5,
            state: 'quartz.admin-default.pageManager',
            params: {cate: 'all',subCate:'all',queryString:''}
        });
    }
})();
