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
        .factory("injectCSS", CssInjector);

    /* @ngInject */
    function CssInjector($q, $firebase) {
        var injectCSS = {};

        var createLink = function (id, url) {
            var link = document.createElement('link');
            link.id = id;
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = url;
            return link;
        };
        var createStyle = function (id, val) {
            var style = document.createElement('style');
            style.id = id;
            style.innerHTML = val||'';
            return style;
        };

        var checkLoaded = function (url, deferred, tries) {
            for (var i in document.styleSheets) {
                var href = document.styleSheets[i].href || "";
                if (href.split("/").slice(-1).join() === url) {
                    deferred.resolve();
                    return;
                }
            }
            tries++;
            setTimeout(function () {
                checkLoaded(url, deferred, tries);
            }, 50);
        };

        injectCSS.set = function (id, url) {
            var tries = 0,
                deferred = $q.defer(),
                link;

            if (!angular.element('link#' + id).length) {
                link = createLink(id, url);
                link.onload = deferred.resolve;
                angular.element('head').append(link);
            }
            checkLoaded(url, deferred, tries);

            return deferred.promise;
        };

        injectCSS.setFromFirebase = function (id, refUrl) {
            var def = $q.defer();
            $firebase.ref(refUrl).once('value', function (snap) {
                injectCSS.setDirectly(id, snap.val());
                def.resolve();
            });
            return def.promise;
        };

        injectCSS.setDirectly = function (id, value) {
            if (!angular.element('style#' + id).length) {
                var style = createStyle(id, value);
                angular.element('head').append(style);
            } else {
                angular.element('style#' + id).remove();
                injectCSS.setDirectly(id,value);
            }
        };

        injectCSS.remove = function(id){
            angular.element('style#' + id).remove();
        };

        return injectCSS;
    }
})();
