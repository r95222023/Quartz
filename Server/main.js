var init = require('./lib/init'),
    auth = require('./lib/auth'),
//regServer = require('./lib/regServer'),
//loadSetup = require('./lib/loadSetup'),
    q = require('q'),
    execPhp = require('./lib/php/execPhp'),
    watch = require('./lib/watch'),
    firebaseUtil = require('./lib/firebaseUtil'),
    Allpay = require('./lib/allpay'),
    config = require('./config');

var allpay = new Allpay({
    merchantID: config.ALLPAY.MERCHANT_ID,
    hashKey: config.ALLPAY.HASH_KEY,
    hashIV: config.ALLPAY.HASH_IV,
    debug: config.ALLPAY.DEBUG
});

//init() //檢查config是否正確
//    .then(auth)
//    .then(regServer)
//    .then(loadSetup)
//    .then(watch);
//


auth().then(function () {

    var watchList = [
        /*{
            refUrl: 'https://lauchbox.firebaseio.com/products',
            tasks: {
                'product': ['snapshot', function (snapshot) {
                    var def = q.defer();
                    firebaseUtil.ref(config.FBURL + 'products/' + snapshot.val().itemId)
                        .once('value', function (snap) {
                            def.resolve(snap.val());
                        });
                    return def.promise
                }],
                'test': ['snapshot', 'product', function (snapshot, product) {
                    console.log('res', snapshot.val());

                    console.log('res', product);
                }]
            }
        }, */{
            refUrl: config.FBURL + '/orders',
            tasks: {
                "orders": ['snapshot', function (snapshot) {
                    console.log('order: '+snapshot.key());
                    var orderSnapshot = snapshot.child('payment/allpay');
                    orderSnapshot.ref().update({
                        MerchantTradeNo: snapshot.key(),
                        CheckMacValue: allpay.genCheckMacValue(orderSnapshot.val())
                    })
                }]
            }
        }
    ];
    watch(watchList);
    //execPhp('test.php').then(function(php, outprint){
    //    console.log(outprint);
    //    console.log(php);
    //}, function(error){
    //    console.log(error);
    //})
});