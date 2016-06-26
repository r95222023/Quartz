(function () {
    'use strict';

    angular
        .module('app.parts.articles')
        .config(articlesConfig);

    /* @ngInject */
    function articlesConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {

        $translatePartialLoaderProvider.addPart('app/parts/articles');
        $stateProvider
            .state('quartz.admin-default.articleList', {
                url: '/:siteName/articles/list/?&cate&subCate&queryString&tag',
                templateUrl: 'app/parts/articles/list/list.tmpl.html',
                // set the controller to load for this page
                controller: 'ArticleListController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.articleDetail', {
                url: '/:siteName/articles/:id/detail',
                templateUrl: 'app/parts/articles/detail/detail.tmpl.html',
                // set the controller to load for this page
                controller: 'ArticleDetailController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.articleManager', {
                url: '/admin/:siteName/articles/manager/?orderBy&startAt&endAt&equalTo',
                templateUrl: 'app/parts/articles/manager/articles.tmpl.html',
                controller: 'ArticleManagerController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.articleCategoryManager', {
                url: '/admin/:siteName/articles/manager/?orderBy&startAt&endAt&equalTo',
                templateUrl: 'app/parts/articles/manager/categories.tmpl.html',
                controller: 'ArticleCateManagerController',
                controllerAs: 'vm'
            });
    }
})();
