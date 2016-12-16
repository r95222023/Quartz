(function () {
    'use strict';

    angular
        .module('app.parts.plans')
        .controller('BillingHistoryCtrl', BillingHistoryCtrl)
        .controller('PlanDialogCtrl', PlanDialogCtrl)
        .controller('PlanRefillCtrl', PlanRefillCtrl);

    /* @ngInject */
    function BillingHistoryCtrl($firebase, $scope, $mdDialog) {
        var bh = this;
        bh.paginator = $firebase.pagination('users?type=bills/list', {}, function () {
            $timeout(function () {
            }, 0)
        });

        //Test
        // vm.paginator = $firebase.pagination('pages?type=list',{}, function(){$timeout(function(){},0)});

        //initiate
        bh.paginator.size = 25;
        bh.paginator.onReorder('name');

        bh.onPaginate = function (page, size) { //to prevent this being overwritten
            bh.paginator.get(page, size)
        };
        bh.onReorder = function (orderBy) {
            bh.paginator.onReorder(orderBy);
        }
    }

    /* @ngInject */
    function PlanDialogCtrl($firebase, sitesService, $mdDialog, mode, plans, features, sitePlan, getSyncTime) {
        var pd = this;
        pd.features = features;
        pd.sitePlan = sitePlan;
        pd.selectPlan = function (plan) {
            pd.selectedPlan = plan;
            toMode('confirm');
        };
        // $scope.toSelectMode = function () {
        //     toMode('select');
        // };
        pd.toMode = toMode;
        toMode(mode);
        function toMode(mode) {
            pd.mode = mode;
            pd.selectedMethod=false;
        }

        pd.isDowngrade = function () {
            return pd.selectedPlan.pid < sitePlan.pid
        };

        pd.confirmDowngrade = function () {
            $firebase.queryRef('plans?type=sites').child('list/' + sitesService.siteName + '/preChangeTo')
                .set(pd.selectedPlan.pid).then(pd.cancel);
        };

        pd.isCurrentPlan = function (plan) {
            return plan.pid ==  (sitePlan.preChangeTo ||sitePlan.pid)
        };

        pd.isRefillable = function () {
            var now = getSyncTime(),
                dueTime = sitePlan.endAt,
                refill;
            switch (sitePlan.period) {
                case 'M':
                    refill = dueTime && now < dueTime && now > moment(dueTime).subtract(7, 'days').valueOf();
                    break;
            }
            return refill
        };


        pd.paymentMethods = ['allpay', 'stripe'];

        pd.cancel = function () {
            $mdDialog.cancel();
        };
        pd.plans = plans;

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
