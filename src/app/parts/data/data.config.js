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
