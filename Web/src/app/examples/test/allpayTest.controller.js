(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('AllpayTestController', AllpayTestController);

    /* @ngInject */
    function AllpayTestController(CryptoJS, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;

        vm.getCheckValue = function (HashKey, HashIV, data) {
            delete data['CheckValue'];
            var keys = Object.keys(data);
            keys.sort();
            var uri = 'HashKey=' + HashKey;
            for (var i = 0; i < keys.length; i++) {
                /*if(data[keys[i]]!=='')*/
                uri = uri + '&' + keys[i] + '=' + data[keys[i]];
            }
            uri = uri + '&HashIV=' + HashIV;
            vm.chkstr = uri;

            uri = encodeURIComponent(uri);
            var regex;
            var find = ["%2d", "%5f", "%2e", "%21", "%2a", "%28", "%29", "%20"],
                replace = ["-", "_", ".", "!", "*", "(", ")", "+"];
            for (var j = 0; j < find.length; j++) {
                regex = new RegExp(find[i], "g");
                uri = uri.replace(regex, replace[i]);
            }
            uri = uri.toLowerCase();
            var checked_uri = CryptoJS.SHA256(uri).toString().toUpperCase();

            vm.chkuristr = uri;
            vm.chkvalue = checked_uri;
            return checked_uri;
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
