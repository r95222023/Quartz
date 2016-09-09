(function () {
    'use strict';

    function DatabaseUtil(fbUtil) {
        //constructor
        this.fbUtil = fbUtil;
        this.database = firebase.database(fbUtil.app);
    }

    DatabaseUtil.prototype.queryRef = function (refUrl, options) {
        var opt = options || {},
            ref, database = this.database;

        if (!refUrl) {
            return database.ref().root;
        } else if (refUrl.search('://') !== -1) {
            ref = database.refFromURL(this.fbUtil.parseRefUrl(refUrl));
        } else {
            ref = database.ref(this.fbUtil.parseRefUrl(refUrl, opt.params || {}));
        }
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
    };

    function isOutdated(editTime, cached) {
        var cachedVal = _core.encoding.decompress({compressed: cached});
        return !(editTime && editTime < cachedVal.cachedTime);
    }

    function fetch(srcRef, resolve, option) {
        var _option = option || {},
            cachePath = srcRef.toString().split('.com/')[1];

        srcRef.once('value', function (snap) {
            var val = _core.encoding.decompress(snap.val());
            if (!val) {
                resolve(null);
                return
            }
            if (_option.pre) _option.pre(snap, val);
            _core.syncTime.then(function (getTime) {
                if (localStorage) {
                    val.cachedTime = getTime();
                    localStorage.setItem(cachePath, _core.encoding.compress(val));
                }
                resolve(val);
            });
        });
    }

    DatabaseUtil.prototype.getWithCache = function (srcRef, option) {
        var _srcRef = (typeof srcRef === 'string') ? this.queryRef(srcRef, option) : srcRef,
            cachePath = _srcRef.toString().split('.com/')[1];
        return new Promise(function (resolve, reject) {
            if (localStorage && localStorage.getItem(cachePath)) {
                var cached = localStorage.getItem(cachePath);

                _srcRef.child('editTime').once('value', function (snap) {
                    if (isOutdated(snap.val())) {
                        fetch(_srcRef, resolve, option)
                    } else {
                        resolve(_core.encoding.decompress({compressed: cached}));
                    }
                });
            } else {
                fetch(_srcRef, resolve, option);
            }
        });
    };

    DatabaseUtil.prototype.request = function (request, response) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.queryRef().update(request)
                .then(function () {
                    var resRefs = [];
                    response.forEach(function(val, index){
                        resRefs[index] = self.queryRef(val)
                    });
                    getResponse(resRefs).then(resolve);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    };

    function getResponse(refs) {
        var promises = [];

        function promise(ref) {
            return new Promise(function (resolve, reject) {
                var onSuccess = function (snap) {
                    if (snap.val() !== null) {
                        resolve(snap.val());
                        // resolve(snap.val());
                        ref.off();
                    }
                };
                var onError = function (err) {
                    reject(err)
                };
                ref.on('value', onSuccess, onError);
            });
        }

        refs.forEach(function(val, index){
            promises[index]=promise(refs[index]);
        });
        return Promise.all(promises);
    }

    window._core = window._core||{};
    window._core.DatabaseUtil = DatabaseUtil;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return DatabaseUtil;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = DatabaseUtil
    }
})();
