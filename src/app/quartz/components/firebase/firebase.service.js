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

        this.$get = /* @ngInject */ function (FBURL, config, $firebaseObject, $q, $timeout,$filter) {
            return new firebase(mainFirebase, params, FBURL, config, $firebaseObject, $q, $timeout, $filter)
        }
    }

    /*@ngInject*/
    function firebase(mainFirebase, params, FBURL, config, $firebaseObject, $q, $timeout, $filter) {


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
                this.dbName = refUrl.split("//")[1].split(".fi")[0];
                this.dbUrl = refUrl.split(".com")[0] + ".com";
                this.path = refUrl.split(".com/")[1];
            } else {
                this.dbName = db.Name || _refUrl.split("@")[1] || FBURL.split("//")[1].split(".fi")[0];
                this.dbUrl = "https://" + this.dbName + ".firebaseio.com";
                this.path = _refUrl.split("@")[0];
            }
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

        function update(refUrl, value, onComplete, removePrev, refUrlParams) {
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

        function set(refUrl, value, onComplete, refUrlParams) {
            update(refUrl, value, onComplete, true, refUrlParams);
        }

//TODO: Transaction

        function batchUpdate(values, isConsecutive) {
            var def = $q.defer(),
                refUrlParams = {},
                _isConsecutive = (isConsecutive || isConsecutive === undefined);

            function update(i) {
                var params = firebase.update(values[i].refUrl, values[i].value, onComplete(i), values[i].set, refUrlParams).params;
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

            batchUpdate(opt.request, true).then(function (resolveVal) {
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

        function Paginator(ref, option) {
            this.ref = ref;
            this.option = option||{};
            this.size = 10;
            this.page = 1;
            this.result = {total: 100};
            this.orderBy = '';
            this.cache = {};
            this.limitTo = 'limitToFirst';
            this.maxCachedPage = 0;
        }

        Paginator.prototype = {
            listener: function (maxCachedPage) {
                var self = this,
                    limitTo = maxCachedPage * parseInt(self.size),
                    def = $q.defer(),
                    isDesc = this.orderBy.split('-')[1],
                    orderBy = isDesc? isDesc : this.orderBy;

                this.limitTo = isDesc ? 'limitToLast': 'limitToFirst';
                self.promise = def.promise;

                if (this.listenerCallback) {
                    this.ref.off('value', this.listenerCallback);
                }
                if (this.orderBy) {
                    this.listenerCallback =  this.ref.orderByChild(orderBy)[this.limitTo](limitTo).on('value', onValue);
                } else {
                    this.listenerCallback =  this.ref.orderByKey()[this.limitTo](limitTo).on('value', onValue);
                }
                function onValue(snap) {
                    self.cache = {};
                    var page = 1,
                        items = 0,
                        arr = [];

                    snap.forEach(function (childSnap) {
                        arr.push(childSnap.val());
                    });
                    var sortedArr = $filter('orderBy')(arr, self.orderBy);

                    angular.forEach(sortedArr, function (value) {
                        items++;
                        if (items > page * parseInt(self.size)) {
                            page++;
                        }
                        var id = 's' + self.size + 'p' + page+'o'+self.orderBy;
                        self.cache[id] = self.cache[id] || [];
                        self.cache[id].push(value);
                    });
                    self.assignPage();
                    self.result.total = sortedArr.length;
                    $timeout(angular.noop, 0);

                    def.resolve();
                }
            },
            assignPage: function () {
                var id = 's' + this.size + 'p' + this.page+'o'+this.orderBy;
                if (this.cache[id]) {
                    this.result.hits = this.cache[id];
                }
            },
            get: function (page, size) {
                this.page = page;
                this.size = size;
                var self = this,
                    preload = this.option.preload||5,
                    id = 's' + self.size + 'p' + page+'o'+self.orderBy;
                if (self.cache && self.cache[id]&&parseInt(page)+preload<self.maxCachedPage) {
                    self.assignPage();
                } else {
                    self.maxCachedPage = parseInt(page) + 2*preload;
                    self.listener(this.maxCachedPage);
                }

            },
            onReorder: function (value) {
                value = value||'';
                this.orderBy = value;
                this.get(1, this.size);
            }
        };

        function paginator(ref, option) {
            return new Paginator(ref, option)
        }

        // convert a node or Firebase style callback to a future
        function handler(fn, context) {
            return defer(function (def) {
                fn.call(context, function (err, result) {
                    if (err !== null) {
                        def.reject(err);
                    }
                    else {
                        def.resolve(result);
                    }
                });
            });
        }

        // abstract the process of creating a future/promise
        function defer(fn, context) {
            var def = $q.defer();
            fn.call(context, def);
            return def.promise;
        }

        return firebase = {
            update: update,
            set: set,
            batchUpdate: batchUpdate,
            params: {},
            databases: {},
            ref: queryRef,
            paginator: paginator,
            request: request,
            object: object,
            isRefUrlValid: isRefUrlValid,
            move: move,
            load: load,
            handler: handler,
            getUniqeId: getUniqeId
        };
    }
})();
