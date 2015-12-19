(function () {
    'use strict';

    angular
        .module('quartz.components')
        .controller('ProfileController', ProfileController);

    /* @ngInject */
    function ProfileController($rootScope, userData, Auth, $firebase, $mdToast) {
        console.log(userData);

        var vm = this;
        vm.settingsGroups = [{
            name: 'ADMIN.NOTIFICATIONS.ACCOUNT_SETTINGS',
            settings: [{
                title: 'ADMIN.NOTIFICATIONS.SHOW_LOCATION',
                icon: 'zmdi zmdi-pin',
                enabled: true
            }, {
                title: 'ADMIN.NOTIFICATIONS.SHOW_AVATAR',
                icon: 'zmdi zmdi-face',
                enabled: false
            }, {
                title: 'ADMIN.NOTIFICATIONS.SEND_NOTIFICATIONS',
                icon: 'zmdi zmdi-notifications-active',
                enabled: true
            }]
        }, {
            name: 'ADMIN.NOTIFICATIONS.CHAT_SETTINGS',
            settings: [{
                title: 'ADMIN.NOTIFICATIONS.SHOW_USERNAME',
                icon: 'zmdi zmdi-account',
                enabled: true
            }, {
                title: 'ADMIN.NOTIFICATIONS.SHOW_PROFILE',
                icon: 'zmdi zmdi-account-box',
                enabled: false
            }, {
                title: 'ADMIN.NOTIFICATIONS.ALLOW_BACKUPS',
                icon: 'zmdi zmdi-cloud-upload',
                enabled: true
            }]
        }];

        //user profile.
        vm.user = {};
        if ($rootScope.user) {
            angular.forEach($rootScope.user.info, function (value, key) {
                vm.user[key] = value;
            });
        }


        //vm.user = {
        //    location: 'Sitia, Crete, Greece',
        //    website: 'http://www.oxygenna.com',
        //    twitter: 'oxygenna',
        //    bio: 'We are a small creative web design agency \n who are passionate with our pixels.',
        //    current: '',
        //    password: '',
        //    confirm: ''
        //};
        vm.updateProfile = function () {
            var userUrl = 'users/' + $rootScope.user.uid;
            $firebase.update(userUrl + '/info', vm.user)
                .then(success, error);

            function success() {
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
            Auth.$changePassword({
                email: userData.email,
                oldPassword: vm.pass.current,
                newPassword: vm.pass.new
            })
        }
    }
})();
