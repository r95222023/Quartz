(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .config(productsConfig);

    /* @ngInject */
    function productsConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/parts/products');

        $stateProvider
            .state('quartz.admin-default.productList', {
                url: '/prodcuts/list/?cate&subCate&queryString&tag',
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
                controllerAs: 'vm',
                resolve: {
                    getServerTime: ['syncTime', function (syncTime) {
                        return syncTime.onReady()
                    }]
                }
            })
            .state('quartz.admin-default.productManager', {
                url: '/products/productmanager/?orderBy&startAt&endAt&equalTo',
                templateUrl: 'app/parts/products/manager/manager.tmpl.html',
                controller: 'ProductManagerController',
                controllerAs: 'vm',
                resolve: {
                    getServerTime: ['syncTime', function (syncTime) {
                        return syncTime.onReady()
                    }]
                }
            })
            .state('quartz.admin-default.orderHistory', {
                url: '/order-history/?orderBy&startAt&endAt&equalTo',
                templateUrl: 'app/parts/products/order-history/order-history.tmpl.html',
                controller: 'OrderHistoryController',
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
                params: {cate: 'all',subCate:'all',queryString:''},
                type: 'link'
            }, {
                name: 'MENU.PRODUCTS.DETAIL',
                state: 'quartz.admin-default.productDetail',
                type: 'link'
            }, {
                name: 'MENU.PRODUCTS.MANAGER',
                state: 'quartz.admin-default.productManager',
                type: 'link'
            }, {
                name: 'MENU.PRODUCTS.SHOPPINGCART',
                state: 'quartz.admin-default.shoppingCart',
                type: 'link'
            }, {
                name: 'MENU.ORDERHISTORY',
                state: 'quartz.admin-default.orderHistory',
                type: 'link'
            }]
        });
    }
})();
