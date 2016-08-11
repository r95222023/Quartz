(function () {
    'use strict';

    angular
        .module('quartz.components')
        .provider('$firebase', firebaseProvider);


    ////
    function firebaseProvider() {
        var app = firebase.app(),
            mainDatabase = firebase.database(),
            dbFbApp = {
                app: app,
                databaseURL: app.options.databaseURL,
                database: mainDatabase
            },
            params = {};

        this.setDbFbApp = function (config) {
            firebase.initializeApp(config, "mainDatabase");
            var app = firebase.app("mainDatabase");
            dbFbApp = {
                app: app,
                databaseURL: config.databaseURL,
                database: app.database()
            }
        };
        this.setParams = function (value) {
            params = value;
        };

        this.$get = /* @ngInject */ function ($stateParams, lzString, syncTime, config, $rootScope, $q, $timeout, $filter) {
            return new Firebase(dbFbApp, params, $stateParams, lzString, syncTime, config, $rootScope, $q, $timeout, $filter)
        }
    }

    function Firebase(dbFirebase, params, $stateParams, lzString, syncTime, config, $rootScope, $q, $timeout, $filter) {

        function replaceParamsInString(string, params) {
            for (var param in params) {
                if (params.hasOwnProperty(param)) string = string.replace(eval("/\\" + param + "/g"), params[param]);
            }
            return string
        }

        function replaceParamsInObj(obj, params) {
            var objString = JSON.stringify(obj);
            objString = replaceParamsInString(objString, params);

            var replacedObj = JSON.parse(objString);

            for (var key in obj) {
                if (obj.hasOwnProperty(key) && (typeof obj[key] === 'function')) {
                    var paramReplacedKey = replaceParamsInString(key, params);
                    replacedObj[paramReplacedKey] = obj[key]
                }
            }

            return replacedObj
        }

        function FbObj(refUrl, opt) {
            var _opt = opt || {},
                _refUrl = (refUrl.split(".com/")[1] ? refUrl.split(".com/")[1] : refUrl) || '@',
                db = $firebase.databases[_refUrl.split("@")[1]] || {},
                root = (db.url || _refUrl.split("@")[1] || '').split("#")[0] || dbFirebase.databaseURL,
                rootPath = (db.url || _refUrl.split("@")[1] || '').split("#")[1];

            this.params = _opt.params || {};
            this.dbUrl = root.split("https")[1] ? root : "https://" + root + ".firebaseio.com";
            this.path = _refUrl.split("@")[0];

            if (rootPath) this.dbUrl += '/' + rootPath;
            this.url = this.dbUrl + "/" + this.path;
            this.appName = _opt.appName || '';
        }

        FbObj.prototype = {
            ref: function () {
                var database = angular.isString(this.appName) ? firebase.database(firebase.app(this.appName)) : dbFirebase.database,
                    ref = database.refFromURL(this.dbUrl),
                    path = '';
                if (this.path === '') return ref;
                var pathArr = this.path.split("/");
                for (var i = 0; i < pathArr.length; i++) {
                    if (pathArr[i].charAt(0) === "$") {
                        ref = ref.push();
                        this.params[pathArr[i]] = ref.key;
                    } else {
                        ref = pathArr[i] ? ref.child(pathArr[i]) : ref;
                    }
                    path += ref.key + '/'
                }
                this.url = ref.toString();
                this.path = path;
                return ref
            }
        };

        function getUrl(refUrl, params) {
            return replaceParamsInString(refUrl, angular.extend({}, firebase.params, params));
        }

        function queryRef(refUrl, options) {
            var fbObj = new FbObj(getUrl(refUrl), options),
                opt = options || {},
                ref = fbObj.ref();
            if (opt.orderBy) {
                var orderBy = 'orderBy' + opt.orderBy.split(':')[0];
                if (orderBy === 'orderByChild') {
                    ref = ref[orderBy](opt.orderBy.split(':')[1]); //ex {orderBy:'Child:name'}
                } else {
                    ref = ref[orderBy]();
                }
            } else {
                return ref
            }
            if (opt.startAt) {
                ref = ref['startAt'](opt.startAt);
            }
            if (opt.endAt) {
                ref = ref['endAt'](opt.endAt);
            }
            if (opt.equalTo) {
                ref = ref['equalTo'](opt.equalTo);
            }
            if (opt.limitToFirst) {
                ref = ref['limitToFirst'](opt.limitToFirst);
            }
            if (opt.limitToLast) {
                ref = ref['limitToLast'](opt.limitToLast);
            }
            return ref;
        }

        function isRefUrlValid(refUrl) {
            return (typeof refUrl === 'string') && (refUrl.split('/').indexOf('') === -1)
        }

        function _update(refUrl, value, onComplete, removePrev, refUrlParams) {
            var def = $q.defer(),
                _refUrlParams = angular.isObject(refUrlParams) ? refUrlParams : {},
                replacedRefUrl = getUrl(refUrl, _refUrlParams),
                fbObj = new FbObj(replacedRefUrl),
                ref = fbObj.ref(), type = removePrev ? 'set' : 'update';

            //將因push而自動生成的key值放到value內相對應的property中
            var params = angular.extend({}, _refUrlParams, fbObj.params);
            //console.log(JSON.stringify(params));
            if (typeof value === 'object' && value != null) {
                for (var key in params) {
                    var realKey = key.split('$')[1];
                    if (value[realKey] === undefined) continue;
                    value[realKey] = params[key];
                }
            } else if (typeof value === 'string') {
                for (var key in params) {
                    value.replace(key, params[key]);
                }
            }

            ref[type](value, function (error) {
                if (onComplete) onComplete.apply(null, [error]);
                if (error) {
                    console.log("Update failed: " + refUrl);
                    def.reject(error);
                } else {
                    if (config.debug) {
                        console.log("Update success: " + refUrl)
                    }
                    def.resolve();
                }
            });

            def.promise.params = fbObj.params;

            return def.promise
        }

        function update(refUrl, pathArr, data) {
            var _data = {},
                ref;
            if (angular.isString(refUrl)) {
                ref = queryRef(refUrl);
            } else {
                ref = refUrl;
            }
            if (data === undefined) {
                return ref.update(pathArr);
            }
            angular.forEach(pathArr, function (path, pathIndex) {
                _data[path] = {};
                angular.forEach(data, function (subdata, key) {
                    var whereDataGoes = key.split('@')[1] || "",
                        subDataKey = key.split('@')[0];
                    if (whereDataGoes === "" || whereDataGoes === "all" || whereDataGoes.indexOf(pathIndex) !== -1 || whereDataGoes.indexOf(path) !== -1) {
                        if (subDataKey) {
                            _data[path][subDataKey] = subdata;
                        } else {
                            _data[path] = subdata;
                        }
                    }
                })
            });
            return ref.update(_data);
        }

        function _set(refUrl, value, onComplete, refUrlParams) {
            _update(refUrl, value, onComplete, true, refUrlParams);
        }

        function updateCacheable(refUrl, data) {
            return update(refUrl, {compressed: lzString.compress(data), editTime: firebase.database.ServerValue.TIMESTAMP})
        }

//TODO: Transaction

        function batchUpdate(values, isConsecutive) {
            var def = $q.defer(),
                refUrlParams = {},
                _isConsecutive = (isConsecutive || isConsecutive === undefined);

            function update(i) {
                var params = _update(values[i].refUrl, values[i].value, onComplete(i), values[i].set, refUrlParams).params;
                refUrlParams = angular.extend(refUrlParams, params);
            }

            function onComplete(i) {

                function consecutive(error) {  //防止最後實際執行onComplete時使用的是跑完loop後的j的值
                    var isLast = i === (values.length - 1);

                    if (values[i] && values[i].onComplete) values[i].onComplete.apply(null, [error]);
                    if (error) {
                        def.reject(error);
                    } else {
                        if (isLast) {
                            def.resolve({params: refUrlParams});
                        } else {
                            update(i + 1);
                        }
                    }
                }

                function nonConsecutive(error) {
                    if (values[i] && values[i].onComplete) values[i].onComplete.apply(null, [error]);
                    if (error) {
                        defers[i].reject(error)
                    } else {
                        defers[i].resolve();
                    }
                }

                return _isConsecutive ? consecutive : nonConsecutive
            }

            if (_isConsecutive) {
                update(0);
            } else {
                var defers = [],
                    promises = [];
                for (var i = 0; i < values.length; i++) {
                    defers[i] = $q.defer();
                    promises[i] = defers[i].promise;
                    update(i);
                }
                $q.all(promises).then(function () {
                    def.resolve({params: refUrlParams})
                }, function (error) {
                    def.reject(error);
                });
            }

            return def.promise
        }

        function getUniqeId() {
            return queryRef('temp').push().key;
        }

        function getWithCache(cachePath, editTimeRef, sourceRef, option) {
            var def = $q.defer(),
                _option = option || {},
                type = _option.isValue === false ? 'child_added' : 'value',
                fetchFn = _option.fetchFn || fetch;
            cachePath = ($stateParams.siteName && cachePath.split('@')[1] === 'selectedSite') ? $stateParams.siteName + cachePath.split('@')[0] : cachePath;
            if (localStorage && localStorage.getItem(cachePath)) {
                var cached = localStorage.getItem(cachePath),
                    onGettingTime = function (snap) {
                        var val = angular.isNumber(snap) ? snap : (snap.val() || {}),
                            editTime = _option.isValue === false ? val.editTime : val;

                        var cachedVal = lzString.decompress({compressed: cached});

                        if (editTime && editTime < cachedVal.cachedTime) {
                            def.resolve(cachedVal);
                        } else {
                            fetchFn();
                        }
                    };

                if (angular.isNumber(editTimeRef)) {
                    onGettingTime(editTimeRef);
                } else if (angular.isString(editTimeRef)) {
                    sourceRef.child(editTimeRef).once(type, onGettingTime);
                } else {
                    editTimeRef.once(type, onGettingTime);
                }


            } else {
                fetchFn();
            }


            function fetch() {
                sourceRef.once(_option.sourceType || 'value', function (snap) {
                    var val = lzString.decompress(snap.val());
                    if (!val) {
                        def.resolve(null);
                        return
                    }
                    if (_option.pre) _option.pre(snap, val);
                    syncTime.onReady().then(function (getTime) {
                        if (localStorage) {
                            val.cachedTime = getTime();
                            localStorage.setItem(cachePath, lzString.compress(val));
                        }
                        def.resolve(val);
                    });


                });
            }

            return def.promise;
        }


        //EX:
        // request({
        //    request: [{
        //        refUrl: 'orders/1234',
        //        value: {....}
        //    }],
        //    response: {
        //    res1: 'orders/1234/checkValue',             <- new value (was null before) set by the server.
        //    $res2: 'orders/1234/status'                 <- if value is changed at this path by the server, use prefix $
        //}).then(function(res){
        //    res==={res1:...., $res2:....}
        // })
        function request(opt) {
            var res = {}, def = $q.defer();
            if (typeof opt !== 'object') return;

            batchUpdate(opt.request, true)
                .then(function (resolveVal) {
                    if (!opt.response) {
                        def.resolve(resolveVal);
                        return
                    }
                    angular.extend(res, resolveVal);
                    var resUrlArr = replaceParamsInObj(opt.response, resolveVal.params);

                    getResponse(resUrlArr).then(function (response) {

                        angular.extend(res, response);
                        def.resolve(res);
                    }, function (error) {
                        def.reject(error);
                    })
                }, function (error) {
                    def.reject(error);
                });
            return def.promise
        }

        function getResponse(refs) {
            var isRenew = {}, promises = {};

            function onComplete(key, refUrl) {
                var def = $q.defer();
                promises[key] = def.promise;

                var onSuccess = function (snap) {
                    if (snap.val() !== null && refUrl.charAt(0) !== '$' || isRenew[key] === true) {
                        def.resolve(snap.val());
                        queryRef(refUrl).off();
                    } else {
                        isRenew[key] = true; //server hasn't change the data.
                    }
                };
                var onError = function (err) {
                    def.reject(err)
                };

                return [onSuccess, onError]
            }

            for (var key in refs) {
                var cb = onComplete(key, refs[key]),
                    success = cb[0], error = cb[1];
                if (refs.hasOwnProperty(key)) queryRef(refs[key]).on('value', success, error);
            }
            return $q.all(promises);
        }

        function Paginator(refUrl, option) {
            this.ref = queryRef(refUrl);
            this.option = option || {};
            this.size = 10;
            this.page = 1;
            this.result = {total: 100};
            this.orderBy = this.option.orderBy || '';
            this.startAt = this.option.startAt || '';
            this.equalTo = this.option.equalTo || '';
            this.endAt = this.option.endAt || '';
            this.cache = {};
            this.limitTo = 'limitToFirst';
            this.maxCachedPage = 0;

            var self = this,
                clear = $rootScope.$on('$stateChangeStart', function () {
                    if (angular.isFunction(self.listenerCallback)) {
                        self.ref.off('value', self.listenerCallback);
                    }
                });
            clear();


        }

        Paginator.prototype = {
            listener: function (maxCachedPage) {
                var self = this,
                    limitTo = maxCachedPage * parseInt(self.size),
                    def = $q.defer(),
                    isDesc = this.orderBy.split('-')[1],
                    orderBy = isDesc ? isDesc : this.orderBy;

                this.limitTo = isDesc ? 'limitToLast' : 'limitToFirst';
                self.promise = def.promise;


                if (angular.isFunction(this.listenerCallback)) {
                    this.ref.off('value', this.listenerCallback);
                }

                var _ref;
                if (this.orderBy) {
                    _ref = this.ref.orderByChild(orderBy.replace('.', '/'));
                } else {
                    _ref = this.ref.orderByKey();
                }

                if (this.equalTo) {
                    if (isFinite(this.equalTo) && this.equalTo !== true && this.equalTo !== false) this.equalTo = Number(this.equalTo);
                    _ref = _ref.equalTo(this.equalTo);
                } else {
                    if (isFinite(this.startAt)) this.startAt = Number(this.startAt);
                    if (isFinite(this.endAt)) this.endAt = Number(this.endAt);
                    _ref = this.startAt ? _ref.startAt(this.startAt) : _ref;
                    _ref = this.endAt ? _ref.endAt(this.endAt) : _ref;
                }
                this.listenerCallback = _ref[this.limitTo](limitTo).on('value', onValue);


                function onValue(snap) {
                    self.cache = {};
                    var page = 1,
                        items = 0,
                        arr = [];

                    snap.forEach(function (childSnap) {
                        arr.push(angular.extend({_key: childSnap.key}, childSnap.val()));
                    });
                    var sortedArr = $filter('orderBy')(arr, self.orderBy);

                    angular.forEach(sortedArr, function (value) {
                        items++;
                        if (items > page * parseInt(self.size)) {
                            page++;
                        }
                        var id = 's' + self.size + 'p' + page + 'o' + self.orderBy;
                        self.cache[id] = self.cache[id] || [];
                        self.cache[id].push(value);
                    });
                    self.assignPage();
                    self.result.total = sortedArr.length;
                    if (self.result.total === 0) self.result.hits = [];
                    def.resolve();
                }
            },
            assignPage: function () {
                var id = 's' + this.size + 'p' + this.page + 'o' + this.orderBy;
                if (this.cache[id]) {
                    this.result.hits = this.cache[id];
                }
            },
            get: function (page, size) {
                this.page = page;
                this.size = size;
                var self = this,
                    preload = this.option.preload || 5,
                    id = 's' + self.size + 'p' + page + 'o' + self.orderBy;
                if (self.cache && self.cache[id] && parseInt(page) + preload < self.maxCachedPage) {
                    self.assignPage();
                } else {
                    self.maxCachedPage = parseInt(page) + 2 * preload;
                    self.listener(this.maxCachedPage);
                }

            },
            //ex: onReorder('uid')
            //or  onReorder({orderBy:'uid',startAt:'0000001'})
            onReorder: function (value) {
                if (angular.isString(value)) {
                    this.orderBy = value
                } else if (angular.isObject(value)) {
                    angular.extend(this, value);
                }
                this.get(1, this.size);
            }
        };

        function paginator(ref, option) {
            return new Paginator(ref, option)
        }
        function getValidKey(key){
            //TODO
            var res=key, replace=[['.','^0'],['#','^1'],['$','^2'],['[','^3'],[']','^4']];
            angular.forEach(replace, function(val){
                res=res.replace(val[0],val[1]);
            });
            // ".", "#", "$", "/", "[", or "]"
            return res;
        }

        var $firebase = {
            update: update,
            updateCacheable:updateCacheable,
            batchUpdate: batchUpdate,
            params: params,
            databases: {},
            storages: {},
            ref: queryRef,
            paginator: paginator,
            request: request,
            isRefUrlValid: isRefUrlValid,
            cache: getWithCache,
            getWithCache:function(sourcePath, option){
                var sourceRef = queryRef(sourcePath);
                return getWithCache(sourceRef.toSource(), 'editTime', sourceRef, option)
            },
            getValidKey: getValidKey,
            getUniqeId: getUniqeId,
            databaseURL: dbFirebase.databaseURL
        };

        return $firebase;
    }
})();
