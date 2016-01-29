(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('SearchTestController', SearchTestController);

    /* @ngInject */
    function SearchTestController($elasticSearch, $q, $scope, dragulaService, $timeout, $firebase, $rootScope, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        dragulaService.options($scope, 'drag-container', {
            moves: function (el, container, handle) {
                return !handle.classList.contains('dragable-widget');
            }
        });
        var template = {
            row: '<div layout="row"><!--include--></div>',
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
        var source = [{name: 'button', type: 'button'}, {name: 'card', type: 'card'}];

        var rowSource = [{
            type: 'row',
            widgets: []
        }];


        function getSource(source) {
            return angular.copy(source);
        }

        $scope.source = getSource(source);
        $scope.rowSource = getSource(rowSource);

        $scope.$on('drag-row-container.drop-model', function (e, el) {
            $scope.source = getSource(source);
        });

        $scope.$on('drag-container.drop-model', function (e, el) {
            $scope.rowSource = getSource(rowSource);
        });

        $scope.targets = [
            {
                type: 'row',
                widgets: []
            }
        ];

        function getHtmlContent(item) {
            //todo: build content from template and item.options
            return item.content || (item.type && template[item.type] ? template[item.type] : '')
        }

        vm.getHtmlContent = getHtmlContent;

        vm.compile = function (rows) {
            var html = '';
            angular.forEach(rows, function (row) {
                var rowContent = getHtmlContent(row),
                    include = '';
                angular.forEach(row.widgets, function (widget) {
                    include += getHtmlContent(widget);
                });
                html += rowContent.replace('<!--include-->', include);
            });
            vm.html = html;
        }
    }
})();
