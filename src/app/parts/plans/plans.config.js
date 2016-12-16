(function () {
    'use strict';

    angular
        .module('app.parts.analytics')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/parts/plans');
        $stateProvider
            .state('quartz.admin-default.billingHistory', {
                data: {
                    layout: {
                        contentClass:'admin-card-container',
                        footer: false
                    }
                },
                url: '/admin/billingHistory',
                params: {
                    siteName: ''
                },
                templateUrl: 'app/parts/plans/billing-history.html',
                // set the controller to load for this page
                controller: 'BillingHistoryCtrl',
                controllerAs: 'vm'
            });
    }
})();
