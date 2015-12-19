(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('Pay2goTestController', Pay2goTestController);

    /* @ngInject */
    function Pay2goTestController($firebase, CryptoJS, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        vm.getCheckValue = function (HashKey, HashIV, data) {
            delete data['CheckValue'];
            var keys = Object.keys(data);
            keys.sort();
            var check_str = 'HashKey=' + HashKey;
            for (var i = 0; i < keys.length; i++) {
                /*if(data[keys[i]]!=='')*/
                check_str = check_str + '&' + keys[i] + '=' + data[keys[i]];
            }
            check_str = check_str + '&HashIV=' + HashIV;
            vm.chkstr = check_str;
            var checked_str = CryptoJS.SHA256(check_str).toString().toUpperCase();
            vm.chkvalue = checked_str;
            return checked_str;
        };

        var now = Math.floor((new Date()).getTime() / 1000),
            HashKey = 'BjpD8H94QhzjaQZ28FN17LPBlCqd5mUG',
            HashIV = 'FjkN1uSRLrbVibXr';
        vm.order = {
            MerchantID: "31201874",
            RespondType: "Json",
            TimeStamp: "1449904196",
            Version: "1.2",
            //LangType: "zh-tw",
            MerchantOrderNo: "1449904196",
            Amt: "40",
            //ItemDesc: "測試商品",
            //TradeLimit: "600",
            //ExpireDate: "",
            //ReturnURL: "https://quartz.firebaseapp.com/#!/home",
            //NotifyURL: "",
            //CustomerURL: "",
            //ClientBackURL: "https://quartz.firebaseapp.com/#!/home",
            //Email: "u910328@gmail.com",
            //EmailModify: "",
            LoginType: 0,
            //OrderComment: "",
            //CREDIT: "",
            //CreditRed: "",
            //InstFlag: "",
            //UNIONPAY: "",
            //WEBATM: "",
            //VACC: "",
            //CVS: "",
            //BARCODE: "",
            //CUSTOM: ""
        };
        vm.order['CheckValue'] = vm.getCheckValue(HashKey, HashIV, vm.order);
    }
})();
