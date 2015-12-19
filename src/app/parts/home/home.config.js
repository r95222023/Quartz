(function() {
    'use strict';

    angular
        .module('app.parts.home')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/parts/home');

        $stateProvider
        .state('quartz.admin-default.home', {
            url: '/home',
            templateUrl: 'app/parts/home/home.tmpl.html',
            // set the controller to load for this page
            controller: 'HomePageController',
            controllerAs: 'vm'
        });

        qtMenuProvider.addMenu({
            name: 'MENU.HOME',
            icon: 'zmdi zmdi-home',
            type: 'link',
            priority: 1.1,
            state: 'quartz.admin-default.home'
        });
    }
})();
