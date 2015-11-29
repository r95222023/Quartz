(function () {
    'use strict';

    angular
        .module('quartz.components')
        .controller('SignupController', SignupController);

    /* @ngInject */
    function SignupController($state, $mdToast, $filter, qtSettings, Auth) {
        var vm = this;
        vm.qtSettings = qtSettings;

        ////////////////

        vm.createAccount = function () {
            vm.err = null;
            if (assertValidAccountProps()) {
                var email = vm.email;
                var pass = vm.pass;
                // create user credentials in Firebase auth system
                Auth.$createUser({email: email, password: pass})
                    .then(function () {
                        // authenticate so we have permission to write to Firebase
                        return Auth.$authWithPassword({email: email, password: pass});
                    })
                    .then(Auth.createAccount)
                    .then(signupSuccess, signupError);
            }
        };

        function showError(err) {
            vm.err = angular.isObject(err) && err.code ? err.code : err + '';
        }

        function assertValidAccountProps() {
            if (!vm.email) {
                vm.err = 'Please enter an email address';
            }
            else if (!vm.pass || !vm.confirm) {
                vm.err = 'Please enter a password';
            }
            else if (vm.createMode && vm.pass !== vm.confirm) {
                vm.err = 'Passwords do not match';
            }
            return !vm.err;
        }

        function signupSuccess(authData) {
            $mdToast.show(
                $mdToast.simple()
                    .content($filter('translate')('SIGNUP.MESSAGES.CONFIRM_SENT') + ' ' + authData.uid)
                    .position('bottom right')
                    .action($filter('translate')('SIGNUP.MESSAGES.LOGIN_NOW'))
                    .highlightAction(true)
                    .hideDelay(0)
            ).then(function () {
                    $state.go(config.home);
                });
        }

        function signupError(err) {
            showError(err);
            $mdToast.show(
                $mdToast.simple()
                    .content($filter('translate')('SIGNUP.MESSAGES.NO_SIGNUP'))
                    .position('bottom right')
                    .hideDelay(5000)
            )
        }
    }
})();
