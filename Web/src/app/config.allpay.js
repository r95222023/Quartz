(function () {
    'use strict';

    angular
        .module('app')
        .config(/* @ngInject */ function ($allpayProvider) {
            $allpayProvider.isStage(true);
            //default
            //$allpayProvider.setParams({
            //    MerchantID: '2000132',
            //    PaymentType: "aio",
            //    ReturnURL: "http://131.193.191.9/allpayReceive",
            //    PaymentInfoURL: "http://131.193.191.9/allpayPaymentInfo",
            //    ChoosePayment: "ALL",
            //    NeedExtraPaidInfo: "Y",
            //    TradeDesc: "required, please set a value."
            //});
        })
})();
