(function () {
    'use strict';

    angular
        .module('quartz.components')
        .controller('ProfileController', ProfileController);

    /* @ngInject */
    function ProfileController($rootScope, userData, $auth, $firebase, $mdToast, qtSettings) {
        console.log(userData);

        var vm = this;
        vm.settingsGroups = qtSettings.custom;


        //user profile.
        vm.user = {};
        if (userData) {
            angular.forEach(userData.info, function (value, key) {
                vm.user[key] = value;
            });
        }


        vm.updateProfile = function () {
            var userUrl = 'users/detail/' + $rootScope.user.uid;
            $firebase.update(userUrl + '/info', vm.user)
                .then(success, error);

            function success() {
                indexService.update("users", userData.uid, userData, "main"); //TODO: 檢查是否有main以外更好的index
                $mdToast.show(
                    $mdToast.simple()
                        .content('profile updated')
                        .position('bottom right')
                        //.action('close'))
                        //.highlightAction(true)
                        .hideDelay(1000)
                ).then(angular.noop);
            }

            function error(error) {
                $mdToast.show(
                    $mdToast.simple()
                        .content($filter('translate')('FORGOT.MESSAGES.NO_RESET') + ' ' + vm.email)
                        .position('bottom right')
                        .hideDelay(5000)
                );
            }
        };

        //change password.
        vm.pass = {
            "current": '',
            "new": '',
            "confirm": ''
        };
        vm.changePassword = function () {
            var userData = $rootScope.user[$rootScope.provider];
            $auth.$changePassword({
                email: userData.email,
                oldPassword: vm.pass.current,
                newPassword: vm.pass.new
            })
        }
    }
})();
