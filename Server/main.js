var init = require('./lib/init'),
    auth = require('./lib/auth'),
//regServer = require('./lib/regServer'),
//loadSetup = require('./lib/loadSetup'),
    q = require('q'),
    watch = require('./lib/watch'),
    firebaseUtil = require('./lib/firebaseUtil'),
    config = require('./config');

//init() //檢查config是否正確
//    .then(auth)
//    .then(regServer)
//    .then(loadSetup)
//    .then(watch);
//


auth().then(function () {

    var watchList = [
        {
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
        }
    ];
    watch(watchList);
});