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
        dragulaService.options($scope, 'drag-container', {
            moves: function (el, container, handle) {
                return !handle.classList.contains('dragable-widget');
            }
        });

        var source = customService.items,
            containerSource = customService.containers,
            pageRootRef = $firebase.ref('pages');
        vm.pageName = $stateParams.pageName || ('New Page-' + (new Date()).getTime());
        vm.getHtmlContent = customService.getHtmlContent;
        vm.layoutOptions = customService.layoutOptions;
        function getSource(source) {
            return angular.copy(source);
        }


        $scope.source = getSource(source);
        $scope.containerSource = getSource(containerSource);



        $scope.containers = [];
        $scope.subContainers = {};
        function convert(val) {
            angular.forEach(val, function (item) {
                var _item = {};
                _item.id = Math.random().toString();
                _item.options = item.options;
                _item.layout = item.layout;
                _item.type = item.type;
                _item.content = item.content;
                $scope.subContainers[_item.id] = item.widgets || [];
                $scope.containers.push(_item);
            });
        }
        if ($stateParams.pageName) {
            pageRootRef.orderByChild('name').equalTo($stateParams.pageName).once('child_added', function (snap) {
                if (snap.val()) {
                    $timeout(function () {
                        convert(snap.child('content').val());
                        vm.pageRef = snap.ref();
                    }, 0);
                }
            });
        }

        function convertBack(){
            var result=[];
            angular.forEach($scope.containers, function (item) {
                var _item = {};
                _item.options = item.options||null;
                _item.type = item.type;
                _item.layout = item.layout||null;
                _item.content = item.content||null;
                _item.widgets = $scope.subContainers[item.id];
                result.push(_item);
            });
            return result;
        }

        $scope.$on('drag-row-container.drop-model', function (e, el) {
            $scope.source = getSource(source);
        });

        $scope.$on('drag-container.drop-model', function (e, el) {
            angular.forEach($scope.containers, function (container, index) {
                if(!container.id) {
                    var id = Math.random().toString();
                    $scope.containers[index].id = id;
                    $scope.subContainers[id]=[];
                }
            });
            $scope.containerSource = getSource(containerSource);
        });

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
            vm.html = customService.compile(convertBack())
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
