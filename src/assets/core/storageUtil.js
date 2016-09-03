var StorageUtil = (function () {
    'use strict';

    function StorageUtil(app) {
        var self = this;
        //constructor
    }

    StorageUtil.prototype = {
        getWithCache: getWithCache,
        update:update
    };

    function getRandomDownloadUrl(url) {
        if (angular.isArray(url)) {
            return url[Math.floor(Math.random() * (url.length))];
        } else {
            return url;
        }
    }

    function getId(path){
        return 'FBS:'+path
    }

    function update(targetRef, value, onState) {
        var _path = targetRef.fullPath,
            id = getId(_path),
            _onState = (typeof onState==='function')? onState:function(){};
        var isCompress = true,
            _value = {
                path: _path,
                compressed: encode.compress({value: value})
            },
            _valStr = JSON.stringify(_value),
            dataString;
        try {
            eval("(function(){})(" + _valStr + ")");
        }
        catch (err) {
            isCompress = false;
        }
        if (!isCompress) {
            _valStr = JSON.stringify({
                path: _path,
                value: value
            });
        }
        dataString = "_getFBS(" + _valStr + ");";
        var data = new Blob([dataString], {type: 'text/javascript'});
        storageReload[id] = true;
        return targetRef.put(data).on('state_changed', _onState, reject, resolve);
    }

    var storagePromises = {},
        storageReload = {};
    window.storageResolves = {};

    function getWithCache(srcRef, option) {
        var id = getId(srcRef.fullPath);
        if (storagePromises[id] && !storageReload[id]) return storagePromises[id]; //prevent getting the data twice i a short period;

        storagePromises[id] = new Promise(function (resolve, reject) {
            window.storageResolves[id] = resolve;
            var _opt = option || {};
            srcRef.getMetadata().catch(function (error) {
                if (error.code === 'storage/object-not-found') {
                    // def.resolve(null);
                    // $firebase.ref(path).once('value',function(snap){
                    //     def.resolve(lzString.decompress(snap.val()));
                    // });
                    if (_opt.fromDatabase !== false) {
                        // $firebase.cache(path, 'editTime', $firebase.ref(path)).then(function (val) {
                        //     resolve(val);
                        // });
                    } else {
                        resolve(null);
                    }
                } else {
                    reject(error);
                }
            }).then(function (meta) {
                var url = getRandomDownloadUrl(meta.downloadURLs),
                    updated = (new Date(meta.updated)).getTime();
                if (localStorage && localStorage.getItem(id)) {
                    var cached = localStorage.getItem(id),
                        cachedVal = encode.decompress({compressed: cached});
                    if (updated < cachedVal.cachedTime) {
                        resolve(cachedVal.value);
                        console.log('from cache');
                    } else {
                        loadJsFromUrl(url, id);
                    }
                } else {
                    loadJsFromUrl(url, id);
                }
            })
        });
        storageReload[id] = false;
        return storagePromises[id]
    }

    function loadJsFromUrl(url, id) {
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = url;
        if (id) script.id = id;
        document.body.appendChild(script);
    }

    window._getFBS = function (data) {
        window._FBUsg.useBandwidth(data);
        var _data = encode.decompress(data),
            id = getId(_data.path);
        window.storageResolves[id](_data.value);
        delete window.storageResolves[id];

        _syncTime.onReady().then(function (getTime) {
            if (localStorage) {
                _data.cachedTime = getTime();
                localStorage.setItem(id, encode.compress(_data));
            }
        })
    };

    return StorageUtil
})();
