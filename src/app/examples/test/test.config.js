(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/examples/test');

        $stateProvider
            .state('quartz.admin-default.pay2goTest', {
                url: '/test/pay2goTest',
                templateUrl: 'app/examples/test/pay2goTest.tmpl.html',
                controller: 'Pay2goTestController',
                controllerAs: 'vm'
            }).state('quartz.admin-default.allpayTest', {
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
        });

        qtMenuProvider.addMenu({
            name: 'MENU.TEST.GROUP-NAME',
            icon: 'fa fa-file-text',
            type: 'dropdown',
            priority: 10.1,
            children: [/*{
             name: 'MENU.TEST.PAY2GO',
             // point this menu to the state we created in the $stateProvider above
             state: 'quartz.admin-default.pay2goTest',
             // set the menu type to a link
             type: 'link'
             },*/
                {
                    name: 'MENU.TEST.ALLPAY',
                    // point this menu to the state we created in the $stateProvider above
                    state: 'quartz.admin-default.allpayTest',
                    // set the menu type to a link
                    type: 'link'
                }, {
                    name: 'MENU.TEST.STRIPE',
                    state: 'quartz.admin-default.stripeTest',
                    type: 'link'
                }, {
                    name: 'MENU.TEST.CRYPTO',
                    // point this menu to the state we created in the $stateProvider above
                    state: 'quartz.admin-default.cryptoTest',
                    // set the menu type to a link
                    type: 'link'
                }]
        });
    }
})();
