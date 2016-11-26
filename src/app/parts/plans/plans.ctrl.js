(function () {
    'use strict';

    angular
        .module('app.parts.plans')
        .controller('PlanDialogCtrl', PlanDialogCtrl)
        .controller('PlanRefillCtrl', PlanRefillCtrl);

    /* @ngInject */
    function PlanDialogCtrl($scope, $mdDialog, mode, plans, features, currentPlan,getSyncTime) {
        $scope.features = features;
        $scope.currentPlan = currentPlan;

        toMode(mode);
        $scope.selectPlan = function (plan) {
            $scope.selectedplan = plan;
            toMode('confirm');
        };
        $scope.toSelectMode = function () {
            toMode('select');
        };
        $scope.toMode = toMode;
        function toMode(to) {
            $scope.mode = to;
            delete $scope.selectedMethod;
        }

        $scope.isCurrentPlan = function (plan) {
            return plan.pid == currentPlan.pid
        };

        $scope.isRefillable = function (currentPlan) {
            var now = getSyncTime(),
                billingTime = currentPlan.billingTime;
            switch (currentPlan.period) {
                case 'M':
                    return billingTime && now > (billingTime + 27 * 24 * 60 * 60000);
                    break;
            }
        };


        $scope.paymentMethods = ['allpay', 'stripe'];
        $scope.onMethodChange = function () {
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.plans = plans;

        //
        // $firebase.queryRef('plans?type=feature').update({
        //     f1: {desc: '有資料庫、儲存空間、代管服務和 Test Lab 使用量配額'},
        //     f2: {desc: '您的專案可使用更多 Google Cloud Platform 功能'},
        //     f3: {desc: '所有方案皆包含數據分析通知、當機報告和支援等服務'}
        // });
    }

    /* @ngInject */
    function PlanRefillCtrl($scope, $mdDialog) {
        var refill = this;
    }
})();
