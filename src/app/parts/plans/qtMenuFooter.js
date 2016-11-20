(function() {
    'use strict';

    angular
        .module('quartz.directives')
        .directive('qtMenuFooter', qtPlan);

    /* @ngInject */
    function qtPlan($timeout,$firebase,$mdDialog) {
        var directive = {
            link: link,
            templateUrl: 'app/parts/plans/menu-footer.html',
            restrict: 'E'
        };
        return directive;

        function link($scope, $element, attrs) {
            $scope.onChangeBillingClick=onChangeBillingClick;
        }

        function onChangeBillingClick(ev) {
            var promises = [
                $firebase.queryRef('plans?type=list').once('value'),
                $firebase.queryRef('plans?type=feature').once('value')
            ];
            Promise.all(promises).then(function(res){
                $mdDialog.show({
                    controller: ChangeBillingDialogCtrl,
                    templateUrl: 'app/parts/plans/billing-dialog.tmpl.html',
                    parent: angular.element(document.body),
                    locals: {
                        plans: res[0].val(),
                        features: res[1].val()
                    },
                    // targetEvent: ev,
                    clickOutsideToClose: true
                });
            });
        }

        /* @ngInject */
        function ChangeBillingDialogCtrl($scope, $mdDialog, plans, features) {
            $scope.features = features;
            $scope.selectPlan = function (plan) {
                $scope.selectedplan = plan;
            };
            $scope.deselectPlan = function () {
                $scope.selectedplan = false;
            };

            $scope.confirm = function(){
                $scope.$emit('plans:confirm',{paymentProvider:$scope.paymentProvider,plan:$scope.selectedplan})
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
    }

})();
