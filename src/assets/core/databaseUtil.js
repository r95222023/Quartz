var DatabaseUtil = (function () {
    'use strict';

    function DatabaseUtil(app) {
        var self = this;
        //constructor
    }

    DatabaseUtil.prototype={
        getWithCache:getWithCache
    };

    function isOutdated(editTime, cached) {
        var cachedVal = lzString.decompress({compressed: cached});
        return !(editTime && editTime < cachedVal.cachedTime);
    }

    function fetch(srcRef, resolve, option) {
        var _option = option || {},
            cachePath = srcRef.toString().split('.com/')[1];

        srcRef.once('value', function (snap) {
            var val = lzString.decompress(snap.val());
            if (!val) {
                resolve(null);
                return
            }
            if (_option.pre) _option.pre(snap, val);
            _syncTime.then(function (getTime) {
                if (localStorage) {
                    val.cachedTime = getTime();
                    localStorage.setItem(cachePath, lzString.compress(val));
                }
                resolve(val);
            });
        });
    }

    function getWithCache(srcRef, option) {
        var cachePath = srcRef.toString().split('.com/')[1];
        return new Promise(function (resolve, reject) {
            if (localStorage && localStorage.getItem(cachePath)) {
                var cached = localStorage.getItem(cachePath);

                srcRef.child('editTime').once('value', function (snap) {
                    if (isOutdated(snap.val())) {
                        fetch(srcRef, resolve, option)
                    } else {
                        resolve(lzString.decompress({compressed: cached}));
                    }
                });
            } else {
                fetch(srcRef, resolve, option);
            }
        });
    }

    return FirebaseUtil
})();
