(function () {
    'use strict';

    angular
        .module('quartz.components')
        .directive('firebase', firebase)
        .directive('angularfireObject', angularfireObject);


    /*@ngInject*/
    function firebase($firebase) {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                firebase: '@',
                orderBy: '@',
                startAt: '@',
                endAt: '@',
                equalTo: '@',
                limitToFirst: '@',
                limitToLast: '@',
                options: '=',
                sync: '@',
                eventType: '@',
                callback: '='
            },
            link: function (scope, element, attrs, ctrl, transcludeFn) {
                var opt = {
                        orderBy: scope.orderBy,
                        startAt: scope.startAt,
                        endAt: scope.endAt,
                        equalTo: scope.equalTo,
                        limitToFirst: scope.limitToFirst,
                        limitToLast: scope.limitToLast
                    };

                function init(ref) {

                    var valueAs = '$value',
                        errorAs = '$error',
                        isLoadingAs= '$isLoading',
                        refName= attrs.refName||'ref';

                    scope.eventType=scope.eventType===undefined? 'value': scope.eventType;
                    scope.callback=angular.isFunction(scope.callback)? scope.callback:angular.noop;
                    element.empty();


                    transcludeFn(function (clone, trclScope) {
                        element.append(clone);
                        trclScope[refName]={};
                        trclScope[refName][isLoadingAs]=true;

                        ref[opt.sync||opt.sync===undefined? 'on' : 'once'](scope.eventType, onSuccess, onError);

                        function onSuccess(snap, prevChildKey) {
                            trclScope[refName][valueAs]=trclScope[refName][valueAs]? trclScope[refName][valueAs]:{};
                            if(trclScope[refName][isLoadingAs]) trclScope[refName][isLoadingAs]=false;
                            if (scope.eventType === 'value') {
                                trclScope[refName][valueAs] = snap.val();
                            } else {
                                trclScope[refName][valueAs][snap.key()] = snap.val();
                            }
                            scope.callback(snap, prevChildKey);
                        }
                        function onError(error) {
                            scope[errorAs] = error;
                            if(trclScope[refName][isLoadingAs]) trclScope[refName][isLoadingAs]=false;
                        }
                    });
                }

                scope.$watch('firebase', function () {
                    var ref = $firebase.ref(scope.firebase, scope.options || opt);
                    init(ref);
                });
            }

        };
    }

    /*@ngInject*/
    function angularfireObject($firebase) {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                angularfireObject: '@',
                orderBy: '@',
                startAt: '@',
                endAt: '@',
                equalTo: '@',
                limitToFirst: '@',
                limitToLast: '@',
                options: '=',
                sync: '@',
                eventType: '@',
                callback: '='
            },
            link: function (scope, element, attrs, ctrl, transcludeFn) {
                var opt = {
                    orderBy: scope.orderBy,
                    startAt: scope.startAt,
                    endAt: scope.endAt,
                    equalTo: scope.equalTo,
                    limitToFirst: scope.limitToFirst,
                    limitToLast: scope.limitToLast
                };
                function init(obj) {
                    var valueAs = '$value',
                        errorAs = '$error',
                        isLoadingAs= '$isLoading',
                        refName= attrs.refName||'ref';

                    element.empty();
                    transcludeFn(function (clone, trclScope) {
                        obj.$loaded(onSuccess, onError);

                        element.append(clone);
                        trclScope[refName]={};
                        trclScope[refName][isLoadingAs]=true;

                        function onSuccess(firebaseObj) {
                            trclScope[refName][valueAs] = firebaseObj.$value ? firebaseObj.$value : firebaseObj;
                            if(trclScope[refName][isLoadingAs]) trclScope[refName][isLoadingAs]=false;
                            trclScope[refName].$firebaseObject = firebaseObj;
                            trclScope.$eval(attrs.loaded);
                        }

                        function onError(error) {
                            trclScope[refName][errorAs] = error;
                            obj.$destroy();
                        }
                    });
                }

                var obj = $firebase.$object(scope.angularfireObject, scope.options || opt),
                    isFirstTime=true;
                scope.$watch('angularfireObject', function () {
                    if(isFirstTime){
                        init(obj);
                        isFirstTime=false;
                    } else {
                        obj.$destroy();
                        obj = $firebase.$object(scope.angularfireObject, scope.options || opt);
                        init(obj);
                    }
                });
            }

        };
    }
})();
