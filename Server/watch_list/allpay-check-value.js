var config = require('../config'),
    allpay = require('../lib/allpay');

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