/**
 * UI-Router Extras: Sticky states, Future States, Deep State Redirect, Transition promise
 * Module: core
 * @version 0.1.2
 * @link http://christopherthielen.github.io/ui-router-extras/
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(angular, undefined){
    "use strict";
    var mod_core = angular.module('quartz.components');

    var internalStates = {}, stateRegisteredCallbacks = [];
    mod_core.config([ '$stateProvider', '$injector', function ($stateProvider, $injector) {
        // Decorate any state attribute in order to get access to the internal state representation.
        $stateProvider.decorator('parent', function (state, parentFn) {
            // Capture each internal UI-Router state representations as opposed to the user-defined state object.
            // The internal state is, e.g., the state returned by $state.$current as opposed to $state.current
            internalStates[state.self.name] = state;
            // Add an accessor for the internal state from the user defined state
            state.self.$$state = function () {
                return internalStates[state.self.name];
            };

            angular.forEach(stateRegisteredCallbacks, function(callback) { callback(state); });
            return parentFn(state);
        });
    }]);

    var DEBUG = false;

    var forEach = angular.forEach;
    var extend = angular.extend;
    var isArray = angular.isArray;

    var map = function (collection, callback) {
        "use strict";
        var result = [];
        forEach(collection, function (item, index) {
            result.push(callback(item, index));
        });
        return result;
    };

    var keys = function (collection) {
        "use strict";
        return map(collection, function (collection, key) {
            return key;
        });
    };

    var filter = function (collection, callback) {
        "use strict";
        var result = [];
        forEach(collection, function (item, index) {
            if (callback(item, index)) {
                result.push(item);
            }
        });
        return result;
    };

    var filterObj = function (collection, callback) {
        "use strict";
        var result = {};
        forEach(collection, function (item, index) {
            if (callback(item, index)) {
                result[index] = item;
            }
        });
        return result;
    };

// Duplicates code in UI-Router common.js
    function ancestors(first, second) {
        var path = [];

        for (var n in first.path) {
            if (first.path[n] !== second.path[n]) break;
            path.push(first.path[n]);
        }
        return path;
    }

// Duplicates code in UI-Router common.js
    function objectKeys(object) {
        if (Object.keys) {
            return Object.keys(object);
        }
        var result = [];

        angular.forEach(object, function (val, key) {
            result.push(key);
        });
        return result;
    }

    /**
     * like objectKeys, but includes keys from prototype chain.
     * @param object the object whose prototypal keys will be returned
     * @param ignoreKeys an array of keys to ignore
     */
// Duplicates code in UI-Router common.js
    function protoKeys(object, ignoreKeys) {
        var result = [];
        for (var key in object) {
            if (!ignoreKeys || ignoreKeys.indexOf(key) === -1)
                result.push(key);
        }
        return result;
    }

// Duplicates code in UI-Router common.js
    function arraySearch(array, value) {
        if (Array.prototype.indexOf) {
            return array.indexOf(value, Number(arguments[2]) || 0);
        }
        var len = array.length >>> 0, from = Number(arguments[2]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);

        if (from < 0) from += len;

        for (; from < len; from++) {
            if (from in array && array[from] === value) return from;
        }
        return -1;
    }

// Duplicates code in UI-Router common.js
// Added compatibility code  (isArray check) to support both 0.2.x and 0.3.x series of UI-Router.
    function inheritParams(currentParams, newParams, $current, $to) {
        var parents = ancestors($current, $to), parentParams, inherited = {}, inheritList = [];

        for (var i in parents) {
            if (!parents[i].params) continue;
            // This test allows compatibility with 0.2.x and 0.3.x (optional and object params)
            parentParams = isArray(parents[i].params) ? parents[i].params : objectKeys(parents[i].params);
            if (!parentParams.length) continue;

            for (var j in parentParams) {
                if (arraySearch(inheritList, parentParams[j]) >= 0) continue;
                inheritList.push(parentParams[j]);
                inherited[parentParams[j]] = currentParams[parentParams[j]];
            }
        }
        return extend({}, inherited, newParams);
    }

    function inherit(parent, extra) {
        return extend(new (extend(function () { }, {prototype: parent}))(), extra);
    }

    function onStateRegistered(callback) { stateRegisteredCallbacks.push(callback); }

    mod_core.provider("uirextras_core", function() {
        var core = {
            internalStates: internalStates,
            onStateRegistered: onStateRegistered,
            forEach: forEach,
            extend: extend,
            isArray: isArray,
            map: map,
            keys: keys,
            filter: filter,
            filterObj: filterObj,
            ancestors: ancestors,
            objectKeys: objectKeys,
            protoKeys: protoKeys,
            arraySearch: arraySearch,
            inheritParams: inheritParams,
            inherit: inherit
        };

        angular.extend(this, core);

        this.$get = function() {
            return core;
        };
    });


})(angular);

/**
 * UI-Router Extras: Sticky states, Future States, Deep State Redirect, Transition promise
 * Module: transition
 * @version 0.1.2
 * @link http://christopherthielen.github.io/ui-router-extras/
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(angular, undefined){
    "use strict";

    angular.module('quartz.components').config( [ "$provide",  function ($provide) {
            // Decorate the $state service, so we can replace $state.transitionTo()
            $provide.decorator("$state", ['$delegate', '$rootScope', '$q', '$injector',
                function ($state, $rootScope, $q, $injector) {
                    // Keep an internal reference to the real $state.transitionTo function
                    var $state_transitionTo = $state.transitionTo;
                    // $state.transitionTo can be re-entered.  Keep track of re-entrant stack
                    var transitionDepth = -1;
                    var tDataStack = [];
                    var restoreFnStack = [];

                    // This function decorates the $injector, adding { $transition$: tData } to invoke() and instantiate() locals.
                    // It returns a function that restores $injector to its previous state.
                    function decorateInjector(tData) {
                        var oldinvoke = $injector.invoke;
                        var oldinstantiate = $injector.instantiate;
                        $injector.invoke = function (fn, self, locals) {
                            return oldinvoke(fn, self, angular.extend({$transition$: tData}, locals));
                        };
                        $injector.instantiate = function (fn, locals) {
                            return oldinstantiate(fn, angular.extend({$transition$: tData}, locals));
                        };

                        return function restoreItems() {
                            $injector.invoke = oldinvoke;
                            $injector.instantiate = oldinstantiate;
                        };
                    }

                    function popStack() {
                        restoreFnStack.pop()();
                        tDataStack.pop();
                        transitionDepth--;
                    }

                    // This promise callback (for when the real transitionTo is successful) runs the restore function for the
                    // current stack level, then broadcasts the $transitionSuccess event.
                    function transitionSuccess(deferred, tSuccess) {
                        return function successFn(data) {
                            popStack();
                            $rootScope.$broadcast("$transitionSuccess", tSuccess);
                            deferred.resolve(data); // $transition$ deferred
                            return data;
                        };
                    }

                    // This promise callback (for when the real transitionTo fails) runs the restore function for the
                    // current stack level, then broadcasts the $transitionError event.
                    function transitionFailure(deferred, tFail) {
                        return function failureFn(error) {
                            popStack();
                            $rootScope.$broadcast("$transitionError", tFail, error);
                            deferred.reject(error);  // $transition$ deferred
                            return $q.reject(error);
                        };
                    }

                    // Decorate $state.transitionTo.
                    $state.transitionTo = function (to, toParams, options) {
                        // Create a deferred/promise which can be used earlier than UI-Router's transition promise.
                        var deferred = $q.defer();
                        // Place the promise in a transition data, and place it on the stack to be used in $stateChangeStart
                        var tData = tDataStack[++transitionDepth] = {
                            promise: deferred.promise
                        };
                        // placeholder restoreFn in case transitionTo doesn't reach $stateChangeStart (state not found, etc)
                        restoreFnStack[transitionDepth] = function() { };
                        // Invoke the real $state.transitionTo
                        var tPromise = $state_transitionTo.apply($state, arguments);

                        // insert our promise callbacks into the chain.
                        return tPromise.then(transitionSuccess(deferred, tData), transitionFailure(deferred, tData));
                    };

                    // This event is handled synchronously in transitionTo call stack
                    $rootScope.$on("$stateChangeStart", function (evt, toState, toParams, fromState, fromParams) {
                            if (transitionDepth >= tDataStack.length) return;
                            var depth = transitionDepth;
                            // To/From is now normalized by ui-router.  Add this information to the transition data object.
                            var tData = angular.extend(tDataStack[depth], {
                                to: { state: toState, params: toParams },
                                from: { state: fromState, params: fromParams }
                            });

                            var restoreFn = decorateInjector(tData);
                            restoreFnStack[depth] = restoreFn;
                            $rootScope.$broadcast("$transitionStart", tData);
                        }
                    );

                    return $state;
                }]);
        }
        ]
    );

})(angular);
