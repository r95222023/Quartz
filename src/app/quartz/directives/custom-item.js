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
    function customItem($compile, $injector, $ocLazyLoad) {
        var linker = function (scope, element, attrs, ctrl) {
            var _ctrl = angular.copy(ctrl),
                status;

            function injectCustomJs(){
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
            }

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
                    injectCustomJs();

                    $compile(element.contents())(scope);
                }
                var timeout=setTimeout(function(){
                    status='';
                    clearTimeout(timeout);
                },1000)
            }

            function init(){
                if(scope.sources){
                    $ocLazyLoad.load(scope.sources).then(compile);
                } else {
                    compile();
                }
            }

            scope.$watch('customJs', init);
            scope.$watch('content', init);
        };

        return {
            restrict: "E",
            controller:customCtrl,
            controllerAs:'vm',
            link: linker,
            scope: {
                content: '=',
                customJs: '=',
                sources:'='
            }
        };
    }

})();
