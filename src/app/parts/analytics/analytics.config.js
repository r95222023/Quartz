(function () {
    'use strict';

    angular
        .module('app.parts.analytics')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $stateProvider
            .state('quartz.admin-default.analytics', {
                data: {
                    layout: {
                        contentClass:'admin-card-container',
                        footer: false
                    }
                },
                url: '/admin/:siteName/analytics',
                resolve:{
                    chartjs:['$ocLazyLoad','$transitions','injectCSS',function($ocLazyLoad,$transitions,injectCSS){
                        return $ocLazyLoad.load({
                            serie:true,
                            files:[
                                'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.3.0/Chart.min.js',
                                'https://cdnjs.cloudflare.com/ajax/libs/angular-chart.js/1.0.3/angular-chart.min.js'
                            ]
                        });
                    }]
                },
                params: {
                    siteName: ''
                },
                templateUrl: 'app/parts/analytics/analytics.tmpl.html',
                // set the controller to load for this page
                controller: 'AnalyticsController',
                controllerAs: 'vm'
            });
    }
})();
