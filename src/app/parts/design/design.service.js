(function () {
    'use strict';

    angular
        .module('app.parts.design')
        .factory('siteDesign', SiteDesign);

    /* @ngInject */
    function SiteDesign($auth, $firebase, $stateParams, dragulaService, $firebaseStorage, $state, $mdToast, $ocLazyLoad, customService, snippets, $timeout) {
        function previewCtr(vm, $scope, frameData) {
            var previewFrames = ['preview-full-frame', 'preview-frame'];
            vm.previewUrl = function(){
                return '/preview/#!/preview/' + $stateParams.siteName + '/' + $stateParams.pageName + '/';
            };
            window.initPreviewFrame = function () {
                angular.forEach(previewFrames, function (type) {
                    if (window.frames[type]) window.frames[type].refreshPreview(frameData);
                    vm[type] = true;
                });
            };
            var oldFrameData='';
            vm.refreshPreview = function () {
                var reload,
                    // styleSheets = {},
                    content = customService.convertBack($scope.containers, 'root'/*, styleSheets*/),
                    css = vm.css || '' /*+ vm.buildCss(styleSheets) || ''*/;
                frameData = angular.extend(frameData, {
                    "css": css || '',
                    "content": content
                });
                if (vm.canvas) frameData.canvas = vm.canvas;
                if (angular.isArray(vm.sources)) {
                    frameData.sources = frameData.sources || [];
                    if (JSON.stringify(vm.sources) !== JSON.stringify(frameData.sources)) {
                        reload = true;
                        frameData.sources = angular.copy(vm.sources);
                    }
                }
                if (vm.js && vm.js.trim()) {
                    frameData.js = vm.js.trim();
                }
                if (reload) {
                    console.log('Reloading preview');
                    angular.forEach(previewFrames, function (type) {
                        if (window.frames[type]) window.frames[type].location.reload(true);
                    });
                } else {
                    var frameDataStr = JSON.stringify(frameData);
                    if(frameDataStr===oldFrameData) return; // no refresh if there is no change
                    angular.forEach(previewFrames, function (type) {
                        if (window.frames[type]) window.frames[type].refreshPreview(frameData);
                    });
                    oldFrameData=frameDataStr;
                }
            };
        }

        function editorLayoutCtr(vm) {
            vm.initEditorLayout = snippets.debounce(initEditorLayout, 300);
            function initEditorLayout() {
                setTimeout(function () {
                    $(window).trigger('resize');
                }, 300);
                var layout = $('#editor-container').layout({
                    onopen: function (name, element) {
                        if (name === 'east') {
                            vm.previewPanel = true
                        }
                    },
                    onclose: function (name, element) {
                        if (name === 'east') {
                            vm.previewPanel = false
                        }
                    },
                    east__size: .40,
                    east__minSize: 400,
                    east__initClosed: true,
                    center__childOptions: {
                        center__childOptions: {
                            west__size: 130,
                            east__size: 280,
                            east__resizable: false,
                            west__resizable: false
                        },
                        south__size: .50,
                        south__initClosed: true,
                        south__childOptions: {
                            west__size: .33,
                            east__size: .33
                        }
                    }
                });
                vm.togglePane = function (pane) {
                    var paneArr = pane.split('.');
                    if (paneArr[1]) {
                        layout.children[paneArr[0]].layout1.toggle(paneArr[1]);
                    } else {
                        layout.toggle(pane);
                    }
                };
            }
        }

        function initDragula(vm, $scope, lv0src, lv1src, lv2src) {
            var dragula = new Dragula(lv0src, lv1src, lv2src, {
                scope: $scope,
                dragulaService: dragulaService,
                $timeout: $timeout
            }, {
                onDrop: function () {
                    vm.compile();
                }
            });

            $scope.initDragula = dragula.init.bind(dragula);
            return dragula;
        }

        function ctr(vm, $scope, dragula, type, data) {

            var typeName = type + 'Name',
                typeRef = type + 'Ref';

            if ($stateParams[type + 'Name']) {
                customService.convert(data.content, $scope['containers'], 3);
                vm.css = data.css || '';
                vm.canvas = data.canvas || {};
                vm.js = data.js;

                vm[typeName] = $state.params[typeName];
                $timeout(function () {
                    customService.convert(data.content, $scope['containers'], 3);
                }, 0);


                vm[typeRef] = $firebase.queryRef('pages?type=list').child($stateParams.id);
            } else {
                vm[typeRef] = $firebase.queryRef('pages?type=list').push();
            }

            vm.originalName = $state.params[typeName] || '';

            vm.compileContent = customService.compileTag;
            vm.isAttrsConfigurable = customService.isAttrsConfigurable;
            vm.isTagConfigurable = customService.isTagConfigurable;
            vm.layoutOptions = customService.layoutOptions;
            vm.ctrls = customService.ctrls;

            vm.actions = [['copy', 'GENERAL.COPY'], ['delete', 'GENERAL.DELETE']];
            vm.media = 'all';

            vm.setPreviewScale = function (scale) {
                vm.previewPanelStyle = {
                    "height": scale < 1 ? 100 / scale + '%' : '100%',
                    "width": scale < 1 ? 100 / scale + '%' : '100%',
                    "transform": "scale(" + scale + "," + scale + ")",
                    "transform-origin": "0 0"
                }
            };
            vm.showCssHtml = function () {
                vm.cssHtmlPanel = true;
                vm.layoutEditorStyle = {'height': '500px'};
            };
            vm.hideCssHtml = function () {
                vm.cssHtmlPanel = false;
                vm.layoutEditorStyle = {'height': '100%'/*,'padding-top':'50px'*/}
            };
            vm.hideCssHtml();


            vm.clearAll = function () {
                vm.selectedContainerId = '';
                vm.selectedItemIndex = '';
                $scope.containers = [];
                vm.item = {};
                customService.convert([], $scope['containers'], 3);
                vm.compile();
            };

            vm.copyItem = function (cid, index) {
                var copied = angular.copy($scope.containers[cid][index]);
                copied.cid = Math.random().toString();
                $scope.containers[cid].splice(index, 0, copied);
                $scope.containers[copied.cid] = [];
                vm.compile();
            };

            vm.deleteItem = function (cid, index) {
                vm.selectedContainerId = '';
                vm.selectedItemIndex = '';
                $scope.containers[cid].splice(index, 1);
                vm.item = {};
                vm.compile();
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


            vm.containerClass = {};
            vm.getContainerClass = function (container) {
                var itemLayout = container.layout || {},
                    inner = '',
                    outer = '',
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

                                if (key === 'layout-padding' || key === 'layout-margin') {
                                    outer += _property + _value;
                                    return;
                                }
                                break;
                        }
                        inner += _property + _value;
                    })
                });
                return {
                    inner: inner + (container.type === 'text' || container.type === 'widget' ? ' nodrop' : ''),
                    outer: outer + flex + display
                }
            };

            vm.import = function ($files, cid, index) {
                if ($files !== null && $files.length > 0) {
                    var file = $files[0],
                        reader = new FileReader();
                    //find file extension
                    var re = /(?:\.([^.]+))?$/,
                        m = re.exec(file.name || ''),
                        ext = m ? m[1] : '';

                    reader.onload = function () {
                        if (ext === 'html') {
                            var res = _core.util.loader.getExternalSourceFromHtml(reader.result),//all script, link tags are removed
                                body = getBody(res.html),
                                replace = function (val) {
                                    if (val.search(':') === -1 && val.search('#') === -1) {
                                        body = body.replace(val, 'fs-' + val);
                                    }
                                };

                            (getLocalFilesSrc(body) || []).forEach(replace);
                            (getLocalFilesHref(body) || []).forEach(replace);

                            vm.sources = res.sources;
                            var dom = $.parseHTML(body);
                            res.script.forEach(function (script) {
                                if (script.innerHTML) dom.push({nodeName: 'script', innerHTML: script.innerHTML})
                            });
                            importData({
                                id: file.name.split('.html')[0],
                                content: formatParsedHtml(dom, 1)
                            }, cid, index);
                        } else if (ext === 'json') {
                            importData(reader.result, cid, index);
                        }
                    };
                    reader.readAsText(file);
                }
            };

            vm.export = function () {
                // var styleSheets={};
                var content = customService.convertBack($scope.containers, 'root'/*, styleSheets*/),
                    css = vm.css || ''/* + buildCss(styleSheets) || ''*/,
                    data = angular.extend({}, {
                        canvas: vm.canvas || {},
                        id: vm[typeName],
                        content: content,
                        css: css
                    });
                snippets.saveData(data, vm[typeName] + '.json')
            };

            function getLocalFilesSrc(html) {
                var localFilesSrcRegEx = /src[\s\S]*?=[\s\S]*?['"](?:[^']|[^"])*?['"][\s\S]*?/gm;
                return html.match(localFilesSrcRegEx);
            }

            function getLocalFilesHref(html) {
                var localFilesHrefRegEx = /href[\s\S]*?=[\s\S]*?['"](?:[^']|[^"])*?['"][\s\S]*?/gm;
                return html.match(localFilesHrefRegEx);
            }


            function importData(data, cid, index) {
                var isFromHTML = !angular.isString(data),
                    result = isFromHTML ? data : JSON.parse(data);
                $timeout(function () {
                    if (cid !== undefined && index !== undefined) {
                        vm.selectedContainerId = cid;
                        vm.selectedItemIndex = index;
                        result.content = customService.compile(result.content);
                        vm.item = angular.extend({}, result, result.canvas || {}, {type: 'part', cid: vm.item.cid});
                        $scope.containers[vm.item.cid] = [];
                        vm.updateItem();
                    } else {
                        // var styleSheets={};
                        var content = customService.convertBack($scope.containers, 'root'/*, styleSheets*/) || [],
                            css = vm.css || ''/* + buildCss(styleSheets) || ''*/;

                        customService.convert(content.concat(result.content || []), $scope['containers'], 3);
                        vm.css = css + ' ' + (result.css || '');
                        if (!vm.canvas) vm.canvas = result.canvas || {};
                        vm.compile();
                    }
                }, 0)
            }


            function getBody(rawHtml) {
                var body = /<body.*?>([\s\S]*)<\/body>/.exec(rawHtml.replace(/(\r\n|\n|\r)/gm, "")) || [];
                return body[1] !== undefined ? body[1] : rawHtml;
            }

            function factorAttr(attrArr) {
                var res = {},
                    attrString = '';
                angular.forEach(attrArr || {}, function (attr) {
                    if (attr.name === 'class' || attr.name === 'style') return;
                    attrString += attr.value ? attr.name + '="' + attr.value + '" ' : attr.name + ' ';
                });
                if (attrString) res.attrs = attrString;
                return res;
            }

            function formatParsedHtml(dom, level) {

                var res = [];
                if (dom === null) return;
                for (var i = 0; i < dom.length; i++) {
                    var rawChild = dom[i],
                        child = {},
                        id = rawChild.id,
                        style = (rawChild.style || {}).cssText,
                        nodeName = rawChild.nodeName.toLowerCase();

                    switch (nodeName) {
                        case '#text':
                            child.type = 'text';
                            child.content = rawChild.textContent || rawChild.data || '';
                            if (!child.content.match(/^\s*$/)) res.push(child);
                            break;
                        case '#comment':
                            break;
                        case 'meta':
                            break;
                        default:
                            child.type = 'tag';
                            if (style) child.style = style;
                            child.tag = nodeName;
                            if (id) child.id = id;
                            if (rawChild.className) child.class = rawChild.className;
                            angular.extend(child, factorAttr(rawChild.attributes));
                            if (rawChild.childNodes) {
                                if (level < 3) {
                                    child.content = '<!--include-->';
                                    child.divs = formatParsedHtml(rawChild.childNodes, level + 1);
                                } else {
                                    child.content = rawChild.innerHTML;
                                }
                            } else if (rawChild.innerHTML) {
                                child.content = rawChild.innerHTML;
                            }
                            res.push(child);
                            break
                    }
                }
                return res;
            }

            vm.editItem = function (cid, index) {
                // vm.item = {};
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
                if (!vm.selectedContainerId) return;
                if (vm.selectedContainerId === 'canvas') {
                    console.log(vm.item);
                    vm.canvas = vm.item;
                } else {
                    $scope.containers[vm.selectedContainerId][vm.selectedItemIndex] = vm.item;
                }
                vm.compile();
            };

            vm.beautify = function (type) {
                $ocLazyLoad.load(['app/lazyload/beautify/beautify-' + type + '.min.js']).then(function () {
                    var content = type === 'html' ? vm.item.content : vm[type];
                    var res = window[type + '_beautify'](content);
                    if (type === 'html') {
                        vm.item.content = res;
                    } else {
                        vm[type] = res;
                    }
                    $timeout(angular.noop, 0);
                })
            };

            vm.debouncedUpdateItem = snippets.debounce(vm.updateItem, 1000);

            // vm.injectCss = function () {
            //     injectCSS.setDirectly(vm[type + 'Ref'].key, vm.css+ (vm.partsCss || ''));
            //     var dereg = $rootScope.$on('$stateChangeStart',
            //         function () {
            //             injectCSS.remove(vm[type + 'Ref'].key);
            //             dereg();
            //         });
            // };

            // function buildCss(styleSheets) {
            //     var partsCss = '';
            //     angular.forEach(styleSheets, function (partCss) {
            //         if (vm.pageCss.indexOf(partCss) === -1) {
            //             partsCss += partCss
            //         }
            //     });
            //     return partsCss;
            // }
            // vm.buildCss = buildCss;

            vm.compile = function () {
                if (!vm.previewPanel && !vm.fullPagePreview) return;
                if (vm.refreshPreview) {
                    vm.refreshPreview();
                    $timeout(angular.noop, 0)
                }
            };


            vm.update = function (saveAs) {
                if (saveAs) vm[typeName] = saveAs;
                var name = vm[typeName],
                    // styleSheets = {},
                    content = customService.convertBack($scope.containers, 'root'/*, styleSheets*/),
                    css = vm.css || ''/* + buildCss(styleSheets) || ''*/;

                var id = vm[typeRef].key,
                    upload = function () {
                        var data = {
                            "css": css || '',
                            "content": content
                        };
                        if (vm.js && vm.js.trim()) {
                            data.js = vm.js.trim();
                        }
                        if (vm.canvas) data.canvas = vm.canvas;
                        if (angular.isArray(vm.sources)) data.sources = vm.sources;
                        // $firebase.update([type + '?type=list&id=' + id, type + '?type=detail&id=' + vm[typeName]], {
                        //     "name": vm[typeName],
                        //     "editBy": $auth.currentUser.uid || null,
                        //     "compressed@1": _core.encoding.compress(data),
                        //     "editTime@0": firebase.database.ServerValue.TIMESTAMP
                        // });
                        $firebase.queryRef(type + '?type=list&id=' + id).update({
                            "name": name,
                            "editBy": $auth.currentUser.uid || null,
                            "editTime": firebase.database.ServerValue.TIMESTAMP
                        });
                        $firebase.queryRef(type + '?type=list&id=' + id).child('author').transaction(function (author) {
                            return author ? undefined : ($auth.currentUser.uid || null)
                        });

                        $firebaseStorage.update(type + '?type=detail&id=' + name, data).then(function () {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Saved!')
                                    .hideDelay(3000)
                            );
                        });
                    };
                if (vm.originalName && vm.originalName !== name && !saveAs) {
                    vm[typeRef].parent.orderByChild('name').equalTo(name).limitToFirst(1).once('value', function (snap) {
                        snap.forEach(function (child) {
                            child.ref.remove();
                            vm[typeRef].parent.parent.child('detail').child(vm.originalName).remove();
                            upload();
                        });
                    });
                    $firebaseStorage.remove(type + '?type=detail&id=' + vm.originalName);
                } else {
                    upload();
                }

                vm.originalName = name;
            };

            vm.undo = function () {
                dragula.undo();
                vm.compile();
            };
            vm.redo = function () {
                dragula.redo();
                vm.compile();
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
                        case 'setWidget':
                            if (!vm.widget[cid + index]) return;
                            var widget = _core.encoding.decompress(vm.widget[cid + index]);
                            widget.cid = $scope.containers[cid][index].cid;
                            $scope.containers[cid][index] = widget;
                            break;
                    }
                };
            } else if (type === 'widget') {
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
            }
        }

        return {
            ctr: ctr,
            initDragula:initDragula,
            previewCtr: previewCtr,
            editorLayoutCtr: editorLayoutCtr
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
