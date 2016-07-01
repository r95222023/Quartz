(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('customService', CustomService)
        .factory('customData', CustomData);

    /* @ngInject */
    function CustomService($q, $http, $templateCache) {
        var increment5 = [null, 0, 5, 10, 15, 20, 25, 30, 33, 35, 40, 45, 50, 55, 60, 65, 66, 70, 75, 80, 85, 90, 95, 100],
            flex = ['flex'].concat(increment5),
            layoutOptions = {
                "breakpoints": ['all', 'xs', 'gt-xs', 'sm', 'gt-sm', 'md', 'gt-md', 'lg', 'gt-lg', 'xl'],
                "layout": {
                    "flex": flex,
                    "flex-offset": increment5,
                    "layout": [null, 'row', 'column'],
                    "layout-align": {
                        x: [null, 'start', 'center', 'end', 'space-around', 'space-between'],
                        y: [null, 'start', 'center', 'end', 'stretch']
                    }
                }
            },
            ctrls = [[''],['DefaultToolbarController'],['ArticleDetailController'],['ArticleListController'],['ProductDetailController'],['ProductListController']];

        var items = [
                {type: 'custom', content: '<!--include-->'}
            ],
            containers = [
                {
                    type: 'row',
                    layout: {
                        all: {
                            layout: 'row'
                        }
                    },
                    divs: []
                },
                {
                    type: 'column',
                    layout: {
                        all: {
                            layout: 'column'
                        }
                    },
                    divs: []
                },
                {
                    type: 'custom',
                    content: '<!--include-->'
                }
            ];
        var templates = {
            "row": "<!--include-->",
            "column": "<!--include-->"
        };


        function getTemplate(url) {
            var def = $q.defer(),
                tmpl = $templateCache.get(url);
            if (tmpl) {
                def.resolve(tmpl);
            } else {
                $http.get(url).then(function (res) {
                    if (res.data) {
                        def.resolve(res.data);
                    } else {
                        def.reject({url: url, message: 'request failed'});
                    }
                });
            }
            return def.promise;
        }

        function getAllTemplates(templateList, tmplRoot) {
            var promises = {};
            angular.forEach(templateList, function (tmplName) {
                promises[tmplName] = getTemplate(tmplRoot + tmplName + '.html');
            });
            var promise = $q.all(promises);
            promise.then(function (res) {
                angular.extend(templates, res);
            });
            return promise;
        }

        var properties = ['options', 'id', 'name', 'type', 'tag', 'layout', 'class', 'style', 'attrs', 'content', 'ctrl','ctrlAs'];
        function convert(val, target, maxLevel, level) {
            var _level = level || 1,
                res = [];
            angular.forEach(val, function (item) {
                var _item = {};
                _item.cid = Math.random().toString();
                angular.forEach(properties, function (property) {
                    _item[property] = item[property];
                });
                if (item.css) _item.css = item.css;
                res.push(_item);
                if (_level < maxLevel) {
                    target[_item.cid] = convert(item.divs || [], target, maxLevel, _level + 1);
                }
            });
            if (_level === 1) target['root'] = res;
            return res
        }

        function convertBack(val, cid, styleSheets) {
            var result = [],
                _cid = cid || 'root';

            angular.forEach(val[_cid], function (item) {
                var _item = {};
                if (item.css && styleSheets && item.name) styleSheets[item.name] = item.css;
                angular.forEach(properties, function (property) {
                    if(item[property]) _item[property] = item[property];
                });
                if (item.cid) _item.divs = convertBack(val, item.cid, styleSheets);
                result.push(_item);
            });
            return result;
        }
        
        //the followings only work properly after getAllTemplates() is resolved, remember to add resolve property of this on the state config file.
        function getHtmlContent(item) {
            item = item || {};
            var content,
                tag = item.tag || 'div',
                singleton = false;

            if (item.type === 'customWidget') {
                content = compile(item.content);
            } else if (item.content) {
                content = item.content;
            } else if (item.type && templates[item.type]) {
                content = templates[item.type];
            } else {
                content = '';
            }

            var res = '';
            if (item.id) {
                res += 'id="' + item.id + '" '
            }
            if (item.layout) {
                angular.forEach(item.layout, function (layout, breakpoint) {
                    var _breakpoint = breakpoint === 'all' ? '' : '-' + breakpoint;
                    angular.forEach(layout, function (value, key) {
                        if (value === null) return;
                        var _value = '="' + value + '" ',
                            _property = key + _breakpoint;
                        switch (key) {
                            case 'flex':
                                if (value === 'flex') _value = ' ';
                                break;
                            case 'flex-offset':
                                break;
                            case 'flex-order':
                                break;
                            case 'layout':
                                break;
                            case 'layout-align':
                                _value = '="' + value.x + ' ' + value.y + '" ';
                                break;
                            default:
                                _property = value ? _property + ' ' : '';
                                _value = ''; //ex layout-fill:true will get layout-fill
                                break;
                        }
                        res += _property + _value;
                    })
                });
            }

            if (item.class) {
                res += ' class="' + item.class + '"';
            }
            if (item.style) {
                res += ' style="' + item.style + '"';
            }
            if (item.attrs) {
                res += ' ' + item.attrs;
            }
            if (item.ctrl){
                res += ' ng-controller="'+ item.ctrl+' as '+(item.ctrlAs||'vm')+'"';
            }

            if(tag.search('/')!==-1) singleton = true;
            content = "<--tag-- --custom-->"+(singleton? "":content+"<--endtag-->");
            content = content.replace('--custom--', res);
            content = content.replace('--tag--', tag);
            content = content.replace('--endtag--', '/' + tag);

            return content
        }


        function compile(containers) {
            var html = '';
            angular.forEach(containers, function (container) {
                var rawContainer = getHtmlContent(container),
                    subContainerHtml = '';
                angular.forEach(container.divs, function (subContainer) {
                    var rawSubContainer = getHtmlContent(subContainer),
                        widgets = '';
                    angular.forEach(subContainer.divs, function (widget) {
                        widgets += getHtmlContent(widget);
                    });
                    subContainerHtml += rawSubContainer.replace('<!--include-->', widgets);
                });
                html += rawContainer.replace('<!--include-->', subContainerHtml)
            });
            return html;
        }

        function isAttrsConfigurable(html) {
            return html.search('!--custom--') !== -1;
        }

        function isTagConfigurable(html) {
            return html.search('!--tag--') !== -1 && html.search('!--endtag--') !== -1;
        }

        return {
            layoutOptions: layoutOptions,
            ctrls:ctrls,
            convert: convert,
            convertBack: convertBack,
            compile: compile,
            getHtmlContent: getHtmlContent,
            getAllTemplates: getAllTemplates,
            isAttrsConfigurable: isAttrsConfigurable,
            isTagConfigurable: isTagConfigurable,
            containers: containers,
            items: items
        }
    }

    /* @ngInject */
    function CustomData($q, $firebase, $firebaseStorage, lzString) {

        function get(name) {
            var def = $q.defer();

            $firebaseStorage.getWithCache('config/data/lists@selectedSite').then(function(val){
                def.resolve(val[name]);
            });
            return def.promise;
        }

        return {
            get: get
        }
    }
})();
