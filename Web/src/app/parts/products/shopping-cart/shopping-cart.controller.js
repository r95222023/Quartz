(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ShoppingCartController', ShoppingCartController);

    /* @ngInject */
    function ShoppingCartController($q, $allpay, $rootScope, ngCart, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;
        vm.getOrder = function () {
            var order= {
                    clientInfo: {
                        uid: $rootScope.user.uid
                    },
                    cart: {},
                    payment: {}
                };

            var items = ngCart.getItems();
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                order.cart[item.getId()] = {
                    name: item.getName(),
                    price: item.getPrice(),
                    quantity: item.getQuantity(),
                    data: item.getData()
                }
            }
            console.log(order.cart);
            order.totalAmount=ngCart.totalCost();
            angular.extend(order, $allpay.getAllpayForm(order));
            vm.order = order;
        };

        vm.getOrder();
    }
})();
