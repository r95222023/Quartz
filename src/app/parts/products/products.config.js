(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .config(productsConfig);

    /* @ngInject */
    function productsConfig($translatePartialLoaderProvider, $stateProvider) {
        $translatePartialLoaderProvider.addPart('app/parts/products');
        $stateProvider
            .state('quartz.admin-default.products', {
                url: '/admin/:siteName/products/',
                params: {
                    siteName: ''
                },
                data: {
                    layout: {
                        // sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        contentClass:'admin-card-container',
                        footer: false
                    }
                },
                template: '<ui-view></ui-view>',
                // controller: 'ProductsController',
                // controllerAs: 'common',
                resolve: {
                    getServerTime: _core.syncTime
                }
            })
            .state('quartz.admin-default.products.manager', {
                url: 'manager/?orderBy&startAt&endAt&equalTo',
                params: {
                    orderBy: '',
                    startAt: '',
                    endAt: '',
                    equalTo: ''
                },
                templateUrl: 'app/parts/products/manager/manager.tmpl.html',
                controller: 'ProductManagerController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.products.category', {
                url: 'category/?orderBy&startAt&endAt&equalTo',
                params: {
                    orderBy: '',
                    startAt: '',
                    endAt: '',
                    equalTo: ''
                },
                templateUrl: 'app/parts/products/manager/categories.tmpl.html',
                controller: 'CateManagerController',
                controllerAs: 'vm'
            })
            .state('quartz.admin-default.orderHistory', {
                url: '/admin/:siteName/order-history/?orderBy&startAt&endAt&equalTo',
                data: {
                    layout: {
                        // sideMenuSize: 'hidden',
                        //toolbarShrink: true,
                        contentClass:'admin-card-container',
                        footer: false
                    }
                },
                params: {
                    siteName: '',
                    orderBy: '',
                    startAt: '',
                    endAt: '',
                    equalTo: ''
                },
                templateUrl: 'app/parts/products/order-history/order-history.tmpl.html',
                controller: 'OrderHistoryController',
                controllerAs: 'vm'
            })
            // .state('quartz.admin-default.productList', {
            //     url: '/:siteName/prodcuts/list/?&cate&subCate&queryString&tag',
            //     params: {
            //         siteName: '',
            //         cate: '',
            //         subCate: '',
            //         queryString: '',
            //         tag: ''
            //     },
            //     templateUrl: 'app/parts/products/list/list.tmpl.html',
            //     controller: 'ProductListController',
            //     controllerAs: 'vm'
            // })
            // .state('quartz.admin-default.shoppingCart', {
            //     url: '/:siteName/shoppingcart',
            //     params: {
            //         siteName: ''
            //     },
            //     templateUrl: 'app/parts/products/shopping-cart/shopping-cart.tmpl.html',
            //     controller: 'ShoppingCartController',
            //     controllerAs: 'vm',
            //     resolve: {
            //         getSyncTime: function () {
            //             return _core.syncTime();
            //         }
            //     }
            // })

            .stateAuthenticated('quartz.admin-default.yourOrders', {
                url: '/:siteName/yourOrders/?orderBy&startAt&endAt&equalTo',
                params: {
                    siteName: '',
                    orderBy: '',
                    startAt: '',
                    endAt: '',
                    equalTo: ''
                },
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
