(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('customService', CustomService);

    /* @ngInject */
    function CustomService($q, $http, $templateCache) {
        var increment5 = [0, 5, 10, 15, 20, 25, 30, 33, 35, 40, 45, 50, 55, 60, 65, 66, 70, 75, 80, 85, 90, 95, 100],
            layoutOptions = {
                "breakpoints": ['all', 'xs', 'gt-xs', 'sm', 'gt-sm', 'md', 'gt-md', 'lg', 'gt-lg', 'xl'],
                "layout": {
                    "flex": increment5,
                    "flex-offset": increment5,
                    "layout": ['row', 'column'],
                    "layout-align": {
                        x: ['start', 'center', 'end', 'space-around', 'space-between'],
                        y: ['start', 'center', 'end', 'stretch']
                    }
                }
            };

        var items = [
                {type: 'button'},
                {type: 'custom', content: '<div></div>'}
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
                    widgets: [],
                    content: '<div><!--include--></div>'
                }
            ];
        var templates = {
            "row": "<div customlayout><!--include--></div>",
            "column": "<div customlayout><!--include--></div>"
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
            var promise=$q.all(promises);
            promise.then(function (res) {
                angular.extend(templates, res);
            });
            return promise;
        }

        var configs = {
            row: []
        };

        function convert(val, target, maxLevel, level) {
            var _level = level || 1,
                res = [];
            angular.forEach(val, function (item) {
                var _item = {};
                _item.id = Math.random().toString();
                _item.options = item.options;
                _item.layout = item.layout;
                _item.name = item.name;
                _item.type = item.type;
                _item.content = item.content;
                if(item.css) _item.css=item.css;
                res.push(_item);
                if (_level < maxLevel) {
                    target[_item.id] = convert(item.divs || [], target, maxLevel, _level + 1);
                }
            });
            if (_level === 1) target['root'] = res;
            return res
        }

        function convertBack(val, id, styleSheets) {
            var result = [],
                _id = id || 'root';

            angular.forEach(val[_id], function (item) {
                var _item = {};
                if(item.css&&styleSheets&&item.name) styleSheets[item.name] = item.css;
                _item.options = item.options || null;
                _item.name = item.name || null;
                _item.type = item.type;
                _item.layout = item.layout || null;
                _item.content = item.content || null;
                if (item.id) _item.divs = convertBack(val, item.id, styleSheets);
                result.push(_item);
            });
            return result;
        }

        //the followings only work properly after getAllTemplates() is resolved, remember to add resolve property of this on the state config file.
        function getHtmlContent(item) {
            item = item || {};
            var content;

            if (item.type === 'customWidget') {
                content = compile(item.content);
            } else if (item.content) {
                content = item.content;
            } else if (item.type && templates[item.type]) {
                content = templates[item.type];
            } else {
                content = '';
            }

            if (item.layout) {
                var res = '';
                angular.forEach(item.layout, function (layout, breakpoint) {
                    var _breakpoint = breakpoint === 'all' ? '' : '-' + breakpoint;
                    angular.forEach(layout, function (value, key) {
                        var _value = '="' + value + '" ',
                            _property = key + _breakpoint;
                        switch (key) {
                            case 'flex':
                                break;
                            case 'flex-offset':
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
                content = content.replace('customlayout', res);
            }
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

        return {
            layoutOptions: layoutOptions,
            convert: convert,
            convertBack: convertBack,
            compile: compile,
            getHtmlContent: getHtmlContent,
            getAllTemplates: getAllTemplates,
            containers: containers,
            items: items
        }
    }
})();
