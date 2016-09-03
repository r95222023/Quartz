var FirebaseUtil =(function (firebase) {
    'use strict';

    //parse siteName -> get preload data of that site
    var site = 'sites/detail/:siteName',
        user = site + '/users/detail/:userId',
        paths = {
            'servers': 'servers',
            'queue': 'queue',
            'query-request': 'query/request',
            'query-response': 'query/response',
            'query-specs': 'query/specs',
            'query-cache': 'query/cache',
            'site': site,
            'product': site + '/products/:type/:productId',
            'article': site + '/articles/:type/:articleId',
            'order-payment': site + '/orders/:type/:orderId/payment',
            'user-order-payment': user + '/orders/:type/:orderId/payment',
            'order-payment-allpay': site + '/orders/detail/:orderId/payment/allpay'
        };

    function getSiteName(cb) {
        //query firebase database to see if there is any site correspond to this url
        var url = location.href,
            siteName = url.split('#!/')[1].split('/')[0];
        cb(siteName);
    }

    var fbconfig = {
        apiKey: "AIzaSyAfxA30u_wPOkVCn727MJXZ4eFhg4raKdI",
        authDomain: "quartz.firebaseapp.com",
        databaseURL: "https://quartz.firebaseio.com",
        storageBucket: "project-3415547818359859659.appspot.com",
        appName: 'quartz'
    };

    function FirebaseUtil(fbconfig) {
        var self = this,
            appName = fbconfig.appName || fbconfig.databaseURL;
        //constructor
        firebase.initializeApp(fbconfig, appName);
        this.app = firebase.app(appName);
        this.paths = paths;
        this.parseRefUrl=parseRefUrl;

        this.database = firebase.database(this.app);
        this.database.$ref = function (refUrl, options) {
            return queryRef(self.app, refUrl, options);
        };

        var storage = firebase.storage(this.app);
        this.storage = storage;
        this.storage.$ref = function (refUrl, params) {
            return storage.ref(parseRefUrl(refUrl, params));
        };

        this.auth = firebase.auth(this.app);
    }

    function parseRefUrl(refUrl, params) {
        var res = refUrl;
        if (paths[refUrl]) {
            res = paths[refUrl];
            if (typeof params === 'object') {
                var _params = params.params || params;
                for (var key in _params) {
                    res = res.replace(':' + key, _params[key]);
                }
            }
        }
        return res
    }

    function formalizeKey(key) {
        var res = key, replace = [[/\./g, '^%0'], [/#/g, '^%1'], [/\$/g, '^%2'], [/\[/g, '^%3'], [/\]/g, '^%4']];
        for (var i = 0; i < replace.length; i++) {
            res = res.replace(replace[i][0], replace[i][1]);
        }
        // ".", "#", "$", "/", "[", or "]"
        return res;
    }

    function queryRef(app, refUrl, options) {
        var opt = options || {},
            ref, database = app.database() || firebase.database();
        if (refUrl.search('://') !== -1) {
            ref = database.refFromURL(parseRefUrl(refUrl));
        } else {
            ref = database.ref(parseRefUrl(refUrl, opt.params || {}));
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
    }

    var fbUtil = new FirebaseUtil(fbconfig);

    return FirebaseUtil
})(firebase);


if (typeof define === 'function' && define.amd) {
    define(function () { return FirebaseUtil; });
} else if( typeof module !== 'undefined' && module != null ) {
    module.exports = FirebaseUtil
}
