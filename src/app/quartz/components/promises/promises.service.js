(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('promiseService', promiseService);

    /* @ngInject */
    function promiseService($q) {
        var defers = {},
            resolvers = {},
            status={};
        return {
            add: add,
            remove: remove,
            resolve: resolve,
            reject: reject,
            reset: reset,
            all: all,
            get:get
        };

        function resolving(promiseName) {
            var def=defers[promiseName];
            status[promiseName]='resolving';
            resolvers[promiseName].apply(null, [def.resolve, def.reject]);
        }

        function add(promiseName, resolver, executeImediately) {
            var def = $q.defer();
            defers[promiseName] = def;
            resolvers[promiseName] = resolver;
            status[promiseName]=0;
            if (executeImediately&&angular.isFunction(resolvers[promiseName])) {
                resolving(promiseName);
            }
            def.promise.then(function () {
                status[promiseName]='resolved'
            }, function () {
                status[promiseName]='rejected'
            });
        }

        function remove(promiseName) {
            delete defers[promiseName];
            delete resolvers[promiseName];
            delete status[promiseName]
        }

        function resolve(promiseName, value) {
            if (defers[promiseName]) {
                defers[promiseName].resolve(value);
            }
        }

        function reject(promiseName, reason) {
            if (defers[promiseName]) {
                defers[promiseName].reject(reason);
            }
        }

        function reset(promiseName, resolver) {
            var _resolver=resolver||resolvers[promiseName]||angular.noop;
            if(status[promiseName]===0){
                var def= defers[promiseName];
                _resolver.apply(null, [def.resolve, def.reject]);
            } else {
                remove(promiseName);
                return add(promiseName, _resolver);
            }
        }

        function get(promiseName) {
            if(angular.isUndefined(status[promiseName])){
                add(promiseName);
            }
            return defers[promiseName].promise
        }


        function all(promiseNameObj){
            var promises={};
            angular.forEach(promiseNameObj, function (promiseName,key) {
                if(angular.isUndefined(defers[promiseName])){
                    add(promiseName);
                } else if(angular.isUndefined(status[promiseName])&&angular.isFunction(resolvers[promiseName])) {
                    resolving(promiseName);
                } else if(angular.isObject(promiseName)&&angular.isFunction(promiseName.then)){
                    //promiseName is a external promise here.
                    promises[key] = promiseName;
                    return;
                }
                promises[key] = defers[promiseName].promise;
            });
            return $q.all(promises)
        }
    }
})();
