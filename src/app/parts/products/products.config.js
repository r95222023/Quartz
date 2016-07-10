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
                controller: 'ProductListController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.productDetail', {
                url: '/:siteName/products/:id/detail',
                templateUrl: 'app/parts/products/detail/detail.tmpl.html',
                controller: 'ProductDetailController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.shoppingCart', {
                url: '/:siteName/shoppingcart',
                templateUrl: 'app/parts/products/shopping-cart/shopping-cart.tmpl.html',
                controller: 'ShoppingCartController',
                controllerAs: 'vm',
                resolve: {
                    getServerTime: ['syncTime', function (syncTime) {
                        return syncTime.onReady()
                    }]
                }
            })
            .state('quartz.admin-default.allpay-checkout', {
                url: '/:siteName/checkout',
                templateUrl: 'app/parts/products/checkout/allpay-checkout.tmpl.html',
                controller: 'AllpayCheckoutCtrl',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.productManager', {
                url: '/admin/:siteName/products/manager/?orderBy&startAt&endAt&equalTo',
                templateUrl: 'app/parts/products/manager/products.tmpl.html',
                controller: 'ProductManagerController',
                controllerAs: 'vm',
                resolve: {
                    getServerTime: ['syncTime', function (syncTime) {
                        return syncTime.onReady()
                    }]
                }
            })
            .state('quartz.admin-default.categoryManager', {
                url: '/admin/:siteName/products/manager/?orderBy&startAt&endAt&equalTo',
                templateUrl: 'app/parts/products/manager/categories.tmpl.html',
                controller: 'CateManagerController',
                controllerAs: 'vm',
                resolve: {
                    getServerTime: ['syncTime', function (syncTime) {
                        return syncTime.onReady()
                    }]
                }
            })
            .state('quartz.admin-default.orderHistory', {
                url: '/admin/:siteName/order-history/?orderBy&startAt&endAt&equalTo',
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
                    authData: ['$auth', function ($auth) {
                        return $auth.waitForAuth()
                    }]
                }
            });

    }
})();
