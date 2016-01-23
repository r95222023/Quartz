(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductManagerController', ProductManagerController);

    /* @ngInject */
    function ProductManagerController($elasticSearch, $mdToast, $mdDialog, $firebase, snippets, $location, $stateParams, $mdMedia) {
        var vm = this,
            position = {
                bottom: true,
                top: false,
                left: false,
                right: true
            };

        vm.query = {
            reuse: 200
        };
        vm.filter = {};
        vm.paginator = $firebase.paginator($firebase.ref('products'));
        //initiate
        vm.paginator.onReorder('itemId');

        vm.onPaginate = function (page, size) { //to prevent this being overwritten
            vm.paginator.get(page,size)
        };

        ////categories

        var cateRef = $firebase.ref('config/client/products/categories');
        vm.getCate = function () {
            cateRef.once('value', function (snap) {
                vm.categories = snippets.getFirebaseArrayData(snap.val());
            });
        };
        vm.getCate();

        vm.addCate = function () {
            vm.categories.push(['Category Name', []])
        };

        vm.removeCate = function (ithCate, ithSub) {
            if (ithSub) {
                vm.categories[ithCate][1].splice(ithSub, 1);
            } else {
                vm.categories.splice(ithCate, 1);
            }
        };
        vm.saveCate = function () {
            cateRef.update(vm.categories, function () {
                vm.cateEdit=!vm.cateEdit;
            });
        };

        vm.addItme = function (index, value) {
            if (value) {
                var length = vm.categories[index].length;
                vm.categories[index][1].push(value);
                vm.tempItem = {};
            }
        };

        ////Products


        resetData();


        function resetData() {
            vm.product = {};
            vm.optional = {
                options: {}
            };
            vm.paginator.page=1;
        }


        vm.hide = function () {
            $mdDialog.hide();
        };
        vm.cancel = function () {
            $mdDialog.cancel();
        };

        vm.addOption = function () {
            vm.optional.options[vm.optional.optName] = vm.optional.optValue;
            vm.optional.optName = '';
            vm.optional.optValue = '';
        };
        vm.removeOption = function (optName) {
            delete vm.optional.options[optName];
            vm.optional.optName = '';
            vm.optional.optValue = '';
        };

        vm.update = function () {
            delete vm.product._index;
            if (angular.isObject(vm.optional.options)) {
                vm.product.options = {};
                angular.forEach(vm.optional.options, function (item, key) {
                    vm.product.options[key] = [];
                    //trim the input
                    angular.forEach(item.split(','), function (option, index) {
                        vm.product.options[key][index] = option.trim();
                    });
                })
            }

            if (angular.isString(vm.optional.tags)) {
                vm.product.tags = {};
                var tags = vm.optional.tags.split(',');
                angular.forEach(tags, function (tag, key) {
                    vm.product.tags[tag] = '';
                })
            }

            $firebase.ref('products').child(vm.product.itemId || (new Date()).getTime()).update(vm.product, function () {
                vm.hide(function () {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Saved!')
                            .position(position)
                            .hideDelay(3000)
                    );
                    resetData();
                });
            })
        };
        vm.delete = function (ev, id) {
            resetData();
            var confirm = $mdDialog.confirm()
                .title('Remove products/' + id + '?')
                .textContent('Warning: This data will be deleted permanently.')
                .ariaLabel('Remove products/' + id + '?')
                .targetEvent(ev)
                .cancel('Cancel')
                .ok('Remove');

            $mdDialog.show(confirm).then(function () {
                $firebase.ref('products').child(id).child('_remove').set(true, function () {
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
            resetData();
            if (id) {
                $firebase.ref('products').child(id).once('value', function (snap) {
                    vm.product = snap.val();
                    if (angular.isString(snap.val().group)) {
                        var groups = snap.val().group.split('->');
                        vm.optional.group = groups[0];
                        vm.optional.subgroup = groups[1];
                    } else {
                        vm.optional.group = '';
                        vm.optional.subgroup = '';
                    }
                    if (angular.isObject(snap.val().options)) {
                        angular.forEach(snap.val().options, function (item, name) {
                            var optArr = [];
                            for (var key in item) {
                                optArr[key] = item[key]
                            }
                            vm.optional.options[name] = optArr.toString();
                        });
                    }
                    if (angular.isObject(snap.val().tags)) {
                        var tags = [];
                        angular.forEach(snap.val().tags, function (item, name) {
                            tags.push(name);
                        });
                        vm.optional.tags = tags.toString();
                    }
                });
            }
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
                    if (angular.isFunction(onComplete)) onComplete();
                }, function (onCancel) {
                    if (angular.isFunction(onCancel)) onCancel();
                });
        };

        /* @ngInject */
        function EditorController($scope, $mdDialog) {
            $scope.vm = vm;
        }
    }
})();
