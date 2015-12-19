(function () {
    'use strict';

    angular
        .module('quartz.components')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/quartz/components/authentication');

        $stateProvider
            .state('authentication', {
                abstract: true,
                templateUrl: 'app/quartz/components/authentication/layouts/authentication.tmpl.html'
            })
            .state('authentication.login', {
                url: '/login',
                templateUrl: 'app/quartz/components/authentication/login/login.tmpl.html',
                controller: 'LoginController',
                controllerAs: 'vm'
            })
            .state('authentication.signup', {
                url: '/signup',
                templateUrl: 'app/quartz/components/authentication/signup/signup.tmpl.html',
                controller: 'SignupController',
                controllerAs: 'vm'
            })
            .state('authentication.lock', {
                url: '/lock',
                templateUrl: 'app/quartz/components/authentication/lock/lock.tmpl.html',
                controller: 'LockController',
                controllerAs: 'vm'
            })
            .state('authentication.forgot', {
                url: '/forgot',
                templateUrl: 'app/quartz/components/authentication/forgot/forgot.tmpl.html',
                controller: 'ForgotController',
                controllerAs: 'vm'
            })
            .stateAuthenticated('quartz.admin-default.profile', {
                url: '/profile',
                templateUrl: 'app/quartz/components/authentication/profile/profile.tmpl.html',
                controller: 'ProfileController',
                controllerAs: 'vm',
                resolve:{
                    userData: /*@ngInject*/ function(promiseService){
                        return promiseService.get('userData')
                    }
                }
            });

        qtMenuProvider.addMenu({
            name: 'MENU.AUTH.AUTH',
            icon: 'zmdi zmdi-account',
            type: 'dropdown',
            priority: 3.1,
            children: [{
                name: 'MENU.AUTH.LOGIN',
                state: 'authentication.login',
                type: 'link'
            }, {
                name: 'MENU.AUTH.SIGN_UP',
                state: 'authentication.signup',
                type: 'link'
            }, {
                name: 'MENU.AUTH.FORGOT',
                state: 'authentication.forgot',
                type: 'link'
            }, {
                name: 'MENU.AUTH.LOCK',
                state: 'authentication.lock',
                type: 'link'
            }, {
                name: 'MENU.AUTH.PROFILE',
                state: 'quartz.admin-default.profile',
                type: 'link'
            }]
        });
    }
})();
