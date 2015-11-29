(function() {
    'use strict';

    angular
        .module('example.seed-module')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/examples/seed-module');

        $stateProvider
        .state('quartz.admin-default.seed-page', {
            // set the url of this page
            url: '/seed-module/seed-page',
            // set the html template to show on this page
            templateUrl: 'app/examples/seed-module/seed-page.tmpl.html',
            // set the controller to load for this page (in seed-page.controller.js)
            controller: 'SeedPageController',
            controllerAs: 'vm'
        });

        qtMenuProvider.addMenu({
            // give the menu a name to show (should be translatable and in the il8n folder json)
            name: 'MENU.SEED.SEED-MODULE',
            // set an icon for this menu
            icon: 'fa fa-file-text',
            // set the menu type to a dropdown
            type: 'dropdown',
            // set a proirity for this menu item, menu is sorted by priority
            priority: 9.1,
            // create a sub-menu
            children: [{
                name: 'MENU.SEED.SEED-PAGE',
                // point this menu to the state we created in the $stateProvider above
                state: 'quartz.admin-default.seed-page',
                // set the menu type to a link
                type: 'link'
            }]
        });
    }
})();
