(function () {
    'use strict';

    angular
        .module('app.parts.pages')
        .controller('PageManagerController', PageManagerController)
        .controller('PageEditorController', PageEditorController)
        .controller('CustomPageController', CustomPageController);

    /* @ngInject */
    function PageManagerController($firebase, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this,
            position = {
                bottom: true,
                top: false,
                left: false,
                right: true
            },
            pagesRef = $firebase.ref('pages');

        //Todo: 改名 刪除
        vm.actions = ['delete', 'rename'];
        vm.action = function (action, id, params) {
            console.log(action, id);
            switch (action) {
                case 'delete':

                    pagesRef.child(id).remove();
                    break;
                case 'rename':
                    //pagesRef.child(id+'/name').set();
                    break;
            }
        };
        vm.paginator = $firebase.paginator('pages');
        //initiate
        vm.paginator.onReorder('name');

        vm.onPaginate = function (page, size) { //to prevent this being overwritten
            vm.paginator.get(page, size)
        };
        vm.onReorder = function (orderBy) {
            vm.paginator.onReorder(orderBy);
        }
    }

    /* @ngInject */
    function PageEditorController(customService, $stateParams, $firebase, $scope, dragulaService, $mdSidenav, $timeout) {
        var vm = this;
        $scope.containers = {};

        dragulaService.options($scope, 'drag-container-root', {
            moves: function (el, container, handle) {
                return handle.classList.contains('root-handle');
            }
        });
        dragulaService.options($scope, 'drag-container-lv1', {
            moves: function (el, container, handle) {
                return handle.classList.contains('lv1-handle');
            }
        });



        $scope.$on('drag-container-root.drop-model', function (e, el) {
            //angular.forEach($scope.containers.root, function (container, index) {
            //    if(!container.id) {
            //        var id = Math.random().toString();
            //        $scope.containers.root[index].id = id;
            //        $scope.containers[id]=[];
            //    }
            //});
            $scope.containerSource = getSource(containerSource);
        });
        $scope.$on('drag-container-lv1.drop-model', function (e, el) {
            $scope.subContainerSource = getSource(containerSource);
        });
        $scope.$on('drag-container-lv2.drop-model', function (e, el) {
            $scope.widgetSource = getSource(widgetSource);
        });

        var widgetSource = customService.items,
            containerSource = customService.containers,
            pageRootRef = $firebase.ref('pages');
        vm.pageName = $stateParams.pageName || ('New Page-' + (new Date()).getTime());
        vm.getHtmlContent = customService.getHtmlContent;
        vm.layoutOptions = customService.layoutOptions;
        function getSource(source) {
            var copy = [];
            angular.forEach(source, function (item) {
                var id=Math.random().toString();
                $scope.containers[id]=[];
                copy.push(angular.extend({id:id},item))
            });
            return copy;
        }


        $scope.widgetSource = getSource(widgetSource);
        $scope.containerSource = getSource(containerSource);
        $scope.subContainerSource = getSource(containerSource);



        if ($stateParams.pageName) {
            pageRootRef.orderByChild('name').equalTo($stateParams.pageName).once('child_added', function (snap) {
                if (snap.val()) {
                    $timeout(function () {
                        customService.convert(snap.child('content').val(),$scope['containers'],3);
                        console.log($scope.containers);
                        vm.pageRef = snap.ref();
                    }, 0);
                }
            });
        }


        vm.actions = ['edit','copy','delete'];

        vm.action = function(action, rowIndex, itemIndex){
            switch(action){
                case 'edit':
                    vm.editItem(rowIndex, itemIndex);
                    break;
                case 'copy':
                    vm.copyItem(rowIndex, itemIndex);
                    break;
                case 'delete':
                    vm.deleteItem(rowIndex, itemIndex);
                    break;
            }
        };


        vm.editItem = function (rowIndex, itemIndex) {
            vm.item={};
            vm.item = itemIndex !== undefined ? getSource($scope.subContainers[$scope.containers[rowIndex].id][itemIndex]) : getSource($scope.containers[rowIndex]);
            vm.rowIndex = rowIndex;
            vm.itemIndex = itemIndex;
            $mdSidenav('editCustomItem').open();
        };

        vm.updateItem = function () {
            if (vm.itemIndex !== undefined) {
                $scope.subContainers[$scope.containers[vm.rowIndex].id][vm.itemIndex] = vm.item
            } else {
                $scope.containers[vm.rowIndex] = vm.item;
            }
            $mdSidenav('editCustomItem').close();
            //vm.update();
        };
        vm.copyItem = function (rowIndex,itemIndex) {
            if (itemIndex !== undefined) {
                var subContainer = $scope.subContainers[$scope.containers[rowIndex].id];
                $scope.subContainers[$scope.containers[rowIndex].id].splice(itemIndex,0, subContainer[itemIndex]);
            } else {
                var copied = angular.copy($scope.containers[rowIndex]);
                copied.id =  Math.random().toString();
                $scope.subContainers[copied.id] = angular.copy($scope.subContainers[$scope.containers[rowIndex].id]);
                $scope.containers.splice(rowIndex,0, copied);
            }
        };

        vm.deleteItem = function (rowIndex,itemIndex) {
            if (itemIndex !== undefined) {
                $scope.subContainers[$scope.containers[rowIndex].id].splice(itemIndex,1);
            } else {
                $scope.containers.splice(rowIndex,1);
            }
        };

        vm.compile = function () {
            console.log(customService.convertBack($scope.containers))
            vm.html = customService.compile(customService.convertBack($scope.containers))
        };

        vm.toggleEditor = function () {
            $mdSidenav('editCustomItem').toggle();
        };

        vm.update = function () {
            var data = {
                name: vm.pageName,
                content: convertBack()
            };
            if (vm.pageRef) {
                vm.pageRef.update(data);
            } else {
                pageRootRef.push(data);
            }
        }

    }

    /* @ngInject */
    function CustomPageController($firebase, customService, $stateParams, $timeout, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        if ($stateParams.pageName) {
            $firebase.ref('pages').orderByChild('name').equalTo($stateParams.pageName).once('child_added', function (snap) {
                $timeout(function () {
                    vm.html = customService.compile(snap.val().content)

                }, 0);
            })
        }
    }
})();
