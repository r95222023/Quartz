(function () {
    'use strict';

    angular
        .module('quartz.components')
        .controller('LoginController', LoginController);

    /* @ngInject */
    function LoginController($state, $mdMedia, qtSettings, Auth, config) {
        var vm = this;

        vm.email = null;
        vm.pass = null;
        vm.confirm = null;
        vm.createMode = false;

        vm.loginOption = {};
        vm.login = login;
        vm.loginWithProvider = loginWithProvider;
        vm.socialLogins = [{
            provider: 'twitter',
            icon: 'fa fa-twitter',
            color: '#5bc0de',
            url: '#'
        }, {
            provider: 'facebook',
            icon: 'fa fa-facebook',
            color: '#337ab7',
            url: '#'
        }, {
            provider: 'google',
            icon: 'fa fa-google-plus',
            color: '#e05d6f',
            url: '#'
        }, {
            provider: 'github',
            icon: 'fa fa-github-alt',
            color: '#CACACA',
            url: '#'
        }];
        vm.qtSettings = qtSettings;
        // create blank user variable for login form
        vm.user = {
            email: '',
            password: ''
        };

        ////////////////

        function redirectTo(state) {
            $state.go(state);
        }

        function showError(err) {
            vm.err = angular.isObject(err) && err.code ? err.code : err + '';
        }

        function login(email, pass, opt) {
            vm.err = null;
            Auth.$authWithPassword({email: email, password: pass}, opt)
                .then(function (/* user */) {
                    redirectTo(config.home);
                }, showError);
        }

        function loginWithProvider(provider) {
            if ($mdMedia('sm')) {
                var homeUrl = window.location.href.split('#')[0] + '#' + config.defaultUrl;
                vm.loginOption.popup = false;
                vm.loginOption.remember = 'default';
                window.location.href = homeUrl;
                Auth.loginWithProvider(provider, vm.loginOption);
            } else {
                Auth.loginWithProvider(provider, vm.loginOption)
                    .then(function (user) {
                        redirectTo(config.home);
                        return Auth.checkIfAccountExistOnFb(user)
                    }, showError)
                    .then(Auth.createAccount, showError)
                    .then(function () {
                    }, showError)
            }
        }
    }
})();
