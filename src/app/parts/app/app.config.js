(function () {
    'use strict';

    angular
        .module('app.parts.app')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider) {
        $translatePartialLoaderProvider.addPart('app/parts/app');
        $stateProvider
            .state('quartz.admin-default.app', {
                data: {
                    layout: {
                        contentClass:'admin-card-container',
                        footer: false
                    }
                },
                url: '/admin/:siteName/app',
                params: {
                    siteName: '',
                    selectedSite:''
                },
                templateUrl: 'app/parts/app/app-builder.html',
                // set the controller to load for this page
                controller: 'AppBuilderCtrl',
                controllerAs: 'ab'
            });
    }
})();
