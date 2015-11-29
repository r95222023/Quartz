(function() {
    'use strict';

    angular
        .module('quartz.components')
        .directive('qtMenu', qtMenuDirective);

    /* @ngInject */
    function qtMenuDirective($location, $mdTheming, qtTheming) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            restrict: 'E',
            template: '<md-content><qt-menu-item ng-repeat="item in qtMenuController.menu | orderBy:\'priority\'" item="::item"></qt-menu-item></md-content>',
            scope: {},
            controller: qtMenuController,
            controllerAs: 'qtMenuController',
            link: link
        };
        return directive;

        function link($scope, $element) {
            $mdTheming($element);
            var $mdTheme = $element.controller('mdTheme'); //eslint-disable-line

            var menuColor = qtTheming.getThemeHue($mdTheme.$mdTheme, 'primary', 'default');
            var menuColorRGBA = qtTheming.rgba(menuColor.value);
            $element.parent().css({ 'background-color': menuColorRGBA });
            $element.children('md-content').css({ 'background-color': menuColorRGBA });
        }
    }

    /* @ngInject */
    function qtMenuController(qtMenu) {
        var qtMenuController = this;
        // get the menu and order it
        qtMenuController.menu = qtMenu.menu;
    }
})();
