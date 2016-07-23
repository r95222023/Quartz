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
    function PageManagerController($firebase, $firebaseStorage, qtNotificationsService, $state, $stateParams, $mdDialog, config) {
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
    function PageEditorController(lzString, articleProduct, injectCSS, customService, customWidgets, $state, $stateParams, $firebase, $firebaseStorage, $rootScope, $scope, dragulaService, $mdSidenav, $timeout, snippets) {
        var vm = this;

        // angular.extend($scope, articleProduct);
        $scope.$mdSidenav = $mdSidenav;
        $scope.$get = $firebaseStorage.get;
        $scope.$getProduct = articleProduct.getProduct;
        $scope.$getArticle = articleProduct.getArticle;
        $scope.$queryList = articleProduct.queryList;
        $scope.$queryProduct = articleProduct.queryProduct;
        $scope.$queryArticle = articleProduct.queryArticle;
        $scope.$getCate = articleProduct.getCate;
        $scope.$cate = articleProduct.cate;
        $scope.$getCateCrumbs = articleProduct.getCateCrumbs;
        $scope.params = JSON.parse($stateParams.params || '{}');
        // $scope.$go = function (pageName, params) {
        //     var _params = {};
        //     if (angular.isObject(params)) angular.extend(_params, params);
        //     $state.go('quartz.admin-default.customPage', {
        //         pageName: pageName || $stateParams.pageName,
        //         params: JSON.stringify(_params)
        //     });
        // };
        $scope.$go = function (pageName, params) {
            var _params = {};
            if (angular.isObject(params)) angular.extend(_params, params);
            console.log(params);
            console.log({pageName: pageName, params: JSON.stringify(_params)});
        };

        vm.scope = $scope;

        vm.pageName = $stateParams.pageName || ('New Page-' + (new Date()).getTime());

        var widgetSource = customService.items,
            containerSource = customService.containers;
        vm.customWidgets = customWidgets;
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

        if ($stateParams.pageName && $stateParams.id) {
            $firebaseStorage.getWithCache('pages/detail/' + $stateParams.pageName + '@selectedSite').then(function (val) {
                console.log(val.content)
                customService.convert(val.content, $scope['containers'], 3);
                vm.pageCss = val.css || '';
                vm.canvas = val.canvas || {};
                // $timeout(function(){
                //     customService.convert(val.content, $scope['containers'], 3);
                //     vm.pageCss = val.css || '';
                // },0);
            });
            vm.pageRef = $firebase.ref(pageListRefUrl).child($stateParams.id);
        } else {
            vm.pageRef = $firebase.ref(pageListRefUrl).push();
        }

        action(vm, 'page', $firebase, $firebaseStorage, $scope, $rootScope, $state, $mdSidenav, dragula, injectCSS, customService, lzString, snippets, $timeout);

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

        action(vm, 'widget', $firebase, $firebaseStorage, $scope, $rootScope, $state, $mdSidenav, dragula, injectCSS, customService, lzString);
    }

    /* @ngInject */
    function CustomPageController(lzString, articleProduct, getSyncTime, injectCSS, authData, $firebase, $firebaseStorage, qtSettings, $scope, $rootScope, $mdSidenav, customService, $stateParams, $timeout, $state) {
        var customPage = this,
            pageName = $stateParams.pageName,
            isIndex = !pageName || pageName === "index",
            orderBy = isIndex ? "index" : "name",
            equalTo = isIndex ? true : pageName,
            pageCachePath = 'page' + pageName + '@selectedSite';


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
        $scope.$go = function (pageName, params) {
            var _params = {};
            if (angular.isObject(params)) angular.extend(_params, params);
            $state.go('quartz.admin-default.customPage', {
                pageName: pageName || $stateParams.pageName,
                params: JSON.stringify(_params)
            });
        };

        angular.extend(customPage, $stateParams);
        customPage.settingsGroups = qtSettings.custom;

        customPage.scope = $scope;


        $firebaseStorage.getWithCache('pages/detail/' + pageName + '@selectedSite').then(function (res) {
            setModelData(res, res.cssKey);
        });

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
                css = customPage.pageData.css,
                content = customPage.pageData.content,
                name = "Copy-" + siteName + "-" + customPage.pageName,
                compressed = lzString.compress({
                    "css": css || '',
                    "content": content
                }),
                pageData = {
                    "name": name,
                    "compressed@1": compressed,
                    "editTime@0": firebase.database.ServerValue.TIMESTAMP
                };
            $firebase.update('sites/detail/' + siteName + '/pages', ['list/' + pid, 'detail/' + pid], pageData);
            $firebaseStorage.update('pages/detail/' + name + '@selectedSite', {
                "css": css || null,
                "content": content
            });
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

    function action(vm, type, $firebase, $firebaseStorage, $scope, $rootScope, $state, $mdSidenav, dragula, injectCSS, customService, lzString, snippets, $timeout) {
        vm.getHtmlContent = customService.getHtmlContent;
        vm.isAttrsConfigurable = customService.isAttrsConfigurable;
        vm.isTagConfigurable = customService.isTagConfigurable;
        vm.layoutOptions = customService.layoutOptions;
        vm.ctrls = customService.ctrls;

        vm.actions = [['edit', 'GENERAL.EDIT'], ['copy', 'GENERAL.COPY'], ['delete', 'GENERAL.DELETE']];
        vm.media = 'all';

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

        function isInsideMq(bp) {
            var x = vm.viewMediaQuery;
            switch (bp) {
                case 'xs':
                    return (x == '0~599');
                    break;
                case 'gt-xs':
                    return (x == '600~959' || x == '960~1279' || x == '1280~1919' || x == '>1920');
                    break;
                case 'sm':
                    return (x == '600~959');
                    break;
                case 'gt-sm':
                    return (x == '960~1279' || x == '1280~1919' || x == '>1920');
                    break;
                case 'md':
                    return (x == '960~1279');
                    break;
                case 'gt-md':
                    return (x == '1280~1919' || x == '>1920');
                    break;
                case 'lg':
                    return (x == '1280~1919');
                    break;
                case 'gt-lg':
                    return (x == '>1920');
                    break;
                case 'xl':
                    return (x == '>1920');
                    break;
                default:
                    return true;
                    break;
            }
        }


        vm.getLayoutClass = function (itemLayout) {
            var inner = '',
                flex = '',
                display = '';

            angular.forEach(['all', 'xs', 'gt-xs', 'sm', 'gt-sm', 'md', 'gt-md', 'lg', 'gt-lg', 'xl'], function (breakpoint) {
                if (!itemLayout) return;
                if (vm.media === 'all' && breakpoint !== 'all') return;
                var layout = itemLayout[breakpoint];
                if (!layout || !isInsideMq(breakpoint)) return;
                angular.forEach(layout, function (value, key) {
                    if (value === null) return;
                    var _value = '-' + value + ' ',
                        _property = key;
                    switch (key) {
                        case 'flex':
                            if (value === 'flex') _value = ' ';
                            flex = _property + _value;
                            return;
                            break;
                        case 'flex-offset':
                            break;
                        case 'flex-order':
                            break;
                        case 'layout':
                            break;
                        case 'layout-align':
                            _value = '-' + (value.x || 'start' + value.y || 'stretch') + ' ';
                            break;
                        case 'hide':
                            display = 'hide';
                            break;
                        case 'show':
                            display = 'show';
                            break;
                        default:
                            _property = value ? _property + ' ' : '';
                            _value = ''; //ex layout-fill:true will get layout-fill
                            break;
                    }
                    inner += _property + _value;
                })
            });
            return {inner: inner, outer: flex + display}
        };

        function importData(data) {
            $timeout(function () {
                var styleSheets = {},
                    content = customService.convertBack($scope.containers, 'root', styleSheets) || [],
                    css = vm.pageCss || '' + vm.buildCss(styleSheets) || '',
                    result = angular.isString(data) ? JSON.parse(data) : data;

                customService.convert(content.concat(result.content || []), $scope['containers'], 3);
                vm.pageCss = css + ' ' + (result.css || '');
            }, 0)
        }

        var htmlBuilder = new Tautologistics.NodeHtmlParser.HtmlBuilder(angular.noop, {enforceEmptyTags: true});

        vm.importHtml = function ($files) {
            if ($files !== null && $files.length > 0) {
                var file = $files[0],
                    reader = new FileReader();

                reader.onload = function () {
                    parseHtml(reader.result.replace(/(\r\n|\n|\r)/gm, ""), function (error, dom) {
                        if (error) {
                            console.log(error);
                        } else {
                            importData({content: formatParsedHtml(dom, 1)})
                        }
                    })
                };
                reader.readAsText(file);
            }
        };

        function parseHtml(rawHtml, callback) {
            var handler = new Tautologistics.NodeHtmlParser.HtmlBuilder(callback, {caseSensitiveAttr: true});

            var parser = new Tautologistics.NodeHtmlParser.Parser(handler);
            parser.parseComplete(getBody(rawHtml));
        }

        function getBody(rawHtml) {
            var body = /<body.*?>([\s\S]*)<\/body>/.exec(rawHtml) || {};
            return body[1] || rawHtml;
        }

        function htmlize(arr) {
            var res = '';
            for (var i = 0; i < arr.length; i++) {
                var element = arr[i],
                    type = element.type,
                    data = element.raw || element.data;
                if (type === 'tag') {
                    res += '<' + data + '>';

                    if (element.children) {
                        res += htmlize(element.children)
                    }

                    if (!htmlBuilder.isEmptyTag(element)) res += '</' + element.name + '>'
                } else if (type === 'text') {
                    res+=data;
                }
            }
            return res;
        }

        function factorAttr(attrArr) {
            var res = {},
                attrString = '';
            angular.forEach(attrArr || {}, function (val, key) {
                if (key === 'class') {
                    res.class = val;
                } else if (key === 'style') {
                    res.style = val;
                } else {
                    attrString += val ? key + '="' + val + '" ' : key + ' ';
                }
            });
            if (attrString) res.attrs = attrString;
            return res;
        }

        function formatParsedHtml(parsedHtml, level) {
            var res = [];
            for (var i = 0; i < parsedHtml.length; i++) {
                var rawChild = parsedHtml[i],
                    child = {},
                    type = rawChild.type,
                    tag = rawChild.name,
                    data = rawChild.raw||rawChild.data;

                if (type === 'tag') {
                    var regId = /id\s*=\s*['"](.*?)['"]/g,
                        m=regId.exec(data);

                    if (m!== null) {
                        child.id=m[1];
                    }
                    child.tag = rawChild.name;
                    angular.extend(child, factorAttr(rawChild.attributes));
                    if (rawChild.children) {
                        if (level < 3) {
                            child.content = '<!--include-->';
                            child.divs = formatParsedHtml(rawChild.children, level + 1);
                        } else {
                            child.content = htmlize(rawChild.children);
                        }
                    }
                } else if (type === 'text') {
                    child.type = 'text';
                    child.content = rawChild.raw || rawChild.data || '';
                }
                if(type!=='comment'&&tag!=='meta'){
                    res.push(child);
                }
            }
            return res;
        }

        if (type === 'page') {
            vm.originalPageName = $state.params.pageName + '';
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
                    case 'setWidget':
                        if (!vm.widget[cid + index]) return;
                        var widget = lzString.decompress(vm.widget[cid + index]);
                        widget.cid = $scope.containers[cid][index].cid;
                        $scope.containers[cid][index] = widget;
                        break;
                }
            };
            vm.editItem = function (cid, index) {
                // vm.item = {};
                $mdSidenav('editCustomItem').open();
                vm.selectedContainerId = cid;
                vm.selectedItemIndex = index;
                if (cid === 'canvas') {
                    vm.item = angular.copy(vm.canvas || {});
                    return;
                }
                vm.item = angular.extend({}, $scope.containers[cid][index]);
                vm.backUpItem = angular.copy($scope.containers[cid][index]);
            };

            vm.updateItem = function () {
                $mdSidenav('editCustomItem').close();
                if (vm.selectedContainerId === 'canvas') {
                    console.log(vm.item);
                    vm.canvas = vm.item;
                } else {
                    $scope.containers[vm.selectedContainerId][vm.selectedItemIndex] = vm.item;
                }
            };


            vm.compile = function () {
                var styleSheets = {};
                var compiled = customService.compile(customService.convertBack($scope.containers, 'root', styleSheets));
                // vm.pageRef.once('value', function (snap) {
                //     vm.pageCss = vm.pageCss || snap.child('css').val() || '';
                //     vm.widgetsCss = vm.buildCss(styleSheets);
                //     vm.injectCss();
                // });
                vm.widgetsCss = vm.buildCss(styleSheets);
                vm.injectCss();
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

            vm.import = function ($files) {
                if ($files !== null && $files.length > 0) {
                    var file = $files[0],
                        reader = new FileReader();

                    reader.onload = function () {
                        importData(reader.result);
                        // $timeout(function () {
                        //     var styleSheets = {},
                        //         content = customService.convertBack($scope.containers, 'root', styleSheets) || [],
                        //         css = vm.pageCss || '' + vm.buildCss(styleSheets) || '',
                        //         result = JSON.parse(reader.result);
                        //
                        //     customService.convert(content.concat(result.content || []), $scope['containers'], 3);
                        //     vm.pageCss = css + ' ' + (result.css || '');
                        // }, 0)
                    };
                    reader.readAsText(file);
                }
            };

            vm.export = function () {
                var styleSheets = {},
                    content = customService.convertBack($scope.containers, 'root', styleSheets),
                    css = vm.pageCss || '' + vm.buildCss(styleSheets) || '';
                snippets.saveData({content: content, css: css}, vm.pageName + '.json')
            };

            vm.update = function () {
                var styleSheets = {},
                    content = customService.convertBack($scope.containers, 'root', styleSheets),
                    css = vm.pageCss || '' + vm.buildCss(styleSheets) || '';

                var pid = vm.pageRef.key,
                    upload = function () {
                        var data = {
                            "css": css || '',
                            "content": content
                        };
                        $firebase.update(pageRefUrl, ['list/' + pid, 'detail/' + vm.pageName], {
                            "name": vm.pageName,
                            "author": $firebase.params["$uid"] || null,
                            "compressed@1": lzString.compress(data),
                            "editTime@0": firebase.database.ServerValue.TIMESTAMP
                        });

                        $firebaseStorage.update('pages/detail/' + vm.pageName + '@selectedSite', data).then(vm.revert);
                    };

                if (vm.originalPageName && vm.originalPageName !== vm.pageName) {
                    vm.pageRef.parent.orderByChild('name').equalTo(vm.pageName).limitToFirst(1).once('value', function (snap) {
                        snap.forEach(function (child) {
                            child.ref.remove();
                            vm.pageRef.parent.parent.child('detail').child(vm.originalPageName).remove();
                        });
                        upload();
                    });
                    $firebaseStorage.remove('pages/detail/' + vm.originalPageName + '@selectedSite');
                    vm.originalPageName = angular.copy(vm.pageName);
                } else {
                    upload();
                }
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
                // vm.item = {};
                vm.item = angular.extend({}, $scope.containers[cid][index]);
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

            vm.export = function () {

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
