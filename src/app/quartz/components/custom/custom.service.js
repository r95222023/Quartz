(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('customService', CustomService);

    /* @ngInject */
    function CustomService() {
        var increment5 = [5, 10, 15, 20, 25, 30, 33, 35, 40, 45, 50, 55, 60, 65, 66, 70, 75, 80, 85, 90, 95, 100],
            torf = [true, false];
        var options = {
            "breakpoints": ['-xs', '-gt-xs', '-sm', '-gt-sm', '-md', '-gt-md', '-lg', '-gt-lg', '-xl'],
            "layout": {
                "flex": increment5,
                "flex-offset": increment5,
                "layout": ['row', 'column'],
                "layout-align": {
                    horizontal: ['start', 'center', 'end', 'space-around', 'space-between'],
                    vertical: ['start', 'center', 'end', 'stretch']
                },
                "layout-fill": torf,
                "layout-wrap": torf,
                "layout-nowrap": torf,
                "layout-margin": torf,
                "layout-padding": torf,
                "show": torf,
                "hide": torf
            }
        };

        var items = [
                {type: 'button'},
                {type: 'card', options: {flex: '50'}},
                {type: 'custom', content: '<div></div>'}
            ],
            containers = [
                {
                    type: 'row',
                    options: {
                        layout: 'row'
                    },
                    widgets: []
                },
                {
                    type: 'column',
                    options: {
                        layout: 'column'
                    },
                    widgets: []
                },
                {
                    type: 'custom',
                    widgets: [],
                    content: '<div><!--include--></div>'
                }
            ];

        var templates = {
            row: '<div layout="row"><!--include--></div>',
            column: '<div layout="column"><!--include--></div>',
            card: '<md-card flex="50">' +
            '<img src="assets/images/backgrounds/material-backgrounds/mb-bg-03.jpg" alt="Card Image">     ' +
            '       <md-card-content>         ' +
            '   <div class="content-padded">          ' +
            '  <h2 class="md-title">Card Title</h2>      ' +
            '  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis, distinctio minus nostrum aut magni ipsam, eius ipsa eos voluptate natus excepturi qui numquam velit non explicabo molestias quasi sunt veniam.</p>       ' +
            ' </div> <md-divider></md-divider> ' +
            '<div class="button-toolbar" layout="row" layout-align="start center"> ' +
            '<md-button class="md-accent">Share</md-button>' +
            ' <md-button class="md-primary">Explore</md-button> ' +
            '</div> ' +
            '</md-card-content>' +
            ' </md-card>',
            button: '<md-button>from template</md-button>'
        };

        var configs = {
            row: []
        };

        function getHtmlContent(item) {
            //todo: build content from template and item.options
            //console.log(item)
            item = item || {};
            return item.content || (item.type && templates[item.type] ? templates[item.type] : '')
        }


        function compile(rows) {
            var html = '';
            angular.forEach(rows, function (row) {
                var rowContent = getHtmlContent(row),
                    include = '';
                angular.forEach(row.widgets, function (widget) {
                    include += getHtmlContent(widget);
                });
                html += rowContent.replace('<!--include-->', include);
            });
            return html;
        }

        return {
            options: options,
            compile: compile,
            getHtmlContent: getHtmlContent,
            containers: containers,
            items: items
        }
    }
})();
