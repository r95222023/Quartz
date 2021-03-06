(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ShoppingCartController', ShoppingCartController);

    /* @ngInject */
    function ShoppingCartController(getServerTime, $q, ngCart, qtNotificationsService, $state, $mdDialog, config, orderService) {
        var vm = this;
        vm.order = orderService.order;
        vm.isCartEmpty = function () {
            return ngCart.getTotalItems() !== 0
        };
        // orderService.buildOrder('allpay');
        // orderService.buildOrder('stripe');

        vm.buildStripeOrder = function () {
            return orderService.buildOrder('stripe');
        };
        vm.buildAllpayOrder = function () {
            return orderService.buildOrder('allpay');
        };
    }
})();
