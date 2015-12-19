(function() {
    'use strict';

    angular
        .module('app.examples.ui')
        .controller('MaterialIconsController', MaterialIconsController);

    /* @ngInject */
    function MaterialIconsController($mdDialog, $document, icons) {
        var vm = this;
        vm.groups = [];
        vm.icons = [];
        vm.iconSource = 'Select icon below to see HTML';
        vm.selectIcon = selectIcon;
        vm.icons = icons.data;

        function selectIcon($event, className) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element($document.body))
                .title('Here\'s the code for that icon')
                .content('<div hljs language="html"><md-icon md-font-icon="' + className + '"></md-icon></div>')
                .ok('Thanks')
                .targetEvent($event)
            );
        }
    }
})();