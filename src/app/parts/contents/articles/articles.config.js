(function () {
    'use strict';

    angular
        .module('app.parts.contents.articles')
        .config(articlesConfig);

    /* @ngInject */
    function articlesConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {

        $translatePartialLoaderProvider.addPart('app/parts/contents/articles');
        $stateProvider
            .state('quartz.admin-default.articles', {
                url: '/admin/:siteName/articles/',
                params: {
                    siteName: ''
                },
                data: {
                    layout: {
                        // sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        contentClass:'admin-card-container',
                        footer: false
                    }
                },
                template: '<ui-view></ui-view>',
                // controller: 'ProductsController',
                // controllerAs: 'common',
                resolve: {
                    getServerTime: _core.syncTime
                }
            })
            .state('quartz.admin-default.articles.manager', {
                url: 'manager/?orderBy&startAt&endAt&equalTo',
                params: {
                    orderBy: '',
                    startAt: '',
                    endAt: '',
                    equalTo: ''
                },
                templateUrl: 'app/parts/contents/articles/manager/manager.tmpl.html',
                controller: 'ArticleManagerController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.articles.category', {
                url: 'category/?orderBy&startAt&endAt&equalTo',
                params: {
                    orderBy: '',
                    startAt: '',
                    endAt: '',
                    equalTo: ''
                },
                templateUrl: 'app/parts/contents/articles/manager/categories.tmpl.html',
                controller: 'ArticleCateManagerController',
                controllerAs: 'vm'
            });
    }
})();
