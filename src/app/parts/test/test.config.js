(function() {
    'use strict';

    angular
        .module('app.parts.test')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($stateProvider, qtMenuProvider) {

        $stateProvider
        .state('quartz.admin-default.test', {
            url: '/:siteName/test',
            data: {
                layout: {
                    contentClass:'admin-card-container',
                    footer: false
                }
            },
            params:{siteName:''},
            templateUrl: 'app/parts/test/test.tmpl.html'
        });
    }
})();
