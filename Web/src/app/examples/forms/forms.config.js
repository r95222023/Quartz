(function() {
    'use strict';

    angular
        .module('app.examples.forms')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/examples/forms');

        $stateProvider
        .state('quartz.admin-default.forms-inputs', {
            url: '/forms/inputs',
            templateUrl: 'app/examples/forms/inputs.tmpl.html'
        })
        .state('quartz.admin-default.forms-binding', {
            url: '/forms/binding',
            templateUrl: 'app/examples/forms/binding.tmpl.html'
        })
        .state('quartz.admin-default.forms-autocomplete', {
            url: '/forms/autocomplete',
            templateUrl: 'app/examples/forms/autocomplete.tmpl.html'
        })
        .state('quartz.admin-default.forms-wizard', {
            url: '/forms/wizard',
            templateUrl: 'app/examples/forms/wizard.tmpl.html',
            controller: 'FormWizardController',
            controllerAs: 'wizardController',
            data: {
                layout: {
                    contentClass: 'full-image-background mb-bg-fb-02 background-overlay-static',
                    innerContentClass: 'overlay-gradient-20'
                }
            }
        })
        .state('quartz.admin-default.forms-validation', {
            url: '/forms/validation',
            templateUrl: 'app/examples/forms/validation.tmpl.html'
        });

        qtMenuProvider.addMenu({
            name: 'MENU.FORMS.FORMS',
            icon: 'zmdi zmdi-calendar-check',
            type: 'dropdown',
            priority: 2.5,
            children: [{
                name: 'MENU.FORMS.AUTOCOMPLETE',
                type: 'link',
                state: 'quartz.admin-default.forms-autocomplete'
            },{
                name: 'MENU.FORMS.BINDING',
                type: 'link',
                state: 'quartz.admin-default.forms-binding'
            },{
                name: 'MENU.FORMS.INPUTS',
                type: 'link',
                state: 'quartz.admin-default.forms-inputs'
            },{
                name: 'MENU.FORMS.WIZARD',
                type: 'link',
                state: 'quartz.admin-default.forms-wizard'
            },{
                name: 'MENU.FORMS.VALIDATION',
                type: 'link',
                state: 'quartz.admin-default.forms-validation'
            }]
        });
    }
})();
