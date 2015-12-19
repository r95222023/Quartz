(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .config(productsConfig)
        .run(productsRun);

    /* @ngInject */
    function productsConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/parts/products');

        $stateProvider
            .state('quartz.admin-default.productList', {
                url: '/prodcuts/list',
                templateUrl: 'app/parts/products/list/list.tmpl.html',
                // set the controller to load for this page
                controller: 'ProductListController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.productDetail', {
                url: '/products/:id/detail',
                templateUrl: 'app/parts/products/detail/detail.tmpl.html',
                // set the controller to load for this page
                controller: 'ProductDetailController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.shoppingCart', {
                url: '/products/shoppingcart',
                templateUrl: 'app/parts/products/shopping-cart/shopping-cart.tmpl.html',
                // set the controller to load for this page
                controller: 'ShoppingCartController',
                controllerAs: 'vm'
            });

        qtMenuProvider.addMenu({
            name: 'MENU.PRODUCTS.CART',
            icon: 'fa fa-shopping-cart',
            type: 'dropdown',
            priority: 1.4,
            children: [{
                name: 'MENU.PRODUCTS.LIST',
                state: 'quartz.admin-default.productList',
                type: 'link'
            }, {
                name: 'MENU.PRODUCTS.DETAIL',
                state: 'quartz.admin-default.productDetail',
                type: 'link'
            }, {
                name: 'MENU.PRODUCTS.SHOPPINGCART',
                state: 'quartz.admin-default.shoppingCart',
                type: 'link'
            }]
        });
    }

    /* @ngInject */
    function productsRun($rootScope, ngCart, $allpay) {
        ngCart.order = {};
        function getAllpayOrder() {
            if (!$rootScope.user) return;
            var order = {
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
            order.totalAmount = ngCart.totalCost();
            angular.extend(order, $allpay.getAllpayForm(order));
            ngCart.order.allpay = order;
        }

        ngCart.getAllpayOrder = getAllpayOrder;

        getAllpayOrder();
        $rootScope.$on('ngCart:change', function () {
            getAllpayOrder();
        });
    }
})();
