(function () {
    'use strict';
    var m;
    try{
        m=angular.module('app.plugins');
    }catch(e){
        m = angular.module('app.plugins',[]);
    }

    m
        .controller('AllpayCtrl', AllpayCtrl);

    ////
    /* @ngInject */
    function AllpayCtrl(ngCart, $auth, $firebase, $mdMedia, $timeout, $sce) {
        var vm = this;
        var siteName = _core.util.site.siteName;

        vm.order = {
            buyer: {},
            items:{},
            shipping: {},
            payment: {}
        };

        // function updateOrderData() {
        //     vm.order.items = {};
        //     $ngCart.$cart.items.forEach(function (item) {
        //         vm.order.items[item.getId()] = item.toObject();
        //     });
        //     vm.order.vendor.id = siteName;
        //     vm.order.buyer.id = $auth.currentUser.uid;
        //
        //     return new Promise(function (resolve, reject) {
        //         $firebase.ref('site-config-payment?provider=allpay').child('private').once('value', function (snap) {
        //             var publicPaymentConf = snap.val();
        //             var pricePromise;
        //             if (publicPaymentConf && publicPaymentConf.calcPrice) {
        //                 eval('pricePromise=new Promise(function(resolve,reject){' + publicPaymentConf.calcPrice + '})')
        //             } else {
        //                 var amount = 0;
        //                 angular.forEach(vm.order.items, function (item) {
        //                     amount += (item.quantity * item.price);
        //                 });
        //                 pricePromise = Promise.resolve(amount);
        //             }
        //         });
        //         pricePromise.then(function (totalAmount) {
        //             vm.order.payment = {
        //                 provider: 'allpay',
        //                 totalAmount: totalAmount,
        //                 allpay: buildAllpayParams()
        //             };
        //             resolve();
        //         });
        //     });
        // }

        // _core.syncTime().then(function (getTime) {
        //     getCurrentTime = getTime;
        //     updateOrderData().then(function () {
        //         $timeout(angular.noop, 0)
        //     });
        // });

        function buildAllpayParams(opt) {
            var items = vm.order.items || {},
                _opt = opt || {};

            //for description
            var itemName = '';
            for (var key in items) {
                itemName = itemName + (_opt.namePrefix || '') + items[key].name + (_opt.namePostfix || ' ') + (_opt.pricePrefix || '$') + items[key].price + (_opt.pricePostfix || '') + (_opt.quantityPrefix || '*') + items[key].quantity + (_opt.quantityPostfix || '') + '#'
            }
            // itemName = itemName.slice(0, -1);


            // return paymentParams;
            // var date = moment(_core.getSyncTime()).format('YYYY/MM/DD HH:mm:ss');

            var paymentParams = {
                // ReturnURL: "http://131.193.191.5/planAllpayReceive?sitename=" + siteName + '&uid=' + $auth.currentUser.uid,
                // PaymentInfoURL: "http://131.193.191.5/allpayPaymentInfo?sitename=" + siteName + '&uid=' + $auth.currentUser.uid,
                // MerchantTradeDate: date,
                // ChoosePayment: 'Credit',
                // PeriodAmount: plan.periodAmount,
                // TotalAmount: getTotalAmount(plan, currentPlan),
                // PeriodType:'M',
                // Frequency:1,
                // ExecTimes:99,
                PaymentType: 'aio'
            };

            if ($mdMedia('xs')) {
                paymentParams.DeviceSource = 'M'
            } else {
                paymentParams.DeviceSource = 'P'
            }
            paymentParams.ItemName = paymentParams.ItemName || itemName || 'required, please set a value';
            paymentParams.MerchantTradeNo = vm.order.id;

            return paymentParams;
        }

        function getOrderData() {
            vm.order.id = vm.order.id || _core.getSyncTime();
            ngCart.getItems().forEach(function (item) {
                vm.order.items[item.getId()] = item.toObject();
            });
            vm.order.buyer.id = $auth.currentUser.uid;
            vm.order.siteName = siteName;
            vm.order.payment = {
                provider: 'allpay',
                allpay: buildAllpayParams()
            };
            return vm.order;
        }

        function buildRequest(orderData) {
            var req = {payment: {allpay: {}}};
            var str = JSON.stringify(orderData).replace('undefined','null');
            var _orderData = JSON.parse(str);
            angular.extend(req, _orderData);

            req['_state'] = 'allpay_gen_check_mac';
            return req;
        }

        vm.getCheckMacValue=getCheckMacValue;
        function getCheckMacValue() {
            return new Promise(function (resolve, reject) {
                getOrderData();
                var taskRef = $firebase.queryRef('queue-task?id=' + vm.order.id);
                taskRef.set(buildRequest(vm.order))
                    .then(function () {
                        var listener = function (snap) {
                            if (snap.val() && snap.val().payment.allpay.CheckMacValue) {
                                vm.order.payment = snap.val().payment;
                                $timeout(angular.noop, 0);

                                vm.formAction = $sce.trustAsResourceUrl('https://payment'+(vm.order.payment.stage? '-stage':'')+'.allpay.com.tw/Cashier/AioCheckOut');

                                taskRef.off('value', listener);
                                console.log(vm.order);
                                resolve(vm.order);
                            }
                        };
                        taskRef.on('value', listener)
                    });
            });
        }
        // function buildRequest(orderData) {
        //     var req = {payment: {allpay: {}}};
        //     angular.extend(req, orderData);
        //
        //     if ($mdMedia('xs')) {
        //         req.payment.allpay.DeviceSource = 'M'
        //     } else {
        //         req.payment.allpay.DeviceSource = 'P'
        //     }
        //     req.id = orderData.id || orderData.payment.allpay.MerchantTradeNo;
        //     req.siteName = sitesService.siteName;
        //     req.payment.provider = 'allpay';
        //     req['_state'] = 'allpay_gen_check_mac';
        //     return snippets.rectifyUpdateData(req);
        // }
        vm.submit = function () {
            var e = document.getElementsByName('allpay-checkout');
            e[0].submit();
        };
    }

})();
