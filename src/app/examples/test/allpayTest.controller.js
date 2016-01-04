(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('AllpayTestController', AllpayTestController);

    /* @ngInject */
    function AllpayTestController(CryptoJS, $timeout, $firebase, $rootScope, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;

        vm.merchant = {
            id: "2000132",
            hashKey: "5294y06JbISpM5x9",
            hashIV: "v77hoKGq4kWxNNIS"
        };

        vm.orderChange = function () {
            delete vm.order['CheckMacValue'];
        };
        vm.merchantChange = function () {
            vm.order.MerchantID = vm.merchant.id;
        };

        vm.getCheckValueLocaly = function (/*HashKey, HashIV, data*/) {
            var HashKey = vm.merchant.hashKey,
                HashIV = vm.merchant.hashIV,
                data = vm.order;
            if (data['CheckMacValue']) delete data['CheckMacValue'];
            var keys = Object.keys(data);
            keys.sort();
            var uri = 'HashKey=' + HashKey;
            for (var i = 0; i < keys.length; i++) {
                /*if(data[keys[i]]!=='')*/
                uri = uri + '&' + keys[i] + '=' + data[keys[i]];
            }
            uri = uri + '&HashIV=' + HashIV;
            vm.check = {};
            vm.check.chkstr = uri;

            uri = encodeURIComponent(uri);
            var regex;
            var find = ["%2d", "%5f", "%2e", "%21", "%2a", "%28", "%29", "%20"],
                replace = ["-", "_", ".", "!", "*", "(", ")", "+"];
            for (var j = 0; j < find.length; j++) {
                regex = new RegExp(find[j], "g");
                uri = uri.replace(regex, replace[j]);
            }
            uri = uri.toLowerCase();
            var checked_uri = CryptoJS.MD5(uri).toString().toUpperCase();

            vm.check.chkuristr = uri;
            vm.check.chkvalue = checked_uri;
            data['CheckMacValue'] = checked_uri;
            return checked_uri;
        };

        function to2dig(num) {
            return num < 10 ? ('0' + num) : num;
        }


        //vm.order['CheckMacValue'] = vm.getCheckValue(HashKey, HashIV, vm.order);

        vm.getCheckValueRemotely = function () {
            var data = {
                id:vm.order.MerchantTradeNo,
                payment: {
                    type:'allpay',
                    allpay: vm.order
                }
            };
            if ($rootScope.user) {
                data.clientInfo = {
                    uid: $rootScope.user.uid
                }
            }
            $firebase.request({
                request: [{
                    refUrl: 'orders/' + vm.order.MerchantTradeNo,
                    value: data
                }],
                response: {
                    checkMacValue: 'orders/' + vm.order.MerchantTradeNo + '/payment/allpay/CheckMacValue'
                }
            }).then(function (res) {
                vm.order['CheckMacValue'] = res.checkMacValue;
            }, function (error) {
                console.log(error);
            });
            //$firebase.update('orders/'+ vm.order.MerchantTradeNo+'/payment/allpay', vm.order)
        };

        vm.refresh = function () {
            var now = new Date(),
                month = to2dig(now.getMonth() + 1),
                day = to2dig(now.getDate()),
                hour = to2dig(now.getHours()),
                min = to2dig(now.getMinutes()),
                sec = to2dig(now.getSeconds()),
                date = now.getFullYear() + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec;

            if (vm.orderFbRef) vm.orderFbRef.off();
            vm.check = {};
            vm.allpayReturn = false;
            vm.order = {
                MerchantID: vm.merchant.id,
                MerchantTradeDate: date,
                MerchantTradeNo: now.getTime(),
                TotalAmount: "100",
                PaymentType: "aio",
                TradeDesc: "交易測試(測試)",
                ItemName: "交易測試(測試)",
                ReturnURL: "http://104.196.19.150/allpayReceive",
                PaymentInfoURL: "http://104.196.19.150/allpayPaymentInfo",
                ChoosePayment: "ALL",
                NeedExtraPaidInfo: "Y",
                DeviceSource: "P"
                // Alipay 必要參數
                //AlipayItemName: "交易測試(測試)",
                //AlipayItemCounts: 1,
                //AlipayItemPrice: "100",
                //Email: "stage_test@allpay.com.tw",
                //PhoneNo: "0911222333",
                //UserName: "Stage Test"
            };
            vm.data = {payment: {allpay: vm.order}};
            vm.orderFbRef = $firebase.ref('orders/' + vm.order.MerchantTradeNo + '/payment/allpay')
            vm.orderFbRef.on('value', function (snap) {
                $timeout(function () {
                    vm.check = {};
                    vm.allpayReturn = snap.val();
                }, 0);
            });
        };

        vm.refresh();

        vm.submit = function () {
            // send data to firebase;
            var e = document.getElementsByName('allpayOrder');
            e[0].submit();
        }
    }
})();
