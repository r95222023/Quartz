(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .config(productsConfig);

    /* @ngInject */
    function productsConfig($translatePartialLoaderProvider, $stateProvider) {
        $translatePartialLoaderProvider.addPart('app/parts/overview');
        $stateProvider
            .state('quartz.admin-default.overview', {
                url: '/admin/:siteName/overview',
                data: {
                    layout: {
                        contentClass:'admin-card-container',
                        footer: false
                    }
                },
                params: {
                    siteName: ''
                },
                templateUrl: 'app/parts/overview/overview.tmpl.html',
                controller: 'OverviewCtrl',
                controllerAs: 'vm'
            })
    }
})();
