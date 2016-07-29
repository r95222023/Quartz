(function () {
    'use strict';

    angular
        .module('app.parts.design')
        .factory('siteDesign', SiteDesign);

    /* @ngInject */
    function SiteDesign($firebase, $stateParams, $firebaseStorage, $rootScope, $state, $mdToast, injectCSS, customService, lzString, snippets, $timeout) {
        function ctr(vm, $scope, dragula, type) {

            var listRefUrl = type + 's/list@selectedSite',
                typeName = type + 'Name',
                typeRef = type + 'Ref';

            if ($stateParams[type + 'Name']) {
                $firebaseStorage.getWithCache(type + 's/detail/' + $stateParams[typeName] + '@selectedSite').then(function (val) {
                    console.log(val.content)
                    customService.convert(val.content, $scope['containers'], 3);
                    vm[typeName] = val.css || '';
                    vm.canvas = val.canvas || {};
                    vm[typeName] = $state.params[typeName];
                    // $timeout(function(){
                    //     customService.convert(val.content, $scope['containers'], 3);
                    //     vm.pageCss = val.css || '';
                    // },0);
                    vm.compile();
                });
                vm[typeRef] = $firebase.ref(listRefUrl).child($stateParams.id);
            } else {
                vm[typeRef] = $firebase.ref(listRefUrl).push();
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
                    "width": scale < 1 ? 100 / scale + '%' : '100%',
                    "transform": "scale(" + scale + "," + scale + ")",
                    "transform-origin": "0 0"
                }
            };
            vm.showCssHtml = function () {
                vm.cssHtmlPanel = true;
                vm.layoutEditorStyle = {'height': '500px', 'padding-top': '0'};
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


            vm.getContainerClass = function (container) {
                var itemLayout = container.layout || {},
                    inner = '',
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
                return {inner: inner + (container.type === 'text'||container.type==='part' ? ' nodrop' : ''), outer: flex + display}
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
                            importData({id:file.name.split('.html')[0],content: formatParsedHtml($.parseHTML(getBody(reader.result)), 1)}, cid, index);
                        } else if (ext === 'json') {
                            importData(reader.result, cid, index);
                        }
                    };
                    reader.readAsText(file);
                }
            };

            function importData(data, cid, index) {
                var isFromHTML=!angular.isString(data),
                    result = isFromHTML ? data:JSON.parse(data);
                $timeout(function () {
                    if(cid!==undefined&&index!==undefined){
                        vm.selectedContainerId = cid;
                        vm.selectedItemIndex = index;
                        result.content = customService.compile(result.content);
                        vm.item = angular.extend({}, result, {type: 'part', cid:vm.item.cid});
                        $scope.containers[vm.item.cid]=[];
                        vm.updateItem();
                    } else {
                        var styleSheets = {},
                            content = customService.convertBack($scope.containers, 'root', styleSheets) || [],
                            css = vm.css || '' + vm.buildCss(styleSheets) || '';

                        customService.convert(content.concat(result.content || []), $scope['containers'], 3);
                        vm.css = css + ' ' + (result.css || '');
                        vm.compile();
                    }
                }, 0)
            }



            function getBody(rawHtml) {
                var body = /<body.*?>([\s\S]*)<\/body>/.exec(rawHtml.replace(/(\r\n|\n|\r)/gm, "")) || [];
                return body[1] || rawHtml;
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
                            res.push(child);
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

            vm.debouncedUpdateItem = snippets.debounce(vm.updateItem, 1000);

            vm.injectCss = function () {
                injectCSS.setDirectly(vm[type + 'Ref'].key, vm.css+ (vm.partsCss || ''));
                var dereg = $rootScope.$on('$stateChangeStart',
                    function () {
                        injectCSS.remove(vm[type + 'Ref'].key);
                        dereg();
                    });
            };

            vm.compile = function () {
                if (!vm.previewPanel&&!vm.fullPagePreview) return;
                var styleSheets = {};
                var compiled = customService.compileAll(customService.convertBack($scope.containers, 'root', styleSheets), vm.canvas);

                vm.partsCss = vm.buildCss(styleSheets);
                vm.injectCss();
                $timeout(function () {
                    vm.html = compiled
                }, 0)
            };

            vm.buildCss = function (styleSheets) {
                var partsCss = '';
                angular.forEach(styleSheets, function (partCss) {
                    if (vm.pageCss.indexOf(partCss) === -1) {
                        partsCss += partCss
                    }
                });
                return partsCss;
            };

            vm.update = function () {
                var styleSheets = {},
                    content = customService.convertBack($scope.containers, 'root', styleSheets),
                    css = vm.css || '' + vm.buildCss(styleSheets) || '';

                var id = vm[typeRef].key,
                    upload = function () {
                        var data = {
                            "css": css || '',
                            "content": content
                        };
                        if(vm.canvas) data.canvas=vm.canvas;
                        $firebase.update(type + 's@selectedSite', ['list/' + id, 'detail/' + vm[typeName]], {
                            "name": vm[typeName],
                            "author": $firebase.params["$uid"] || null,
                            "compressed@1": lzString.compress(data),
                            "editTime@0": firebase.database.ServerValue.TIMESTAMP
                        });

                        $firebaseStorage.update(type + 's/detail/' + vm[typeName] + '@selectedSite', data).then(function () {
                            console.log('saved')
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Saved!')
                                    .hideDelay(3000)
                            );
                        });
                    };

                if (vm.originalName && vm.originalName !== vm[typeName]) {
                    vm.pageRef.parent.orderByChild('name').equalTo(vm.pageName).limitToFirst(1).once('value', function (snap) {
                        snap.forEach(function (child) {
                            child.ref.remove();
                            vm.pageRef.parent.parent.child('detail').child(vm.originalName).remove();
                        });
                        upload();
                    });
                    $firebaseStorage.remove(type + 's/detail/' + vm.originalName + '@selectedSite');
                    vm.originalName = angular.copy(vm.pageName);
                } else {
                    upload();
                }
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
                            var widget = lzString.decompress(vm.widget[cid + index]);
                            widget.cid = $scope.containers[cid][index].cid;
                            $scope.containers[cid][index] = widget;
                            break;
                    }
                };

                vm.export = function () {
                    var styleSheets = {},
                        content = customService.convertBack($scope.containers, 'root', styleSheets),
                        css = vm.css || '' + vm.buildCss(styleSheets) || '',
                        data=angular.extend({},vm.canvas||{},{id:vm[typeName], content:content,css:css});
                    snippets.saveData(data, vm[typeName] + '.json')
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
            ctr: ctr
        }
    }
})();
