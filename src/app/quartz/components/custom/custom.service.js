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
                {type: 'card', layout: {all: {flex: '50'}}},
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
                    widgets: []
                },
                {
                    type: 'column',
                    layout: {
                        all: {
                            layout: 'column'
                        }
                    },
                    widgets: []
                },
                {
                    type: 'custom',
                    widgets: [],
                    content: '<div><!--include--></div>'
                }
            ];
        var templates={
            "row":"<div customlayout><!--include--></div>",
            "column":"<div customlayout><!--include--></div>"
        };

        var tmplRoot = 'app/quartz/components/custom/templates/',
            templateList = ['card', 'button'],
            tmplPromise = getAllTemplates();

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

        function getAllTemplates(){
            var promises={};
            angular.forEach(templateList, function (tmplName) {
                promises[tmplName] = getTemplate(tmplRoot+tmplName+'.html');
            });
            return $q.all(promises);
        }


        tmplPromise.then(function(res){
            angular.extend(templates,res);
        });

        var configs = {
            row: []
        };

        //the followings only work properly after getAllTemplates() is resolved, remember to add resolve property of this on the state config file.
        function getHtmlContent(item) {
            item = item || {};
            var content = item.content || (item.type && templates[item.type] ? templates[item.type] : '');
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
                var rowContent = getHtmlContent(container),
                    include = '';
                angular.forEach(container.widgets, function (widget) {
                    include += getHtmlContent(widget);
                });
                html += rowContent.replace('<!--include-->', include);
            });
            return html;
        }

        return {
            layoutOptions: layoutOptions,
            compile: compile,
            getHtmlContent: getHtmlContent,
            getAllTemplates:getAllTemplates,
            containers: containers,
            items: items
        }
    }
})();
