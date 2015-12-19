(function() {
    'use strict';

    angular
        .module('app.examples.ui')
        .controller('FaIconsController', FaIconsController);

    /* @ngInject */
    function FaIconsController($mdDialog, $document, icons) {
        var vm = this;
        vm.icons = loadIcons();
        vm.iconSource = 'Select icon below to see HTML';
        vm.selectIcon = selectIcon;

        function loadIcons() {
            var allIcons = [];
            for(var className in icons.data) {
                allIcons.push({
                    className: className,
                    name: icons.data[className]
                });
            }
            return allIcons;
        }

        function selectIcon($event, icon) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element($document.body))
                .title('Here\'s the code for that icon')
                .htmlContent('<div hljs language="html"><md-icon md-font-icon="'+ icon.className +'"></md-icon></div>')
                .ok('Thanks')
                .targetEvent($event)
            );
        }
    }
})();
