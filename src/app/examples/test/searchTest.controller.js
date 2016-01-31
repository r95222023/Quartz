(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('SearchTestController', SearchTestController);

    /* @ngInject */
    function SearchTestController($elasticSearch, $q, customService, $scope, dragulaService, $timeout, $firebase, $rootScope, qtNotificationsService, Auth, $state, $mdSidenav, config) {
        var vm = this;
        dragulaService.options($scope, 'drag-container', {
            moves: function (el, container, handle) {
                return !handle.classList.contains('dragable-widget');
            }
        });

        var source = customService.items,
            rowSource = customService.containers;


        function getSource(source) {
            return angular.copy(source);
        }

        $scope.source = getSource(source);
        $scope.rowSource = getSource(rowSource);
        $scope.targets = [
            {
                type: 'row',
                widgets: []
            }
        ];

        $scope.$on('drag-row-container.drop-model', function (e, el) {
            $scope.source = getSource(source);
        });

        $scope.$on('drag-container.drop-model', function (e, el) {
            $scope.rowSource = getSource(rowSource);
        });


        vm.editItem = function (rowIndex, itemIndex) {
            $mdSidenav('editCustomItem').open();
            vm.item = itemIndex !== undefined ? $scope.targets[rowIndex].widgets[itemIndex] : $scope.targets[rowIndex];
            console.log(rowIndex, itemIndex)
        };

        vm.compile = function (targets) {
            vm.html = customService.compile(targets)
        };

        vm.toggleEditor = function () {
            $mdSidenav('editCustomItem').toggle();
        };
    }
})();
