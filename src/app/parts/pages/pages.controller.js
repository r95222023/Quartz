(function () {
    'use strict';

    angular
        .module('app.parts.pages')
        .controller('BasicApiController', BasicApiController)
        .controller('CustomPageController', CustomPageController)
        .controller('PreviewFrameController', PreviewFrameController);

    /* @ngInject */
    function BasicApiController(articleProduct, $auth, $firebaseStorage, $scope, $mdSidenav,$state, $stateParams) {
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
        $scope.$auth = $auth;
        $scope.$login = function(pageName, state){
            var toParams = {
                pageName: pageName || $stateParams.pageName,
                params: JSON.stringify($stateParams.params)
            };
            if($state.name!=='customPage'){
                toParams.stateName=$state.name;
            }
            $state.go('authentication.login', toParams);
        };
        $scope.params = JSON.parse($stateParams.params || '{}');
        if (!$scope.$go) $scope.$go = function (pageName, params) {
            var _params = {};
            if (angular.isObject(params)) angular.extend(_params, params);
            console.log(params);
            console.log({pageName: pageName, params: JSON.stringify(_params)});
        };
    }

    /* @ngInject */
    function CustomPageController(pageData, qtSettings, $scope, customService, $stateParams, $timeout, $state) {
        var customPage = this;
        // window.parent.setUpPreviewFrame();

        window.previewRefresh = function (data) {
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
                customPage.sources = val.sources;
            }, 0);
        }
    }

    /* @ngInject */
    function PreviewFrameController(qtSettings, $lazyLoad, $scope, customService, $stateParams, $timeout, $state) {
        var customPage = this;

        angular.extend(customPage, $stateParams);
        customPage.settingsGroups = qtSettings.custom;


        window.refreshPreview = function (data, type) {
            switch (type) {
                case 'init':
                    $lazyLoad.load(data, $stateParams.pageName).then(function (pageData) {
                        setModelData(pageData);
                    });
                    break;
                default:
                    setModelData(data);
                    break;
            }
        };
        window.parent.initPreviewFrame();

        function setModelData(val) {
            $timeout(function () {
                customPage.pageData = val;
                customPage.html = customService.compileAll(val.content);
                customPage.js = val.js;
                customPage.sources = val.sources;
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
