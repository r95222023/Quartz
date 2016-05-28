(function () {
    'use strict';

    angular
        .module('quartz.components')
        .controller('ProfileController', ProfileController);

    /* @ngInject */
    function ProfileController($rootScope, userData, $auth, $firebase, $mdToast, qtSettings, $stateParams) {
        console.log(userData);

        var vm = this;
        vm.settingsGroups = qtSettings.custom;


        //user profile.
        vm.name = userData.name || userData.providerData[0].displayName;
        vm.photoURL = userData.photoURL || userData.providerData[0].photoURL;
        vm.userInfo = {test:'test'};


        vm.updateProfile = function () {
            var userUrl = 'users/detail/' + userData.uid;

            userData.updateProfile({displayName: vm.name, photoURL: vm.photoURL}).then(function () {
                if ($stateParams.siteName) $firebase.update(userUrl + '/sitesVisited/' + $stateParams.siteName + '/info', vm.userInfo)
                    .then(success, error);
            });
            function success() {
                // indexService.update("users", userData.uid, userData, "main"); //TODO: 檢查是否有main以外更好的index
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
