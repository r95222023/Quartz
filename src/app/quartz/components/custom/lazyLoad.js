(function () {
    'use strict';
    angular.module('quartz.components')
        .factory("$lazyLoad", LazyLoad);

    /* @ngInject */
    function LazyLoad($q, $ocLazyLoad, $firebaseStorage, injectCSS) {
        function getLazyLoadArgs(sources, pageName) {
            var def = $q.defer(), _sourcesArr = sources || [], jsArr = [], cssArr = [];

            angular.forEach(_sourcesArr, function (val) {
                if (val.split('.css')[1] === '') {
                    cssArr.push(val);
                } else if (val.split('.js')[1] === '') {
                    jsArr.push(val);
                }
            });

            angular.forEach(cssArr, function (cssUrl) {
                if (cssUrl.search('://') !== -1) {
                    injectCSS.set('pageStyle' + pageName, cssUrl, true);
                } else {
                    $firebaseStorage.ref('files/' + cssUrl + '@selectedSite', {isJs: false}).getDownloadURL()
                        .then(function (url) {
                            injectCSS.set('pageStyle' + pageName, url, true);
                        });
                }
            });

            var promises = {};
            angular.forEach(jsArr, function (jsUrl, index) {
                if (jsUrl.search('://') !== -1) {
                    injectCSS.set('pageStyle' + pageName, jsUrl, true);
                } else {
                    promises[index + ''] = $firebaseStorage.ref('files/' + jsUrl + '@selectedSite', {isJs: false}).getDownloadURL();
                }
            });
            $q.all(promises).then(function (res) {

                angular.forEach(res, function (url, _index) {
                    jsArr[_index] = url;
                });

                def.resolve({serie: true, files: jsArr});
            });
            return def.promise;
        }

        function load(type, name) {

            var _name = name,
                pageId = _name.replace(/\s+/g, ''),
                def = $q.defer();

            $firebaseStorage.getWithCache(type + 's/detail/' + _name + '@selectedSite').then(function (val) {
                var sources = val.sources;
                injectCSS.setDirectly(type + 'Style' + pageId, val.css, true, type === 'page' ? _name : '');

                if (sources) {
                    getLazyLoadArgs(sources, pageId).then(function (args) {
                        if (args.files.length) {
                            $ocLazyLoad.load(args).then(function () {
                                def.resolve(val);
                            })
                        } else {
                            def.resolve(val);

                        }
                    });
                } else {
                    def.resolve(val);
                }
            });
            return def.promise;
        }

        return {
            load: load
        }
    }
})();
