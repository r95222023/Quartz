(function () {
    'use strict';
    /*
     * angular-css-injector v1.0.4
     * Written by Gabriel Delépine
     * Special thanks to (github users) : @kleiinnn
     * License: MIT
     * https://github.com/Yappli/angular-css-injector/
     */
    angular.module('quartz.components')
        .factory("injectJS", JsInjector);

    /* @ngInject */
    function JsInjector($q, $firebase) {
        var injectJS = {},
            injected = {};
        var createScript = function (id,value) {
            var script = document.createElement('script');
            script.id = id;
            script.type = "text/javascript";
            if (value) {
                script.text = value || '';
            }
            return script;
        };

        injectJS.set = function (id, url) {
            var script;

            if (!injected[id]) {
                injected[id] = $q.defer();
                script = createScript(id);
                script.onload = injected[id].resolve;
                angular.element('head').append(script);
                script.src = url;
            }
            return injected[id].promise;
        };

        injectJS.setDirectly = function (id, value) {
            if (!injected[id]) {
                injected[id] = $q.defer();
                var script = createScript(id, value);
                injected[id].resolve();
                angular.element('head').append(script);
            }
            return injected[id].promise;
        };

        // injectJS.setFromFirebase = function (id, refUrl) {
        //     var def = $q.defer();
        //     $firebase.ref(refUrl).once('value', function (snap) {
        //         injectCSS.setDirectly(id, snap.val())
        //             .then(function () {
        //                 def.resolve();
        //             });
        //     });
        //     return def.promise;
        // };

        return injectJS;
    }
})();
