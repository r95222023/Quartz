(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('StripeTestController', StripeTestController);

    /* @ngInject */
    function StripeTestController(syncTime, $timeout, $firebase, $rootScope, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        vm.merchant ={
            key:'pk_test_6pRNASCoBOKtIshFeQd4XMUh'
        };
        vm.data = {
            name: 'Quartz',
            description: '2 widgets',
            amount: 2000
        };
        syncTime().then(function (currentTime) {
            console.log(currentTime);
        })
    }
})();
