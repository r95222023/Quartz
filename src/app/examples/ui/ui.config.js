(function() {
    'use strict';

    angular
        .module('app.examples.ui')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/examples/ui');

        $stateProvider
        .state('quartz.admin-default.ui-typography', {
            url: '/ui/typography',
            controller: 'TypographyController',
            controllerAs: 'vm',
            templateUrl: 'app/examples/ui/typography.tmpl.html'
        })
        .state('quartz.admin-default.ui-colors', {
            url: '/ui/colors',
            controller: 'ColorsController',
            controllerAs: 'vm',
            templateUrl: 'app/examples/ui/colors.tmpl.html'
        })
        .state('quartz.admin-default.ui-material-icons', {
            url: '/ui/material-icons',
            controller: 'MaterialIconsController',
            controllerAs: 'vm',
            templateUrl: 'app/examples/ui/material-icons.tmpl.html',
            resolve: {
                icons: function($http, API_CONFIG) {
                    return $http({
                        method: 'GET',
                        url: API_CONFIG.url + 'elements/icons'
                    });
                }
            }
        })
        .state('quartz.admin-default.ui-weather-icons', {
            url: '/ui/weather-icons',
            controller: 'WeatherIconsController',
            controllerAs: 'vm',
            templateUrl: 'app/examples/ui/weather-icons.tmpl.html'
        })
        .state('quartz.admin-default.ui-fa-icons', {
            url: '/ui/fa-icons',
            controller: 'FaIconsController',
            controllerAs: 'vm',
            templateUrl: 'app/examples/ui/fa-icons.tmpl.html',
            resolve: {
                icons: function($http, API_CONFIG) {
                    return $http({
                        method: 'GET',
                        url: API_CONFIG.url + 'elements/icons-fa'
                    });
                }
            }
        })

        .state('quartz.admin-default.ui-toolbar', {
            url: '/ui/toolbars/:extraClass/:background/:shrink',
            controller: 'ToolbarsUIController',
            controllerAs: 'vm',
            templateUrl: 'app/examples/ui/toolbars.tmpl.html'
        })

        .state('quartz.admin-default.ui-skins', {
            url: '/ui/skins',
            controller: 'SkinsUIController',
            controllerAs: 'vm',
            templateUrl: 'app/examples/ui/skins.tmpl.html'
        });

        qtMenuProvider.addMenu({
            name: 'MENU.UI.UI',
            icon: 'zmdi zmdi-ruler',
            type: 'dropdown',
            priority: 2.4,
            children: [{
                name: 'MENU.UI.COLORS',
                state: 'quartz.admin-default.ui-colors',
                type: 'link'
            },{
                name: 'MENU.UI.FONT_AWESOME',
                state: 'quartz.admin-default.ui-fa-icons',
                type: 'link'
            },{
                name: 'MENU.UI.MATERIAL_ICONS',
                state: 'quartz.admin-default.ui-material-icons',
                type: 'link'
            },{
                name: 'MENU.UI.SKINS',
                state: 'quartz.admin-default.ui-skins',
                type: 'link'
            },{
                name: 'MENU.UI.TYPOGRAPHY',
                state: 'quartz.admin-default.ui-typography',
                type: 'link'
            },{
                name: 'MENU.UI.WEATHER_ICONS',
                state: 'quartz.admin-default.ui-weather-icons',
                type: 'link'
            }]
        });
    }
})();
