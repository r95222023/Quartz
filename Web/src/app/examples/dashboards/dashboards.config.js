(function() {
    'use strict';

    angular
        .module('app.examples.dashboards')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/examples/dashboards');

        $stateProvider
        .state('quartz.sales-layout', {
            abstract: true,
            views: {
                sidebarLeft: {
                    templateUrl: 'app/quartz/components/menu/menu.tmpl.html',
                    controller: 'MenuController',
                    controllerAs: 'vm'
                },
                content: {
                    template: '<div id="admin-panel-content-view" flex ui-view></div>'
                },
                belowContent: {
                    template: '<div ui-view="belowContent"></div>'
                }
            }
        })
        .state('quartz.admin-default.dashboard-general', {
            url: '/dashboards/general',
            templateUrl: 'app/examples/dashboards/general/dashboard-general.tmpl.html'
        })
        .state('quartz.admin-default.dashboard-analytics', {
            url: '/dashboards/analytics',
            templateUrl: 'app/examples/dashboards/analytics/dashboard-analytics.tmpl.html',
            controller: 'DashboardAnalyticsController',
            controllerAs: 'vm'
        })
        .state('quartz.admin-default.dashboard-server', {
            url: '/dashboards/server',
            templateUrl: 'app/examples/dashboards/server/dashboard-server.tmpl.html',
            controller: 'DashboardServerController',
            controllerAs: 'vm'
        })
        .state('quartz.admin-default.dashboard-widgets', {
            url: '/dashboards/widgets',
            templateUrl: 'app/examples/dashboards/widgets.tmpl.html'
        })
        .state('quartz.admin-default.dashboard-social', {
            url: '/dashboards/social',
            templateUrl: 'app/examples/dashboards/social/dashboard-social.tmpl.html',
            controller: 'DashboardSocialController',
            controllerAs: 'vm'
        })
        .state('quartz.admin-default.dashboard-sales', {
            url: '/dashboards/sales',
            data: {
                layout: {
                    showToolbar: false
                }
            },
            views: {
                '': {
                    templateUrl: 'app/examples/dashboards/sales/dashboard-sales.tmpl.html',
                    controller: 'DashboardSalesController',
                    controllerAs: 'vm'
                },
                'belowContent': {
                    templateUrl: 'app/examples/dashboards/sales/fab-button.tmpl.html',
                    controller: 'SalesFabController',
                    controllerAs: 'vm'
                }
            }
        })
        .state('quartz.admin-default.dashboard-draggable', {
            url: '/dashboards/draggable-widgets',
            templateUrl: 'app/examples/dashboards/dashboard-draggable.tmpl.html',
            controller: 'DashboardDraggableController',
            controllerAs: 'vm'
        });

        qtMenuProvider.addMenu({
            name: 'MENU.DASHBOARDS.DASHBOARDS',
            icon: 'fa fa-dashboard',
            type: 'dropdown',
            priority: 1.2,
            children: [{
                name: 'MENU.DASHBOARDS.GENERAL',
                state: 'quartz.admin-default.dashboard-general',
                type: 'link'
            }, {
                name: 'MENU.DASHBOARDS.ANALYTICS',
                state: 'quartz.admin-default.dashboard-analytics',
                type: 'link'
            },{
                name: 'MENU.DASHBOARDS.SALES',
                state: 'quartz.admin-default.dashboard-sales',
                type: 'link'
            },{
                name: 'MENU.DASHBOARDS.SERVER',
                state: 'quartz.admin-default.dashboard-server',
                type: 'link'
            },{
                name: 'MENU.DASHBOARDS.SOCIAL',
                state: 'quartz.admin-default.dashboard-social',
                type: 'link'
            },{
                name: 'MENU.DASHBOARDS.WIDGETS',
                state: 'quartz.admin-default.dashboard-widgets',
                type: 'link'
            },{
                name: 'MENU.DASHBOARDS.DRAGGABLE',
                state: 'quartz.admin-default.dashboard-draggable',
                type: 'link'
            }]
        });

    }
})();
