(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductManagerController', ProductManagerController);

    /* @ngInject */
    function ProductManagerController(articleProduct, lzString, $mdToast, $mdDialog, $firebase, $firebaseStorage, indexService, snippets, $stateParams, $state, $mdMedia) {
        var vm = this,
            position = {
                bottom: true,
                top: false,
                left: false,
                right: true
            };

        vm.filters = [
            ['Product Id', 'itemId'],
            ['Name', 'itemName'],
            ['Category', 'category'],
            ['Quantity', 'quantity'],
            ['Price', 'price']
        ];

        vm.paginator = $firebase.paginator('products/list@selectedSite', $stateParams);
        //initiate
        vm.paginator.onReorder($stateParams.orderBy || 'itemId');


        vm.getFiltered = function () {
            $state.go('quartz.admin-default.productManager', {
                orderBy: vm.orderBy,
                startAt: vm.startAt,
                endAt: vm.endAt,
                equalTo: vm.equalTo
            })
        };

        vm.onPaginate = function (page, size) { //to prevent this being overwritten
            vm.paginator.get(page, size)
        };
        vm.onReorder = function (sort) {
            vm.paginator.onReorder(sort);
        };

        vm.actions = [['edit', 'GENERAL.EDIT'], ['delete', 'GENERAL.DELETE']];
        vm.action = function (action, id, event) {
            switch (action) {
                // case 'view':
                //     $state.go('quartz.admin-default.productDetail', {id: id});
                //     break;
                case 'edit':
                    vm.showEditor(event, id);
                    break;
                case 'delete':
                    vm.delete(event, id);
                    break;
            }
        };
        ////categories

        var productConfigRef = $firebase.ref('products/config@selectedSite');
        vm.getCateTag = function () {
            productConfigRef.on('value', function (snap) {
                if (snap.val() === null) return;
                vm.productConfig = snap.val();
                vm.categories = snippets.getFirebaseArrayData(snap.val().categories);
                vm.tags = snippets.getFirebaseArrayData(snap.val().tags || []).toString();
            });
        };
        vm.getCateTag();
        vm.getCate = articleProduct.getCate;


        ////Products


        resetData();


        function resetData() {
            vm.product = {};
            vm.optional = {
                options: {}
            };
            vm.paginator.page = 1;
        }


        vm.hide = function () {
            $mdDialog.hide();
        };
        vm.cancel = function () {
            $mdDialog.cancel();
        };

        vm.addImage = function(){
            vm.imageUrl = vm.imageUrl||'';
            if(!vm.imageUrl.trim()) return;
            vm.product.images=vm.product.images||[];
            vm.product.images.push(vm.imageUrl);
            vm.imageUrl=''
        };
        vm.removeImage = function(index){
            vm.product.images.splice(index, 1);
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

        vm.addCustom = function () {
            if (!vm.product.custom) vm.product.custom = {};
            vm.product.custom[vm.customKey] = vm.customValue;
            vm.customKey = '';
            vm.customValue = '';
        };
        vm.removeCustom = function (optName) {
            delete vm.product.custom[optName];
            vm.customKey = '';
            vm.customValue = '';
        };

        vm.update = function () {
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

            vm.product.tags = {};
            if (angular.isString(vm.optional.tags) && vm.optional.tags.trim()) {
                var tags = vm.optional.tags.split(',');
                angular.forEach(tags, function (tag, key) {
                    vm.product.tags[tag] = 1;
                })
            }
            var id = vm.product.itemId || (new Date()).getTime();

            var listData = angular.extend({}, vm.product, {description: null, custom: null, images:null}),
                detailData = {
                    compressed: lzString.compress(vm.product),
                    editTime: firebase.database.ServerValue.TIMESTAMP
                };

            $firebase.update("products@selectedSite", ['list/' + id, 'detail/' + id], {
                '@0': listData,
                '@1': detailData
            }).then(function () {
                indexService.update("product", id, vm.product);
                vm.hide(function () {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Saved!')
                            .position(position)
                            .hideDelay(3000)
                    );
                    resetData();
                });
            });
            $firebaseStorage.clearTemp();
            $firebaseStorage.update('products/detail/' + id + '@selectedSite', vm.product);
        };

        vm.delete = function (ev, id) {
            resetData();
            var confirm = $mdDialog.confirm()
                .title('Remove products/' + id + '?')
                .textContent('Warning: The data will be deleted permanently.')
                .ariaLabel('Remove products/' + id + '?')
                .targetEvent(ev)
                .cancel('Cancel')
                .ok('Remove');

            $mdDialog.show(confirm).then(function () {
                $firebase.update("products@selectedSite", ['list/' + id, 'detail/' + id], {
                    "@all": null
                }).then(function () {
                    indexService.remove("product", id);
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
                $firebaseStorage.getWithCache('products/detail/'+id+'@selectedSite').then(function (val) {
                    vm.product = val;
                    if (angular.isString(val.group)) {
                        var groups = snap.val().group.split('->');
                        vm.optional.group = groups[0];
                        vm.optional.subgroup = groups[1];
                    } else {
                        vm.optional.group = '';
                        vm.optional.subgroup = '';
                    }

                    if (angular.isObject(val.options)) {
                        angular.forEach(val.options, function (item, name) {
                            var optArr = [];
                            for (var key in item) {
                                optArr[key] = item[key]
                            }
                            vm.optional.options[name] = optArr.toString();
                        });
                    }

                    if (angular.isObject(val.tags)) {
                        var tags = [];
                        angular.forEach(val.tags, function (item, name) {
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
