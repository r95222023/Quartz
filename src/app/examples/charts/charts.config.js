(function() {
    'use strict';

    angular
        .module('app.examples.charts')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/examples/charts');

        $stateProvider
        .state('quartz.admin-default.charts-google-bar', {
            url: '/charts/google/bar',
            templateUrl: 'app/examples/charts/google-bar.tmpl.html'
        })
        .state('quartz.admin-default.charts-google-scatter', {
            url: '/charts/google/scatter',
            templateUrl: 'app/examples/charts/google-scatter.tmpl.html'
        })
        .state('quartz.admin-default.charts-google-line', {
            url: '/charts/google/line',
            templateUrl: 'app/examples/charts/google-line.tmpl.html'
        })
        .state('quartz.admin-default.charts-chartjs-bar', {
            url: '/charts/chartjs/bar',
            templateUrl: 'app/examples/charts/chartjs-bar.tmpl.html'
        })
        .state('quartz.admin-default.charts-chartjs-pie', {
            url: '/charts/chartjs/pie',
            templateUrl: 'app/examples/charts/chartjs-pie.tmpl.html'
        })
        .state('quartz.admin-default.charts-chartjs-ticker', {
            url: '/charts/chartjs/ticker',
            templateUrl: 'app/examples/charts/chartjs-ticker.tmpl.html'
        })
        .state('quartz.admin-default.charts-chartjs-line', {
            url: '/charts/chartjs/line',
            templateUrl: 'app/examples/charts/chartjs-line.tmpl.html'
        });

        qtMenuProvider.addMenu({
            name: 'MENU.CHARTS.CHARTS',
            icon: 'zmdi zmdi-chart',
            type: 'dropdown',
            priority: 3.2,
            children: [{
                name: 'MENU.CHARTS.GOOGLE',
                type: 'dropdown',
                children: [{
                    name: 'MENU.CHARTS.BAR',
                    state: 'quartz.admin-default.charts-google-bar',
                    type: 'link'
                },{
                    name: 'MENU.CHARTS.SCATTER',
                    state: 'quartz.admin-default.charts-google-scatter',
                    type: 'link'
                },{
                    name: 'MENU.CHARTS.LINE',
                    state: 'quartz.admin-default.charts-google-line',
                    type: 'link'
                }]
            },{
                name: 'MENU.CHARTS.CHARTJS',
                type: 'dropdown',
                children: [{
                    name: 'MENU.CHARTS.BAR',
                    state: 'quartz.admin-default.charts-chartjs-bar',
                    type: 'link'
                },{
                    name: 'MENU.CHARTS.LINE',
                    state: 'quartz.admin-default.charts-chartjs-line',
                    type: 'link'
                },{
                    name: 'MENU.CHARTS.PIE',
                    state: 'quartz.admin-default.charts-chartjs-pie',
                    type: 'link'
                },{
                    name: 'MENU.CHARTS.TICKER',
                    state: 'quartz.admin-default.charts-chartjs-ticker',
                    type: 'link'
                }]
            }]
        });
    }
})();
