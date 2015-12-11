(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('Pay2goTestController', Pay2goTestController);

    /* @ngInject */
    function Pay2goTestController($firebase, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        vm.order={
            MerchantID:"C043213086",
            RespondType:"JSON",
            CheckValue:"hjfajs;djfk;alsjdk;fllh",
            TimeStamp:"",
            Version:"",
            LangType:"",
            MerchantOrderNo:"201406010001",
            Amt:"",
            ItemDesc:"",
            TradeLimit:"600",
            ExpireDate:"",
            ReturnURL:"https://quartz.firebaseapp.com/#!/home",
            NotifyURL:"",
            CustomerURL:"",
            ClientBackURL:"https://quartz.firebaseapp.com/#!/home",
            Email:"u910328@gmail.com",
            EmailModify:"",
            LoginType:0,
            OrderComment:"",
            CREDIT:"",
            CreditRed:"",
            InstFlag:"",
            UNIONPAY:"",
            WEBATM:"",
            VACC:"",
            CVS:"",
            BARCODE:"",
            CUSTOM:""
        }
    }
})();
