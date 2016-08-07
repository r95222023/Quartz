(function () {
    'use strict';

    angular
        .module('quartz.directives')
        .directive('customItem', customItem);

    /* @ngInject */
    function customCtrl($scope,$attrs,$controller){
        if ($attrs.apiCtrl) {
            $controller($attrs.apiCtrl, {"$scope": $scope});
        }
    }

    /* @ngInject */
    function customItem($compile, $injector) {
        var linker = function (scope, element, attrs, ctrl) {
            var _ctrl = angular.copy(ctrl),
                status;

            function compile() {
                if(status==='compiling'||!scope.content) return;
                status='compiling';
                angular.forEach(ctrl, function(val, key){
                    delete ctrl[key];
                });
                angular.forEach(_ctrl, function(val, key){
                    ctrl[key]=val;
                });
                if (angular.isString(scope.content)) {
                    if (attrs.modelAs) scope[attrs.modelAs] = scope.model;
                    element.html(scope.content).show();
                    if (scope.customJs) {
                        var js, customJs = scope.customJs;
                        try {
                            eval("js =" + customJs);
                            if (angular.isFunction(js) || (angular.isArray(js) && angular.isFunction(js[js.length]))) {
                                $injector.invoke(js, ctrl, {"$scope": scope});
                            }
                        } catch (e) {
                            try {
                                eval(customJs);
                            } catch (e) {
                            }
                        }
                    }

                    $compile(element.contents())(scope);
                }
                var timeout=setTimeout(function(){
                    status='';
                    clearTimeout(timeout);
                },1000)
            }

            scope.$watch('customJs', compile);
            scope.$watch('content', compile);
        };

        return {
            restrict: "E",
            controller:customCtrl,
            controllerAs:'vm',
            link: linker,
            scope: {
                content: '=',
                model: '=',
                scope: '=',
                customJs: '='
            }
        };
    }

})();
