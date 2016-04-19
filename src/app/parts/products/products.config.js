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
                url: '/:siteName/prodcuts/list/?&cate&subCate&queryString&tag',
                templateUrl: 'app/parts/products/list/list.tmpl.html',
                // set the controller to load for this page
                controller: 'ProductListController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.productDetail', {
                url: '/:siteName/products/:id/detail',
                templateUrl: 'app/parts/products/detail/detail.tmpl.html',
                // set the controller to load for this page
                controller: 'ProductDetailController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.shoppingCart', {
                url: '/:siteName/shoppingcart',
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
                url: '/:siteName/products/manager/?orderBy&startAt&endAt&equalTo',
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
                url: '/:siteName/order-history/?orderBy&startAt&endAt&equalTo',
                templateUrl: 'app/parts/products/order-history/order-history.tmpl.html',
                controller: 'OrderHistoryController',
                controllerAs: 'vm'
            })
            .stateAuthenticated('quartz.admin-default.yourOrders', {
                url: '/:siteName/yourOrders/?orderBy&startAt&endAt&equalTo',
                templateUrl: 'app/parts/products/your-orders/your-orders.tmpl.html',
                controller: 'YourOrdersController',
                controllerAs: 'vm',
                resolve:{
                    authData: ['Auth', function (Auth) {
                        return Auth.$waitForAuth()
                    }]
                }
            });

        qtMenuProvider.addMenuToGroup("siteSelected",{
            name: 'MENU.PRODUCTS.NAME',
            icon: 'fa fa-shopping-cart',
            type: 'dropdown',
            priority: 1.4,
            children: [{
                name: 'MENU.PRODUCTS.LIST',
                state: 'quartz.admin-default.productList',
                params: {cate: 'all',subCate:'all',queryString:''},
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
            },{
                name: 'MENU.YOURORDERS',
                state: 'quartz.admin-default.yourOrders',
                type: 'link'
            }]
        });
    }
})();
