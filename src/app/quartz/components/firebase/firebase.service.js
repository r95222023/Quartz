(function () {
    'use strict';

    angular
        .module('quartz.components')
        .provider('$firebase', firebaseProvider);


    ////
    function firebaseProvider() {
        var mainFirebase,
            params;
        this.setMainFirebase = function (value) {
            mainFirebase = value;
        };
        this.setParams = function (value) {
            params = value;
        };

        this.$get = /* @ngInject */ function (lzString, syncTime, FBURL, config, $rootScope, $firebaseObject, $firebaseArray, $q, $timeout, $filter) {
            return new firebase(mainFirebase, params, lzString, syncTime, FBURL, config, $rootScope, $firebaseObject, $firebaseArray, $q, $timeout, $filter)
        }
    }

    /*@ngInject*/
    function firebase(mainFirebase, params, lzString, syncTime, FBURL, config, $rootScope, $firebaseObject, $firebaseArray, $q, $timeout, $filter) {


        var activeRefUrl = {};

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
                _refUrl = refUrl || '@',
                db = firebase.databases[_refUrl.split("@")[1]] || {};

            function isDbOnline() {
                if (_opt.keepOnline !== undefined) return !!_opt.keepOnline;
                if (db.keepOnline !== undefined) return !!db.keepOnline;
                return true
            }

            this.keepOnline = isDbOnline();
            this.params = _opt.params || {};
            this.t = (new Date).getTime().toString();

            if (angular.isString(refUrl) && refUrl.split("//")[1]) {
                this.root = refUrl.split("//")[1].split(".fi")[0];
                this.rootPath = '';
                this.dbUrl = refUrl.split(".com")[0] + ".com";
                this.path = refUrl.split(".com/")[1];
            } else {
                this.root = (db.url || _refUrl.split("@")[1] || '').split("#")[0] || FBURL.split("//")[1].split(".fi")[0];
                this.rootPath = (db.url || _refUrl.split("@")[1] || '').split("#")[1] || FBURL.split(".com/")[1] || '';
                this.dbUrl = "https://" + this.root + ".firebaseio.com";
                this.path = _refUrl.split("@")[0];
            }
            if (this.rootPath) this.dbUrl += '/' + this.rootPath;
            this.url = this.dbUrl + "/" + this.path;
        }

        FbObj.prototype = {
            ref: function () {
                var ref = new Firebase(this.dbUrl);
                if (this.path === '') return ref;
                var pathArr = this.path.split("/");
                for (var i = 0; i < pathArr.length; i++) {
                    if (pathArr[i].charAt(0) === "$") {
                        ref = ref.push();
                        this.params[pathArr[i]] = ref.key();
                    } else {
                        ref = ref.child(pathArr[i]);
                    }
                }
                this.url = ref.toString();
                this.path = this.url.split(".com/")[1];
                return ref
            },
            goOnline: function () {
                if (activeRefUrl[this.dbUrl] === undefined) {
                    activeRefUrl[this.dbUrl] = []
                }
                if (activeRefUrl[this.dbUrl].length === 0) {
                    if (!this.keepOnline) {
                        Firebase.goOnline(this.dbUrl);
                        console.log(this.dbUrl, "is online", this.t)
                    }
                }
                activeRefUrl[this.dbUrl].push(this.t);
                return this
            },
            goOffline: function () {
                if (this.keepOnline) return this;
                if (activeRefUrl[this.dbUrl] === undefined) {
                    activeRefUrl[this.dbUrl] = []
                }
                if (activeRefUrl[this.dbUrl].length === 1) {
                    if (!this.keepOnline) {
                        Firebase.goOffline(this.dbUrl);
                        console.log(this.dbUrl, "is offline", this.t)
                    }
                }
                var tPos = activeRefUrl[this.dbUrl].indexOf(this.t);
                if (tPos != -1) {
                    activeRefUrl[this.dbUrl].splice(tPos, 1);
                }
                return this
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


        function object(refUrl, options) {
            return $firebaseObject(queryRef(refUrl, options));
        }

        function array(refUrl, options) {
            return $firebaseArray(queryRef(refUrl, options));
        }

        function isRefUrlValid(refUrl) {
            return (typeof refUrl === 'string') && (refUrl.split('/').indexOf('') === -1)
        }

        function load(loadList, defaultOpt) {
            var _defaultOpt = (typeof defaultOpt === 'object') ? defaultOpt : {},
                defers = {},
                promises = {};

            function onComplete(key) {
                return function (snap) {
                    defers[key].resolve(snap.val())
                }
            }

            for (var key in loadList) {
                if (loadList.hasOwnProperty(key)) {
                    defers[key] = $q.defer();
                    promises[key] = defers[key].promise;
                    var loadObj = loadList[key],
                        ref = queryRef(loadObj.refUrl, loadObj.opt || _defaultOpt);

                    ref.once('value', onComplete(key))
                }
            }
            return $q.all(promises)
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

            fbObj.goOnline();

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
                fbObj.goOffline();
            });

            def.promise.params = fbObj.params;

            return def.promise
        }

        function update(refUrl, pathArr, data) {
            //Usage example:
            // $firebase.update('sites', ['detail/123', 'list/123', extra/123], {
            //    "toDetail@0": "test", <- 0 means the zeroth component of the array which is detail/123
            //    "toList@1": "test",   <- similarly, list/123/toList will be set to "test"
            //    "toBoth@0;1": "test",   <- detail/123/toBoth and list/123/toBoth will be set to "test"
            //    "createdTime": Firebase.ServerValue.TIMESTAMP <- this will go to both paths (this equal to "createdTime@all")
            //    "@2": null <-extra/123 will be set to null
            //});
            // $firebase.update(refUrl, data) is just the normal firebase update
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

        function move(from, to) {
            var sourceRef = new Firebase(from),
                targetRef = new Firebase(to);
            sourceRef.once('value', function (snap) {
                targetRef.update(snap.val());
            })
        }

        function getUniqeId() {
            return queryRef('temp').push().key();
        }

        function cache(cachePath, editTimeRef, sourceRef, option) {
            var def = $q.defer(),
                _option = option || {},
                type = _option.isValue === false ? 'child_added' : 'value',
                fetchFn = _option.fetchFn||fetch;
            if (localStorage && localStorage.getItem(cachePath)) {
                var cached = localStorage.getItem(cachePath);
                editTimeRef.once(type, function (snap) {
                    var val = snap.val() || {},
                        editTime = _option.isValue === false ? val.editTime : val;
                    var cachedVal = lzString.decompress({compressed: cached});

                    if (editTime < cachedVal.cachedTime) {
                        def.resolve(cachedVal);
                    } else {
                        fetchFn();
                    }
                })
            } else {
                fetchFn();
            }

            function fetch() {
                sourceRef.once(_option.sourceType || 'value', function (snap) {
                    var val = lzString.decompress(snap.val());
                    if(!val) {def.resolve(null); return}
                    if(_option.pre) _option.pre(snap, val);
                    syncTime.onReady().then(function(getTime){
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
                    clear();
                })

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
                    if (isFinite(this.equalTo)) this.equalTo = Number(this.equalTo);
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
                        arr.push(angular.extend({_key: childSnap.key()}, childSnap.val()));
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
            onReorder: function (value) {
                value = value || '';
                this.orderBy = value;
                this.get(1, this.size);
            }
        };

        function paginator(ref, option) {
            return new Paginator(ref, option)
        }

        return firebase = {
            update: update,
            batchUpdate: batchUpdate,
            params: {},
            databases: {},
            ref: queryRef,
            paginator: paginator,
            request: request,
            object: object,
            array: array,
            isRefUrlValid: isRefUrlValid,
            move: move,
            load: load,
            cache: cache,
            getUniqeId: getUniqeId
        };
    }
})();
