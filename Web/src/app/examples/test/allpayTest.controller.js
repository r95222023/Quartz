(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('AllpayTestController', AllpayTestController);

    /* @ngInject */
    function AllpayTestController(CryptoJS, $firebase, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;

        vm.merchant={
            id:"2000132",
            hashKey:"5294y06JbISpM5x9",
            hashIV:"v77hoKGq4kWxNNIS"
        };

        vm.orderChange= function () {
            delete vm.order['CheckMacValue'];
        };
        vm.merchantChange= function () {
            vm.order.MerchantID=vm.merchant.id;
        };

        vm.getCheckValueLocaly = function (/*HashKey, HashIV, data*/) {
            var HashKey =vm.merchant.hashKey,
                HashIV=vm.merchant.hashIV,
                data=vm.order;
            if(data['CheckMacValue']) delete data['CheckMacValue'];
            var keys = Object.keys(data);
            keys.sort();
            var uri = 'HashKey=' + HashKey;
            for (var i = 0; i < keys.length; i++) {
                /*if(data[keys[i]]!=='')*/
                uri = uri + '&' + keys[i] + '=' + data[keys[i]];
            }
            uri = uri + '&HashIV=' + HashIV;
            vm.check={};
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
            data['CheckMacValue']=checked_uri;
            return checked_uri;
        };

        function to2dig(num){
            return num < 10 ? ('0'+num): num;
        }


        //vm.order['CheckMacValue'] = vm.getCheckValue(HashKey, HashIV, vm.order);

        vm.getCheckValueRemotely = function () {
            $firebase.request({
                request: [{
                    refUrl: 'orders/'+vm.order.MerchantTradeNo+'/payment/allpay',
                    value: vm.order
                }],
                response: {
                    checkMacValue: 'orders/'+vm.order.MerchantTradeNo+'/payment/allpay/CheckMacValue'
                }
            }).then(function (res) {
                console.log('test');
                console.log(res);
                vm.order['CheckMacValue']=res.checkMacValue;
            }, function (error) {
                console.log(error);
            });
            //$firebase.update('orders/'+ vm.order.MerchantTradeNo+'/payment/allpay', vm.order)
        };

        vm.refresh= function () {
            var now = new Date(),
                hour = to2dig(now.getHours()),
                min = to2dig(now.getMinutes()),
                sec = to2dig(now.getSeconds()),
                date = now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + ' ' + hour + ':' + min + ':' + sec;

            vm.check={};
            vm.order = {
                MerchantID: vm.merchant.id,
                MerchantTradeDate: date,
                MerchantTradeNo: now.getTime(),
                TotalAmount: "100",
                PaymentType: "aio",
                TradeDesc: "交易測試(測試)",
                ItemName: "交易測試(測試)",
                ReturnURL: "http://131.193.191.13/allpayAIO",
                ChoosePayment: "ALL",
                NeedExtraPaidInfo: "Y"
                // Alipay 必要參數
                //AlipayItemName: "交易測試(測試)",
                //AlipayItemCounts: 1,
                //AlipayItemPrice: "100",
                //Email: "stage_test@allpay.com.tw",
                //PhoneNo: "0911222333",
                //UserName: "Stage Test"
            };
        };

        vm.refresh();
    }
})();
