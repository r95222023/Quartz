(function () {
    'use strict';

    angular
        .module('app.parts.pages')
        .controller('PageManagerController', PageManagerController)
        .controller('WidgetManagerController', WidgetManagerController)
        .controller('PageEditorController', PageEditorController)
        .controller('WidgetEditorController', WidgetEditorController)
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
        vm.actions = [['view','GENERAL.VIEW'],['edit','GENERAL.EDIT'],['delete','GENERAL.DELETE']];
        vm.action = function (action, id, name) {
            switch (action) {
                case 'view':
                    $state.go('quartz.admin-default.customPage',{pageName:name});
                    break;
                case 'edit':
                    $state.go('quartz.admin-default.pageEditor',{pageName:name});
                    break;
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
    function WidgetManagerController($firebase, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this,
            position = {
                bottom: true,
                top: false,
                left: false,
                right: true
            },
            widgetsRef = $firebase.ref('widgets');

        //Todo: 改名 刪除
        vm.actions = [['edit','GENERAL.EDIT'],['delete','GENERAL.DELETE']];
        vm.action = function (action, id, name) {
            console.log(action, id, name);
            switch (action) {
                case 'edit':
                    $state.go('quartz.admin-default.widgetEditor',{widgetName:name});
                    break;
                case 'delete':
                    widgetsRef.child(id).remove();
                    break;
                case 'rename':
                    //pagesRef.child(id+'/name').set();
                    break;
            }
        };
        vm.paginator = $firebase.paginator('widgets');
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
    function PageEditorController(customService, customWidgets,$state, $stateParams, $firebase, $scope, dragulaService, $mdSidenav, $timeout) {
        var vm = this;
        vm.pageName = $stateParams.pageName || ('New Page-' + (new Date()).getTime());
        vm.toWidgetEditor=function(widget){
            if(widget.type==='customWidget') $state.go('quartz.admin-default.widgetEditor',{widgetName:widget.name})
        }

        var widgetSource = angular.extend({},customWidgets, customService.items),
            containerSource = customService.containers,
            pageRootRef = $firebase.ref('pages');
        vm.getHtmlContent = customService.getHtmlContent;
        vm.layoutOptions = customService.layoutOptions;

        var dragula = new Dragula(containerSource, containerSource, widgetSource, {
            scope: $scope,
            dragulaService: dragulaService,
            $timeout: $timeout
        });
        $scope.initDragula = dragula.init.bind(dragula);

        if ($stateParams.pageName) {
            pageRootRef.orderByChild('name').equalTo($stateParams.pageName).once('child_added', function (snap) {
                if (snap.val()) {
                    $timeout(function () {
                        customService.convert(snap.child('content').val(), $scope['containers'], 3);
                        vm.pageRef = snap.ref();
                    }, 0);
                }
            });
        }

        vm.actions =[['edit','GENERAL.EDIT'],['copy','GENERAL.COPY'],['delete','GENERAL.DELETE']];
        vm.action = function (action, id, index) {
            switch (action) {
                case 'edit':
                    vm.editItem(id, index);
                    break;
                case 'copy':
                    vm.copyItem(id, index);
                    break;
                case 'delete':
                    vm.deleteItem(id, index);
                    break;
            }
        };

        vm.editItem = function (id, index) {
            vm.item = {};
            vm.item = angular.copy($scope.containers[id][index]);
            vm.selectedContainerId = id;
            vm.selectedItemIndex = index;
            if(vm.item.type==='customWidget'){vm.toWidgetEditor(vm.item); return}
            $mdSidenav('editCustomItem').open();
        };

        vm.updateItem = function () {
            $scope.containers[vm.selectedContainerId][vm.selectedItemIndex] = vm.item;
            $mdSidenav('editCustomItem').close();
        };
        vm.copyItem = function (id, index) {
            var copied = angular.copy($scope.containers[id][index]);
            copied.id = Math.random().toString();
            $scope.containers[id].splice(index, 0, copied);
        };

        vm.deleteItem = function (id, index) {
            $scope.containers[id].splice(index, 1);
        };

        vm.compile = function () {
            console.log(customService.convertBack($scope.containers));
            vm.html = customService.compile(customService.convertBack($scope.containers))
        };

        vm.toggleEditor = function () {
            $mdSidenav('editCustomItem').toggle();
        };

        vm.update = function () {
            var data = {
                name: vm.pageName,
                content: customService.convertBack($scope.containers),
                editTime: Firebase.ServerValue.TIMESTAMP
            };
            if (vm.pageRef) {
                vm.pageRef.update(data);
            } else {
                pageRootRef.push(data);
            }
        }
        vm.revert = function(){
            $state.go($state.current, {pageName:vm.pageName}, {reload: true});
        }
    }

    /* @ngInject */
    function WidgetEditorController(customService, $state, $stateParams, $firebase, $scope, dragulaService, $mdSidenav, $timeout) {
        var vm = this;
        vm.widgetName = $stateParams.widgetName || ('New Widget-' + (new Date()).getTime());
        var elementSource = customService.items,
            containerSource = customService.containers,
            widgetRootRef = $firebase.ref('widgets');
        vm.getHtmlContent = customService.getHtmlContent;
        vm.layoutOptions = customService.layoutOptions;


        var dragula = new Dragula(containerSource, containerSource, elementSource, {
            scope: $scope,
            dragulaService: dragulaService,
            $timeout: $timeout
        }, {
            maxRoot: 1,
            onDrop: function () {
                vm.compile();
            }
        });
        $scope.initDragula = dragula.init.bind(dragula);

        if ($stateParams.widgetName) {
            widgetRootRef.orderByChild('name').equalTo($stateParams.widgetName).once('child_added', function (snap) {
                if (snap.val()) {
                    $timeout(function () {
                        customService.convert(snap.child('content').val(), $scope['containers'], 3);
                        vm.widgetRef = snap.ref();
                        vm.compile();
                    }, 0);
                }
            });
        }


        vm.actions = [['edit','GENERAL.EDIT'],['copy','GENERAL.COPY'],['delete','GENERAL.DELETE']];;

        vm.action = function (action, id, index) {
            switch (action) {
                case 'edit':
                    vm.editItem(id, index);
                    break;
                case 'copy':
                    vm.copyItem(id, index);
                    vm.compile();
                    break;
                case 'delete':
                    vm.deleteItem(id, index);
                    vm.compile();
                    break;
            }
        };


        vm.editItem = function (id, index) {
            vm.item = {};
            vm.item = angular.copy($scope.containers[id][index]);
            vm.selectedContainerId = id;
            vm.selectedItemIndex = index;
            $mdSidenav('editCustomItem').open();
        };

        vm.updateItem = function () {
            $scope.containers[vm.selectedContainerId][vm.selectedItemIndex] = vm.item;
            vm.compile();
            $mdSidenav('editCustomItem').close();
        };
        vm.copyItem = function (id, index) {
            var copied = angular.copy($scope.containers[id][index]);
            copied.id = Math.random().toString();
            console.log(copied)
            $scope.containers[id].splice(index, 0, copied);
        };

        vm.deleteItem = function (id, index) {
            $scope.containers[id].splice(index, 1);
        };

        vm.compile = function () {
            vm.html = customService.compile(customService.convertBack($scope.containers))
        };

        vm.toggleEditor = function () {
            $mdSidenav('editCustomItem').toggle();
        };

        vm.update = function () {
            var data = {
                name: vm.widgetName,
                type: 'customWidget',
                content: customService.convertBack($scope.containers),
                editTime: Firebase.ServerValue.TIMESTAMP
            };
            if (vm.widgetRef) {
                vm.widgetRef.update(data);
            } else {
                widgetRootRef.push(data);
            }
        }
        vm.revert = function(){
            $state.go($state.current, {widgetName:vm.widgetName}, {reload: true});
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

    function Dragula(containerSource, subContainerSource, subSubContainerSource, services, options) {
        this.options = options || {};
        this.scope = services.scope;
        this.$timeout = services.$timeout;
        this.dragulaService = services.dragulaService;
        this.containerSource = containerSource;
        this.subContainerSource = subContainerSource;
        this.subSubContainerSource = subSubContainerSource;

        this.scope.containers = {root: []};
        this.scope.containerSource = this.getSource(containerSource);
        this.scope.subContainerSource = this.getSource(subContainerSource);
        this.scope.subSubContainerSource = this.getSource(subSubContainerSource);
    }

    Dragula.prototype = {
        init: function () {
            var self = this;

            function onDrop() {
                if (angular.isFunction(self.options.onDrop)) {
                    self.options.onDrop()
                }
            }

            self.dragulaService.options(self.scope, 'drag-container-root', {
                moves: function (el, container, handle) {
                    return handle.classList.contains('root-handle');
                }
            });
            self.dragulaService.options(self.scope, 'drag-container-lv1', {
                moves: function (el, container, handle) {
                    return handle.classList.contains('lv1-handle');
                }
            });
            self.dragulaService.options(self.scope, 'drag-container-lv2', {
                moves: function (el, container, handle) {
                    return handle.classList.contains('lv2-handle');
                }
            });
            self.dragRootOff = self.scope.$on('drag-container-root.drop-model', function (el, target, source) {
                if (self.options.maxRoot && self.scope.containers['root'].length > self.options.maxRoot) self.scope.containers.root.pop();
                self.scope.containerSource = self.getSource(self.containerSource);
                onDrop();
            });
            self.dragLv1Off = self.scope.$on('drag-container-lv1.drop-model', function (el, source, target) {
                if (source.parent().context.className.indexOf('subContainerSource') !== -1 || (target.context.firstElementChild && target.context.firstElementChild.className.indexOf('subContainerSource') !== -1)) {
                    //only happen when user drag a subcontainer from source to the container
                    self.scope.subContainerSource = self.getSource(self.subContainerSource);
                } else if (source.parent()[0] && source.parent()[0]['$$hashKey'] === target[0]['$$hashKey']) {
                    //this happens only when two subcontainers are swapped in the same container
                } else {
                    //this happens only when one subcontainer is moved from one container to another
                    self.resetDragula();
                }
                onDrop();
            });
            self.dragLv2Off = self.scope.$on('drag-container-lv2.drop-model', function (el, target, source) {
                self.scope.subSubContainerSource = self.getSource(self.subSubContainerSource);
                onDrop();
            });
        },
        resetDragula: function () {
            var self = this;
            self.dragulaService.destroy(self.scope, 'drag-container-root');
            self.dragulaService.destroy(self.scope, 'drag-container-lv1');
            self.dragulaService.destroy(self.scope, 'drag-container-lv2');
            self.dragRootOff();
            self.dragLv1Off();
            self.dragLv2Off();
            self.scope.destroyDragula = true;
            self.$timeout(function () {
                self.scope.destroyDragula = false;
            }, 0);
        },
        getSource: function (source) {
            var copy = [],
                self = this;

            angular.forEach(source, function (item) {
                var id = Math.random().toString();
                self.scope.containers[id] = [];
                copy.push(angular.extend({}, item, {id: id}))
            });
            return copy;
        }
    };
})();
