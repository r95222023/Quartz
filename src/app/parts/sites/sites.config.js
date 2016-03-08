(function() {
    'use strict';

    angular
        .module('app.parts.sites')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/parts/sites');

        $stateProvider
        .state('quartz.admin-default.sites', {
            data: {
                layout: {
                    sideMenuSize: 'hidden',
                    //toolbarShrink: true,
                    footer: false
                }
            },
            resolve:{
                authData:['Auth', function(Auth){
                    return Auth.$waitForAuth()
                }]
            },
            url: '/sites',
            templateUrl: 'app/parts/sites/sites.tmpl.html',
            // set the controller to load for this page
            controller: 'SitesController',
            controllerAs: 'vm'
        });

        qtMenuProvider.addMenu({
            name: 'MENU.SITES',
            icon: 'zmdi zmdi-home',
            type: 'link',
            priority: 1.2,
            state: 'quartz.admin-default.sites'
        });
    }
})();
