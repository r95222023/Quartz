(function() {
    'use strict';

    angular
        .module('quartz.directives')
        .directive('customItem', customItem);

    /* @ngInject */
    function customItem($compile) {
        var linker = function(scope, element, attrs) {
            scope.$watch('content', function () {
                if(angular.isString(scope.content)) {
                    //element.replaceWith($compile(scope.content)(scope));
                    if(attrs.modelAs) scope[attrs.modelAs] = scope.model;
                    element.html(scope.content).show();
                    var _scope=scope;
                    if(scope.scope) _scope=scope.scope;
                    $compile(element.contents())(_scope);
                }
            });
        };

        return {
            restrict: "E",
            link: linker,
            scope: {
                content:'=',
                model:'=',
                scope:'='
            }
        };
    }

})();
