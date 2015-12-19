(function () {
    'use strict';

    angular
        .module('example.seed-module')
        .controller('SeedPageController', SeedPageController);

    /* @ngInject */
    function SeedPageController($firebase, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        $firebase.ref('test/request').on('child_added', function (snap) {
            setTimeout(function () {
                $firebase.ref('test/response/' + snap.key()).set('test succeed');
            }, 2000);
        });
        vm.comTest = function () {
            $firebase.$communicate({
                request: [{
                    refUrl: 'test/request/$rid',
                    value: {val: 'test'}
                }],
                response: {res: 'test/response/$rid'}
            }).then(function (res) {
                console.log(res);
                vm.result = res;
            });
        };
        vm.testData = ['quartz', 'is', 'great'];
        vm.productId = 'bd_001';
        vm.changeProduct = function (id) {
            vm.productId = id;
        };

        vm.addNotification = function () {
            qtNotificationsService.addNotification('test', {
                title: 'Oxygenna',
                icon: 'fa fa-twitter',
                iconColor: '#55acee',
                date: moment().startOf('hour').format('x')
            })
        }
    }
})();
