(function () {
    'use strict';

    angular
        .module('app.parts.pages')
        .controller('PageManagerController', PageManagerController)
        .controller('WidgetManagerController', WidgetManagerController)
        .controller('PageEditorController', PageEditorController)
        .controller('WidgetEditorController', WidgetEditorController)
        .controller('CustomPageController', CustomPageController);

    var pageRefUrl = 'pages@selectedSite',
        pageListRefUrl = 'pages/list@selectedSite',
        pageDetailRefUrl = 'pages/detail@selectedSite',
        widgetRefUrl = 'widgets@selectedSite',
        widgetListRefUrl = 'widgets/list@selectedSite',
        widgetDetailRefUrl = 'widgets/detail@selectedSite';

    /* @ngInject */
    function PageManagerController($firebase, qtNotificationsService, $state, $stateParams, $mdDialog, config) {
        var vm = this;

        //Todo: 改名 刪除
        vm.actions = [['view', 'GENERAL.VIEW'], ['edit', 'GENERAL.EDIT'], ['setPrivate', 'GENERAL.SETPRIVATE'], ['setPublic', 'GENERAL.SETPUBLIC'], ['delete', 'GENERAL.DELETE']];
        vm.action = function (action, id, name) {
            switch (action) {
                case 'view':
                    $state.go('quartz.admin-default.customPage', {id: id, pageName: name});
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
                    });

                    break;
            }
        };
        vm.paginator = $firebase.paginator(pageListRefUrl);
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
    function PageEditorController(lzString, injectCSS, customService, customWidgets, $state, $stateParams, $firebase, $firebaseStorage, $rootScope, $scope, dragulaService, $mdSidenav, $timeout) {
        var vm = this;

        $scope.$mdSidenav = $mdSidenav;
        vm.scope = $scope;

        vm.pageName = $stateParams.pageName || ('New Page-' + (new Date()).getTime());

        var widgetSource = angular.extend({}, customWidgets, customService.items),
            containerSource = customService.containers,
            pageRootRef = $firebase.ref(pageDetailRefUrl);
        //vm.getHtmlContent = customService.getHtmlContent;
        //vm.isAttrsConfigurable = customService.isAttrsConfigurable;
        //vm.isTagConfigurable = customService.isTagConfigurable;
        //vm.layoutOptions = customService.layoutOptions;

        var dragula = new Dragula(containerSource, containerSource, widgetSource, {
            scope: $scope,
            dragulaService: dragulaService,
            $timeout: $timeout
        });

        $scope.initDragula = dragula.init.bind(dragula);

        if ($stateParams.pageName) {
            pageRootRef.orderByKey().equalTo($stateParams.id).once('child_added', function (snap) {
                var val = lzString.decompress(snap.val());
                if (val) {
                    $timeout(function () {

                        customService.convert(val.content, $scope['containers'], 3);
                        vm.pageRef = snap.ref;
                        vm.pageCss = val.css || '';
                    }, 0);
                }
            });
        } else {
            vm.pageRef = pageRootRef.push();
        }

        action(vm, 'page', $firebase, $firebaseStorage, $scope, $rootScope, $state, $mdSidenav, dragula, injectCSS, customService);

    }

    /* @ngInject */
    function WidgetEditorController(lzString, injectCSS, customService, $state, $stateParams, $firebase, $firebaseStorage, $rootScope, $scope, dragulaService, $mdSidenav, $timeout) {
        var vm = this;

        vm.widgetName = $stateParams.widgetName || ('New Widget-' + (new Date()).getTime());
        var elementSource = customService.items,
            containerSource = customService.containers,
            widgetRootRef = $firebase.ref(widgetDetailRefUrl);
        //vm.getHtmlContent = customService.getHtmlContent;
        //vm.isAttrsConfigurable = customService.isAttrsConfigurable;
        //vm.isTagConfigurable = customService.isTagConfigurable;
        //vm.layoutOptions = customService.layoutOptions;


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
            widgetRootRef.orderByKey().equalTo($stateParams.id).once('child_added', function (snap) {
                var val = lzString.decompress(snap.val());

                if (val) {
                    $timeout(function () {
                        customService.convert(val.content, $scope['containers'], 3);
                        vm.widgetRef = snap.ref;
                        vm.widgetCss = val.css || '';
                        vm.compile();
                    }, 0);
                }
            });
        } else {
            vm.widgetRef = widgetRootRef.push();
        }

        action(vm, 'widget', $firebase, $firebaseStorage, $scope, $rootScope, $state, $mdSidenav, dragula, injectCSS, customService);
    }

    /* @ngInject */
    function CustomPageController(lzString, getSyncTime, injectCSS, authData, $firebase, $firebaseStorage, qtSettings, $scope, $rootScope, $mdSidenav, customService, $stateParams, $timeout, qtNotificationsService, $state, $mdDialog, config) {
        var customPage = this,
            pageName = $stateParams.pageName,
            isIndex = !pageName || pageName === "index",
            orderBy = isIndex ? "index" : "name",
            equalTo = isIndex ? true : pageName,
            pageCachePath = 'page' + pageName + '@selectedSite';


        $scope.$mdSidenav = $mdSidenav;
        angular.extend(customPage, $stateParams);
        customPage.settingsGroups = qtSettings.custom;

        customPage.scope = $scope;


        $firebaseStorage.getWithCache('pages/detail/' + pageName + '@selectedSite').then(function (res) {
            setModelData(res, res.cssKey);
        });

        //var editTimeRef = $firebase.ref(pageListRefUrl).orderByChild(orderBy).equalTo(equalTo).limitToFirst(1);
        // $firebase.cache(pageCachePath, editTimeRef, null, {
        //     isValue: false,
        //     fetchFn: getData
        // }).then(function (cachedVal) {
        //     setModelData(cachedVal, cachedVal.cssKey);
        // });
        //
        // function getData() {
        //     $firebase.ref(pageDetailRefUrl).orderByChild(orderBy).equalTo(equalTo).limitToFirst(1).once('value', function (parentSnap) {
        //         if (parentSnap.val() === null) {
        //             $state.go('404');
        //             return true;
        //         }
        //
        //         parentSnap.forEach(function (snap) {
        //             var val = lzString.decompress(snap.val());
        //             if (localStorage) {
        //                 val.cachedTime = getSyncTime();
        //                 val.cssKey = snap.key;
        //                 localStorage.setItem(pageCachePath, lzString.compress(val));
        //             }
        //             setModelData(val, snap.key);
        //         });
        //     }, function (err) {
        //         $state.go('404');
        //         return true;
        //     });
        // }

        function setModelData(val, key) {
            $timeout(function () {
                injectCSS.setDirectly(key, val.css);
                customPage.pageData = val;
                customPage.html = customService.compile(val.content);
            }, 0);
            var listener = $rootScope.$on('$stateChangeStart',
                function () {
                    injectCSS.remove(key);
                    listener();
                });
        }


        customPage.getSites = function () {
            if (authData) $firebase.ref('users/detail/' + authData.uid + '/sites').once('value', function (snap) {
                customPage.mysites = snap.val();
            })
        };
        customPage.copyPageTo = function (siteName) {

            var pid = $firebase.ref('').push().key,
                pageData = {
                    "name": "Copy-" + siteName + "-" + customPage.pageData.name,
                    "content@1": customPage.pageData.content,
                    "css@1": customPage.pageData.css || null,
                    "editTime@0": firebase.database.ServerValue.TIMESTAMP
                };
            $firebase.update('sites/detail/' + siteName + '/pages', ['list/' + pid, 'detail/' + pid], pageData);
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
                var cid = Math.random().toString();
                self.scope.containers[cid] = [];
                copy.push(angular.extend({}, item, {cid: cid}))
            });
            return copy;
        }
    };

    function action(vm, type, $firebase, $firebaseStorage, $scope, $rootScope, $state, $mdSidenav, dragula, injectCSS, customService) {
        vm.getHtmlContent = customService.getHtmlContent;
        vm.isAttrsConfigurable = customService.isAttrsConfigurable;
        vm.isTagConfigurable = customService.isTagConfigurable;
        vm.layoutOptions = customService.layoutOptions;

        vm.actions = [['edit', 'GENERAL.EDIT'], ['copy', 'GENERAL.COPY'], ['delete', 'GENERAL.DELETE']];

        vm.copyItem = function (cid, index) {
            var copied = angular.copy($scope.containers[cid][index]);
            copied.cid = Math.random().toString();
            $scope.containers[cid].splice(index, 0, copied);
            $scope.containers[copied.cid] = [];
        };

        vm.deleteItem = function (cid, index) {
            $scope.containers[cid].splice(index, 1);
        };

        vm.toggleEditor = function () {
            $mdSidenav('editCustomItem').toggle();
        };

        if (type === 'page') {
            vm.action = function (action, cid, index) {
                switch (action) {
                    case 'edit':
                        vm.editItem(cid, index);
                        break;
                    case 'copy':
                        vm.copyItem(cid, index);
                        break;
                    case 'delete':
                        vm.deleteItem(cid, index);
                        break;
                }
            };
            vm.editItem = function (cid, index) {
                vm.item = {};
                vm.item = angular.copy($scope.containers[cid][index]);
                vm.backUpItem = angular.copy($scope.containers[cid][index]);
                if (vm.item.type === 'customWidget') {
                    vm.item.content = vm.getHtmlContent(vm.item);
                    vm.item.type = 'custom';
                }
                vm.selectedContainerId = cid;
                vm.selectedItemIndex = index;
                $mdSidenav('editCustomItem').open();
            };

            vm.updateItem = function () {
                $mdSidenav('editCustomItem').close();

                if (vm.item.type === 'customWidget') {
                    if (vm.getHtmlContent(vm.backUpItem) === vm.item.content) {
                        return;
                    } else {
                        vm.item.type = 'custom';
                    }
                }
                $scope.containers[vm.selectedContainerId][vm.selectedItemIndex] = vm.item;
            };


            vm.compile = function () {
                var styleSheets = {};
                var compiled = customService.compile(customService.convertBack($scope.containers, 'root', styleSheets));
                vm.pageRef.once('value', function (snap) {
                    vm.pageCss = vm.pageCss || snap.child('css').val() || '';
                    vm.widgetsCss = vm.buildCss(styleSheets);
                    vm.injectCss();
                });
                vm.html = compiled
            };

            vm.injectCss = function () {
                injectCSS.setDirectly(vm.pageRef.key, vm.pageCss + vm.widgetsCss);
                var dereg = $rootScope.$on('$stateChangeStart',
                    function () {
                        injectCSS.remove(vm.pageRef.key);
                        dereg();
                    });
            };

            vm.update = function () {
                var styleSheets = {},
                    content = customService.convertBack($scope.containers, 'root', styleSheets),
                    css = vm.pageCss || '' + vm.buildCss(styleSheets) || '';
                //var data = {
                //    name: vm.pageName,
                //    content: content,
                //    css: css || null,
                //    editTime: Firebase.ServerValue.TIMESTAMP
                //};
                //vm.pageRef.update(data);
                var pid = vm.pageRef.key,
                    compressed = LZString.compressToUTF16(JSON.stringify({
                        "css": css || '',
                        "content": content
                    }));

                $firebase.update(pageRefUrl, ['list/' + pid, 'detail/' + pid], {
                    "name": vm.pageName,
                    "author": $firebase.params["$uid"] || null,
                    // "compressed@1": compressed,
                    "editTime@0": firebase.database.ServerValue.TIMESTAMP
                });

                $firebaseStorage.update('pages/detail/' + vm.pageName + '@selectedSite', {
                    "css": css || '',
                    "content": content
                });

                vm.revert();
            };

            vm.buildCss = function (styleSheets) {
                var widgetsCss = '';
                angular.forEach(styleSheets, function (widgetCss) {
                    if (vm.pageCss.indexOf(widgetCss) === -1) {
                        widgetsCss += widgetCss
                    }
                });
                return widgetsCss;
            };

            vm.revert = function () {
                $state.go($state.current, {pageName: vm.pageName, id: vm.pageRef.key}, {reload: true});
            };

            vm.undo = dragula.undo;
            vm.redo = dragula.redo;
        } else {
            vm.action = function (action, cid, index) {
                switch (action) {
                    case 'edit':
                        vm.editItem(cid, index);
                        break;
                    case 'copy':
                        vm.copyItem(cid, index);
                        vm.compile();
                        dragula.resetDragula();
                        break;
                    case 'delete':
                        vm.deleteItem(cid, index);
                        vm.compile();
                        break;
                }
            };
            vm.editItem = function (cid, index) {
                vm.item = {};
                vm.item = angular.copy($scope.containers[cid][index]);
                vm.selectedContainerId = cid;
                vm.selectedItemIndex = index;
                $mdSidenav('editCustomItem').open();
            };

            vm.updateItem = function () {
                $scope.containers[vm.selectedContainerId][vm.selectedItemIndex] = vm.item;
                vm.compile();
                $mdSidenav('editCustomItem').close();
            };


            vm.compile = function () {
                var compiled = customService.compile(customService.convertBack($scope.containers, 'root'));
                vm.widgetRef.once('value', function (snap) {
                    vm.widgetCss = vm.widgetCss || snap.child('css').val() || '';
                    vm.injectCss();
                });
                vm.html = compiled
            };

            vm.injectCss = function () {
                injectCSS.setDirectly(vm.widgetRef.key, vm.widgetCss);
                var dereg = $rootScope.$on('$stateChangeStart',
                    function () {
                        injectCSS.remove(vm.widgetRef.key);
                        dereg();
                    });
            };

            vm.update = function () {
                //var data = {
                //    name: vm.widgetName,
                //    type: 'customWidget',
                //    css: vm.widgetCss || null,
                //    content: customService.convertBack($scope.containers),
                //    editTime: Firebase.ServerValue.TIMESTAMP
                //};
                //vm.widgetRef.update(data);
                var css = vm.widgetCss || '',
                    content = customService.convertBack($scope.containers);

                var wid = vm.widgetRef.key,
                    compressed = LZString.compressToUTF16(JSON.stringify({
                        "css": css,
                        "content": content
                    }));
                $firebase.update(widgetRefUrl, ['list/' + wid, 'detail/' + wid], {
                    "name": vm.widgetName,
                    "author": $firebase.params["$uid"],
                    "type@1": 'customWidget',
                    "compressed@1": compressed,
                    "editTime@0": firebase.database.ServerValue.TIMESTAMP
                });

                vm.revert();
            };

            vm.revert = function () {
                $state.go($state.current, {widgetName: vm.widgetName, id: vm.widgetRef.key}, {reload: true});
            };

            vm.undo = function () {
                dragula.undo();
                vm.compile();
            };
            vm.redo = function () {
                dragula.redo();
                vm.compile();
            };
        }
    }

})();
