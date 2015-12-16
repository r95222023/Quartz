(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ShoppingCartController', ShoppingCartController);

    /* @ngInject */
    function ShoppingCartController($q, ngCart, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;
        vm.order = ngCart.order;
        ngCart.getAllpayOrder();

    //    check products.config to see how to modify ngCart to auto update order
    }
})();
