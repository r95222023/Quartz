var config = require('../config'),
    Allpay = require('../lib/allpay'),
    allpay = new Allpay({
        merchantID: config.ALLPAY.MERCHANT_ID,
        hashKey: config.ALLPAY.HASH_KEY,
        hashIV: config.ALLPAY.HASH_IV,
        debug: config.ALLPAY.DEBUG
    });

module.exports = {
    refUrl: config.FBURL + '/orders',
    tasks: {
        "orders": ['snapshot', function (snapshot) {
            console.log('order: ' + snapshot.key());
            var orderSnapshot = snapshot.child('payment/allpay');
            orderSnapshot.ref().update({
                MerchantTradeNo: snapshot.key(),
                CheckMacValue: allpay.genCheckMacValue(orderSnapshot.val())
            })
        }]
    }
};