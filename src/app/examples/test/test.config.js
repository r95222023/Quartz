(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/examples/test');

        $stateProvider
            .state('quartz.admin-default.allpayTest', {
            url: '/test/allpayTest',
            templateUrl: 'app/examples/test/allpayTest.tmpl.html',
            controller: 'AllpayTestController',
            controllerAs: 'vm'
        }).state('quartz.admin-default.stripeTest', {
            url: '/test/stripeTest',
            templateUrl: 'app/examples/test/stripeTest.tmpl.html',
            controller: 'StripeTestController',
            controllerAs: 'vm'
        }).state('quartz.admin-default.cryptoTest', {
            url: '/test/cryptoTest',
            templateUrl: 'app/examples/test/cryptoTest.tmpl.html',
            controller: 'CryptoTestController',
            controllerAs: 'vm'
        }).state('quartz.admin-default.searchTest', {
            url: '/test/searchTest',
            templateUrl: 'app/examples/test/searchTest.tmpl.html',
            controller: 'SearchTestController',
            controllerAs: 'vm'
        });

        qtMenuProvider.addMenu({
            name: 'MENU.TEST.GROUP-NAME',
            icon: 'fa fa-file-text',
            type: 'dropdown',
            priority: 10.1,
            children: [
                {
                    name: 'MENU.TEST.ALLPAY',
                    state: 'quartz.admin-default.allpayTest',
                    type: 'link'
                }, {
                    name: 'MENU.TEST.STRIPE',
                    state: 'quartz.admin-default.stripeTest',
                    type: 'link'
                }, {
                    name: 'MENU.TEST.CRYPTO',
                    state: 'quartz.admin-default.cryptoTest',
                    type: 'link'
                },{
                    name: 'MENU.TEST.SEARCH',
                    state: 'quartz.admin-default.searchTest',
                    type: 'link'
                }]
        });
    }
})();
