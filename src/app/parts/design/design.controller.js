(function () {
    'use strict';

    angular
        .module('app.parts.design')
        .controller('PageManagerController', PageManagerController)
        .controller('WidgetManagerController', WidgetManagerController)
        .controller('PageEditorController', PageEditorController)
        .controller('WidgetEditorController', WidgetEditorController)
        .controller('BasicApiController', BasicApiController)
        .controller('CustomPageController', CustomPageController)
        .controller('PreviewFrameController',PreviewFrameController);

    var pageRefUrl = 'pages@selectedSite',
        pageListRefUrl = 'pages/list@selectedSite',
        widgetRefUrl = 'widgets@selectedSite',
        widgetListRefUrl = 'widgets/list@selectedSite';

    /* @ngInject */
    function PageManagerController($firebase, $firebaseStorage, qtNotificationsService, $state, $stateParams, $mdDialog, config) {
        var vm = this;

        //Todo: 改名 刪除
        vm.actions = [['view', 'GENERAL.VIEW'], ['edit', 'GENERAL.EDIT'], ['setPrivate', 'GENERAL.SETPRIVATE'], ['setPublic', 'GENERAL.SETPUBLIC'], ['delete', 'GENERAL.DELETE']];
        vm.action = function (action, id, name) {
            switch (action) {
                case 'view':
                    $state.go('customPage', {id: id, pageName: name});
                    break;
                case 'edit':
                    $state.go('quartz.admin-default-no-scroll.pageEditor', {id: id, pageName: name});
                    break;
                case 'setPrivate':
                    $firebase.update(pageRefUrl, ['list/' + id + '/private', 'detail/' + id + '/private'], {
                        "@all": true
                    });
                    break;
                case 'setPublic':
                    $firebase.update(pageRefUrl, ['list/' + id + '/private', 'detail/' + id + '/private'], {
                        "@all": null
                    });
                    break;
                case 'delete':
                    var confirm = $mdDialog.confirm()
                        .title('Delete this page?')
                        .ariaLabel('Would you like to delete this page?')
                        .ok('Confirm')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function () {
                        $firebase.update(pageRefUrl, ['list/' + id, 'detail/' + id], {
                            "@all": null
                        });
                        $firebaseStorage.remove('pages/detail/' + name + '@selectedSite');
                    });

                    break;
            }
        };
        vm.paginator = $firebase.paginator(pageListRefUrl);
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
    function WidgetManagerController($firebase, qtNotificationsService, $state, $stateParams, $mdDialog, config) {
        var vm = this;

        vm.actions = [['edit', 'GENERAL.EDIT'], ['delete', 'GENERAL.DELETE']];
        vm.action = function (action, id, name) {
            console.log(action, id, name);
            switch (action) {
                case 'edit':
                    $state.go('quartz.admin-default-no-scroll.widgetEditor', {id: id, widgetName: name});
                    break;
                case 'delete':
                    var confirm = $mdDialog.confirm()
                        .title('Delete this widget?')
                        .ariaLabel('Would you like to delete this widget?')
                        .ok('Confirm')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function () {
                        $firebase.update(widgetRefUrl, ['list/' + id, 'detail/' + id], {
                            "@all": null
                        });
                    });

                    break;
            }
        };
        vm.paginator = $firebase.paginator(widgetListRefUrl);
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
    function PageEditorController(pageData, $mdDialog,customService, customWidgets, $stateParams, $scope, dragulaService, $timeout, siteDesign) {
        var vm = this;
        window.initPreviewFrame=function(){
            var frame = window.frames['preview-frame'];
            frame.previewRefresh(pageData);
        };

        vm.pageName = $stateParams.pageName || ('New Page-' + (new Date()).getTime());

        vm.previewPanel = false;


        vm.selectedSettingsTab=1;
        vm.sources=pageData.sources||[];
        vm.showSettinsTab = function(ev) {
            $mdDialog.show({
                controller: SettingsCtrl,
                templateUrl: 'app/parts/design/editor-settings-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true
            });
                // .then(function(answer) {
                //     $scope.status = 'You said the information was "' + answer + '".';
                // }, function() {
                //     $scope.status = 'You cancelled the dialog.';
                // });
        };

        /* @ngInject */
        function SettingsCtrl($scope, $mdDialog) {
            $scope.vm=vm;
            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.addSource=function(input){
                vm.sources.push((input||'').replace(/\s+/g, ''));
            };
            $scope.removeSource=function(index){
                vm.sources.splice(index, 1);
            };
        }


        var widgetSource = customService.items,
            containerSource = customService.containers;
        vm.customWidgets = customWidgets;

        var dragula = new Dragula(containerSource, containerSource, widgetSource, {
            scope: $scope,
            dragulaService: dragulaService,
            $timeout: $timeout
        }, {
            onDrop: function () {
                vm.compile();
            }
        });

        $scope.initDragula = dragula.init.bind(dragula);

        siteDesign.ctr(vm, $scope, dragula, 'page', pageData);
        vm.setPreviewScale(0.5);
    }

    /* @ngInject */
    function WidgetEditorController(widgetData, customService, $stateParams, $scope, dragulaService, $timeout, siteDesign) {
        var vm = this;

        vm.widgetName = $stateParams.widgetName || ('New Widget-' + (new Date()).getTime());
        var elementSource = customService.items,
            containerSource = customService.containers;

        var dragula = new Dragula(containerSource, containerSource, elementSource, {
            scope: $scope,
            dragulaService: dragulaService,
            $timeout: $timeout
        }, {
            // maxRoot: 1,
            onDrop: function () {
                vm.compile();
            }
        });
        $scope.initDragula = dragula.init.bind(dragula);
        vm.previewPanel = true;

        siteDesign.ctr(vm, $scope, dragula, 'widget', widgetData);
    }

    /* @ngInject */
    function BasicApiController(articleProduct, $firebaseStorage, $scope, $mdSidenav, $stateParams) {
        $scope.$mdSidenav = $mdSidenav;
        $scope.$get = $firebaseStorage.get;
        $scope.$getProduct = articleProduct.getProduct;
        $scope.$getArticle = articleProduct.getArticle;
        $scope.$queryList = articleProduct.queryList;
        $scope.$queryProduct = articleProduct.queryProduct;
        $scope.$queryArticle = articleProduct.queryArticle;
        $scope.$getCate = articleProduct.getCate;
        $scope.$getCateCrumbs = articleProduct.getCateCrumbs;
        $scope.$cate = articleProduct.cate;
        $scope.params = JSON.parse($stateParams.params || '{}');
        if (!$scope.$go) $scope.$go = function (pageName, params) {
            var _params = {};
            if (angular.isObject(params)) angular.extend(_params, params);
            console.log(params);
            console.log({pageName: pageName, params: JSON.stringify(_params)});
        };
    }

    /* @ngInject */
    function CustomPageController(pageData, qtSettings, $scope,customService, $stateParams, $timeout, $state) {
        var customPage = this;
        // window.parent.setUpPreviewFrame();

        window.previewRefresh= function(data){
            console.log(data);
        };


        $scope.$go = function (pageName, params) {
            var _params = {};
            if (angular.isObject(params)) angular.extend(_params, params);
            $state.go('customPage', {
                pageName: pageName || $stateParams.pageName,
                params: JSON.stringify(_params)
            });
        };

        angular.extend(customPage, $stateParams);
        customPage.settingsGroups = qtSettings.custom;


        setModelData(pageData, pageData.cssKey);

        function setModelData(val, key) {
            $timeout(function () {
                customPage.pageData = val;
                customPage.html = customService.compileAll(val.content);
                customPage.js = val.js;
            }, 0);
        }


        // customPage.getSites = function () {
        //     if (authData) $firebase.ref('users/detail/' + authData.uid + '/sites').once('value', function (snap) {
        //         customPage.mysites = snap.val();
        //     })
        // };
        // customPage.copyPageTo = function (siteName) {
        //
        //     var pid = $firebase.ref('').push().key,
        //         css = customPage.pageData.css,
        //         content = customPage.pageData.content,
        //         name = "Copy-" + siteName + "-" + customPage.pageName,
        //         compressed = lzString.compress({
        //             "css": css || '',
        //             "content": content
        //         }),
        //         pageData = {
        //             "name": name,
        //             "compressed@1": compressed,
        //             "editTime@0": firebase.database.ServerValue.TIMESTAMP
        //         };
        //     $firebase.update('sites/detail/' + siteName + '/pages', ['list/' + pid, 'detail/' + pid], pageData);
        //     $firebaseStorage.update('pages/detail/' + name + '@selectedSite', {
        //         "css": css || null,
        //         "content": content
        //     });
        // }
    }

    /* @ngInject */
    function PreviewFrameController(qtSettings,$lazyLoad, $scope,customService, $stateParams, $timeout, $state) {
        var customPage = this;

        angular.extend(customPage, $stateParams);
        customPage.settingsGroups = qtSettings.custom;


        window.previewRefresh = function(data,reload){
            if(!reload){
                $lazyLoad.loadPreview(data).then(function(pageData){
                    setModelData(pageData);
                })
            }
        };
        window.parent.initPreviewFrame();

        function setModelData(val) {
            $timeout(function () {
                customPage.pageData = val;
                customPage.html = customService.compileAll(val.content);
                customPage.js = val.js;
            }, 0);
        }
    }

    ////////Classes

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

        this.steps = {
            index: -1,
            action: '',
            cache: []
        };

        var self = this;
        self.scope.$watch('containers', function () {
            registerStep();
        }, true);

        function registerStep() {
            var index = self.steps['index'],
                action = self.steps['action'],
                lastIndex = self.steps['cache'].length - 1;
            if (action === '') {
                if (index !== lastIndex) {
                    self.steps['cache'].splice(index + 1, lastIndex - index, angular.copy(self.scope.containers));
                } else {
                    self.steps['cache'].push(angular.copy(self.scope.containers));
                }
                self.steps['index'] = self.steps['cache'].length - 1;
                if (self.steps['cache'].length > 20) {
                    self.steps['index']--;
                    self.steps['cache'].shift()
                }
            } else {
                self.steps['action'] = '';
            }
        }

        this.undo = function () {
            if (self.steps['index'] < 1 || self.steps.cache.length < 2) return;
            var resumed = self.steps['cache'][self.steps['index'] - 1];
            if (resumed.root.length < 1) return;
            self.steps['index']--;
            self.steps['action'] = 'undo';
            self.scope.containers = resumed;
        };
        this.redo = function () {
            if (self.steps['index'] === self.steps['cache'].length - 1) return;
            self.steps['index']++;
            var resumed = self.steps['cache'][self.steps['index']];
            self.steps['action'] = 'redo';
            self.scope.containers = resumed;
        }
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
                },
                accepts: function (el, target, source, sibling) {
                    return !target.classList.contains('nodrop');
                }
            });
            self.dragulaService.options(self.scope, 'drag-container-lv1', {
                moves: function (el, container, handle) {
                    return handle.classList.contains('lv1-handle');
                },
                accepts: function (el, target, source, sibling) {
                    return !target.classList.contains('nodrop');
                }
            });
            self.dragulaService.options(self.scope, 'drag-container-lv2', {
                moves: function (el, container, handle) {
                    return handle.classList.contains('lv2-handle');
                },
                accepts: function (el, target, source, sibling) {
                    return !target.classList.contains('nodrop');
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
                var cid = Math.random().toString();
                self.scope.containers[cid] = [];
                copy.push(angular.extend({}, item, {cid: cid}))
            });
            return copy;
        }
    };
})();
