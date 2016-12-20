(function () {
    'use strict';

    angular
        .module('app.parts.design')
        .controller('PageManagerController', PageManagerController)
        .controller('WidgetManagerController', WidgetManagerController)
        .controller('PageEditorController', PageEditorController)
        .controller('WidgetEditorController', WidgetEditorController);


    /* @ngInject */
    function PageManagerController($firebase, $firebaseStorage, config, $state, $window, $mdDialog, $timeout) {
        var vm = this;

        //Todo: 改名 刪除
        vm.actions = [['view', 'GENERAL.VIEW'], ['edit', 'GENERAL.EDIT'], ['setPrivate', 'GENERAL.SETPRIVATE'], ['setPublic', 'GENERAL.SETPUBLIC'], ['delete', 'GENERAL.DELETE']];
        vm.action = function (action, id, name) {
            switch (action) {
                case 'view':
                    $window.location.href = config.playerUrl + '/#!/' + _core.util.siteName + '/' + name + '/';
                    // $state.go('customPage', {id: id, pageName: name});
                    break;
                case 'edit':
                    $state.go('pageEditor', {id: id, pageName: name});
                    break;
                case 'setPrivate':
                    $firebase.update(['page-property?type=list', 'page-property?type=detail'], {
                        "@all": true
                    }, {property: 'private', id: id});
                    break;
                case 'setPublic':
                    $firebase.update(['page-property?type=list', 'page-property?type=detail'], {
                        "@all": null
                    }, {property: 'private', id: id});
                    break;
                case 'delete':
                    var confirm = $mdDialog.confirm()
                        .title('Delete this page?')
                        .ariaLabel('Would you like to delete this page?')
                        .ok('Confirm')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function () {
                        $firebase.update(['page?type=list', 'page?type=detail'], {
                            "@all": null
                        }, {id: id});
                        $firebaseStorage.remove('page?type=detail&id=' + name);
                    });

                    break;
            }
        };
        vm.paginator = $firebase.pagination('pages?type=list', {}, function () {
            $timeout(function () {
            }, 0)
        });
        //initiate
        vm.paginator.size = 25;
        vm.paginator.onReorder('name');

        vm.onPaginate = function (page, size) { //to prevent this being overwritten
            vm.paginator.get(page, size)
        };
        vm.onReorder = function (orderBy) {
            vm.paginator.onReorder(orderBy);
        }
    }

    /* @ngInject */
    function WidgetManagerController($firebase, $state, $mdDialog) {
        var vm = this;

        vm.actions = [['edit', 'GENERAL.EDIT'], ['delete', 'GENERAL.DELETE']];
        vm.action = function (action, id, name) {
            switch (action) {
                case 'edit':
                    $state.go('widgetEditor', {id: id, widgetName: name});
                    break;
                case 'delete':
                    var confirm = $mdDialog.confirm()
                        .title('Delete this widget?')
                        .ariaLabel('Would you like to delete this widget?')
                        .ok('Confirm')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function () {
                        $firebase.update(['widget?type=list', 'widget?type=detail'], {
                            "@all": null
                        }, {id: id});
                    });

                    break;
            }
        };
        vm.paginator = $firebase.pagination('widgets?type=list');
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
    function PageEditorController(pageData, $mdDialog, customService, $stateParams, $scope, $timeout, siteDesign) {
        var vm = this, frameData = angular.copy(pageData) || {};
        vm.mode='page';
        siteDesign.previewCtr(vm, $scope, frameData);
        siteDesign.editorLayoutCtr(vm);

        vm.pageName = $stateParams.pageName || ('New Page-' + (new Date()).getTime());

        vm.previewPanel = false;

        vm.selectedSettingsTab = 1;
        vm.sources = pageData && pageData.sources || [];
        vm.showSettinsTab = function (ev) {
            $mdDialog.show({
                controller: SettingsCtrl,
                templateUrl: 'app/parts/design/setting/editor-settings-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        /* @ngInject */
        function SettingsCtrl($scope, $mdDialog) {
            $scope.vm = vm;
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.addSource = function (input) {
                vm.sources.push({src: (input || '').replace(/\s+/g, '')});
            };
            $scope.removeSource = function (index) {
                vm.sources.splice(index, 1);
            };
        }

        vm.showSaveAsDialog = function (ev) {
            $mdDialog.show({
                controller: SaveAsCtrl,
                templateUrl: 'app/parts/design/setting/editor-saveas-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };
        /* @ngInject */
        function SaveAsCtrl($scope, $mdDialog) {
            $scope.vm = vm;
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.addSource = function (input) {
                vm.sources.push({src: (input || '').replace(/\s+/g, '')});
            };
            $scope.removeSource = function (index) {
                vm.sources.splice(index, 1);
            };
        }

        var widgetSource = [
                // {type: 'custom', content: '<!--include-->'},
                {type: 'tag', content: ''},
                {type: 'text', content: ''},
                {type: 'widget'}
            ],
            containerSource = [
                {type: 'tag', content: '<!--include-->'},
                {type: 'text'},
                {type: 'widget'}
            ];

        var dragula = siteDesign.initDragula(vm, $scope, containerSource, containerSource, widgetSource);
        siteDesign.ctr(vm, $scope, dragula, 'page', pageData);
        vm.setPreviewScale(0.5);
    }

    /* @ngInject */
    function WidgetEditorController(widgetData, customService, $stateParams, $scope, $timeout, siteDesign) {
        var vm = this, frameData = angular.copy(widgetData) || {};
        vm.mode='widget';

        vm.widgetName = $stateParams.widgetName || ('New Widget-' + (new Date()).getTime());
        var elementSource = [
                // {type: 'custom', content: '<!--include-->'},
                {type: 'tag', content: ''},
                {type: 'text', content: ''}
            ],
            containerSource = [
                {type: 'tag', content: '<!--include-->'},
                {type: 'text'}
            ];

        vm.previewPanel = true;

        var dragula = siteDesign.initDragula(vm, $scope, containerSource, containerSource, elementSource);
        siteDesign.previewCtr(vm, $scope, frameData);
        siteDesign.editorLayoutCtr(vm);
        siteDesign.ctr(vm, $scope, dragula, 'widget', widgetData);
    }
})();
