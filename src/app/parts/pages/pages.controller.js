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
            pagesRef= $firebase.ref('pages');

        //Todo: 改名 刪除
        vm.actions = ['delete', 'rename'];
        vm.action = function (action, id, params) {
            console.log(action, id)
            switch(action) {
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
            vm.paginator.get(page,size)
        };
        vm.onReorder = function(orderBy){
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
        vm.pageName=$stateParams.pageName||('New Page-'+(new Date()).getTime());
        vm.getHtmlContent = customService.getHtmlContent;
        function getSource(source) {
            return angular.copy(source);
        }



        $scope.source = getSource(source);
        $scope.containerSource = getSource(containerSource);
        $scope.targets = [
            {
                type: 'row',
                widgets: []
            }
        ];
        if($stateParams.pageName){
            pageRootRef.orderByChild('name').equalTo($stateParams.pageName).once('child_added', function (snap) {
                if(snap.val()) {
                    $timeout(function () {
                        $scope.targets = snap.val().content;
                        vm.pageRef = snap.ref();
                    },0);
                }
            });
        }


        $scope.$on('drag-row-container.drop-model', function (e, el) {
            $scope.source = getSource(source);
        });

        $scope.$on('drag-container.drop-model', function (e, el) {
            $scope.containerSource = getSource(containerSource);
        });


        vm.editItem = function (rowIndex, itemIndex) {
            vm.item = itemIndex !== undefined ? $scope.targets[rowIndex].widgets[itemIndex] : $scope.targets[rowIndex];
            $mdSidenav('editCustomItem').open();
        };

        vm.updateItem = function (rowIndex, itemIndex) {
            if(itemIndex !== undefined) {
                $scope.targets[rowIndex].widgets[itemIndex] = vm.item
            } else {
                $scope.targets[rowIndex] = vm.item;
            }
            $mdSidenav('editCustomItem').close();
            vm.update();
        };

        vm.compile = function (targets) {
            vm.html = customService.compile(targets)
        };

        vm.toggleEditor = function () {
            $mdSidenav('editCustomItem').toggle();
        };

        vm.update = function () {
            var data = {
                name:vm.pageName,
                content:$scope.targets
            };
            if(vm.pageRef){
                vm.pageRef.update(data);
            } else {
                pageRootRef.push(data);
            }
        }

    }

    /* @ngInject */
    function CustomPageController($firebase, customService, $stateParams,$timeout, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        if($stateParams.pageName){
            $firebase.ref('pages').orderByChild('name').equalTo($stateParams.pageName).once('child_added', function (snap) {
                $timeout(function () {
                    vm.html = customService.compile(snap.val().content)

                },0);
            })
        }
    }
})();
