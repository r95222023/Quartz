(function (firebase) {
    'use strict';
    window._core = window._core||{};
    window._core.FirebaseUtil = FirebaseUtil;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return FirebaseUtil;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = FirebaseUtil
    }

    //parse siteName -> get preload data of that site
    var site = 'sites/detail/:siteName',
        user = site + '/users/detail/:userId',
        paths = {
            'servers': 'servers',
            'queue': 'queue',
            'queue-tasks': 'queue/tasks',
            'query-request': 'query/request',
            'query-response': 'query/response',
            'query-specs': 'query/specs',
            'query-cache': 'query/cache',
            'sites': 'sites/:type',
            'site': 'sites/:type/:siteName',
            'site-config-payment': 'sites/detail/:siteName/config/payment/:provider/:privacy',
            'templates':'templates/:type',
            'users-site': site + '/users/:type/:userId',
            'my-sites':'users/detail/:uid/sites',
            'pages':site+'/pages/:type',
            'page':site+'/pages/:type/:id',
            'page-property':site+'/pages/:type/:id/:property',
            'widgets':site+'/widgets/:type',
            'widget':site+'/widgets/:type/:id',
            'products': site + '/products/:type',
            'product': site + '/products/:type/:id',
            'articles': site + '/articles/:type',
            'article': site + '/articles/:type/:id',
            'orders': site + '/orders/:type',
            'order-payment': site + '/orders/:type/:orderId/payment',
            'user-order-payment': user + '/orders/:type/:orderId/payment',
            'order-payment-allpay': site + '/orders/detail/:orderId/payment/allpay'
        };


    var fbconfigDefault = {
        apiKey: "AIzaSyAfxA30u_wPOkVCn727MJXZ4eFhg4raKdI",
        authDomain: "quartz.firebaseapp.com",
        databaseURL: "https://quartz.firebaseio.com",
        storageBucket: "project-3415547818359859659.appspot.com",
        appName: 'quartz'
    };

    function FirebaseUtil(fbconfig) {
        var _fbconfig = fbconfig || fbconfigDefault,
            appName = _fbconfig.appName || _fbconfig.databaseURL;
        //constructor
        this.app = firebase.initializeApp(_fbconfig, appName);
        this.paths = _fbconfig.paths || paths;

        this.database = new window._core.DatabaseUtil(this);
        this.storage = new window._core.StorageUtil(this);


        this.auth = firebase.auth(this.app);
    }

    FirebaseUtil.prototype.parseRefUrl = function (refUrl, option) {
        var res = refUrl,
            opt= typeof option==='object'? option.params ||option:{},
            params = Object.assign({}, opt),
            refUrlAndParams=refUrl.split('?'),
            stringParams = (refUrlAndParams[1]||'').split('&');
        if(stringParams[0]!==''){
            stringParams.forEach(function(val){
                var hash = val.split('=');
                params[hash[0]]=hash[1];
            })
        }
        if (this.paths[refUrlAndParams[0]]) {
            res = this.paths[refUrlAndParams[0]];

            for (var key in params) {
                res = res.replace(':' + key, params[key + '']);
            }
        }
        return res
    };

    FirebaseUtil.prototype.getSiteName = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            var url = location.href,
                domain = url.split('://')[1].split('/')[0];

            self.database.queryRef('sites', {params: {type: 'list'}, orderBy: 'Child: domain', equalTo: domain, limitToFirst:1})
                .once('child_added', function(snap){
                    var val = snap.val();
                    if(!!val&&val.siteName) {
                        resolve(val.siteName);
                    } else {
                        resolve(url.split('#!/')[1].split('/')[0]);
                    }
                })
        })
    };

    function formalizeKey(key) {
        var res = key, replace = [[/\./g, '^%0'], [/#/g, '^%1'], [/\$/g, '^%2'], [/\[/g, '^%3'], [/\]/g, '^%4']];
        for (var i = 0; i < replace.length; i++) {
            res = res.replace(replace[i][0], replace[i][1]);
        }
        // ".", "#", "$", "/", "[", or "]"
        return res;
    }



})(firebase);



