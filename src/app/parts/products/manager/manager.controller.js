(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductManagerController', ProductManagerController);

    /* @ngInject */
    function ProductManagerController($firebaseObject, $mdToast, $mdDialog, syncTime, $firebase, $location, $stateParams, $mdMedia) {
        var vm = this,
            position = {
                bottom: true,
                top: false,
                left: false,
                right: true
            };
        vm.product = {};

        vm.hide = function () {
            $mdDialog.hide();
        };
        vm.cancel = function () {
            $mdDialog.cancel();
        };

        vm.update = function () {
            $firebase.ref('products').child(vm.product.id || syncTime.getTime()).update(vm.product, function () {
                vm.hide(function () {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Saved!')
                            .position(position)
                            .hideDelay(3000)
                    );
                    vm.product = {};
                });
            })
        };
        vm.delete = function (ev, id) {
            vm.product = {};

            var confirm = $mdDialog.confirm()
                .title('Remove products/' + id + '?')
                .textContent('Warning: This data will be deleted permanently.')
                .ariaLabel('Remove products/' + id + '?')
                .targetEvent(ev)
                .cancel('Cancel')
                .ok('Remove');

            $mdDialog.show(confirm).then(function () {
                $firebase.ref('products').child(id).set(null, function () {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Deleted!')
                            .position(position)
                            .hideDelay(3000)
                    );
                });
            }, function () {
                //cancel
            });

        };

        vm.showEditor = function (ev, id) {
            if (!id) vm.product = {};
            if (id) $firebase.ref('products').child(id).once('value', function (snap) {
                vm.product = snap.val();
            });
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
            $mdDialog.show({
                    controller: EditorController,
                    templateUrl: 'app/parts/products/manager/editor.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                })
                .then(function (onComplete) {
                    onComplete();
                }, function (onCancel) {
                    onCancel();
                });
        };

        /* @ngInject */
        function EditorController($scope, $mdDialog) {
            $scope.vm = vm;
        }
    }
})();
