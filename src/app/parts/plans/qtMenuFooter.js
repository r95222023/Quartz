(function() {
    'use strict';

    angular
        .module('app.parts.plans')
        .directive('qtMenuFooter', qtPlan);

    /* @ngInject */
    function qtPlan(sitesService,$firebase,$mdDialog) {
        var directive = {
            link: link,
            templateUrl: 'app/parts/plans/menu-footer.html',
            restrict: 'E'
        };

        var freePlan = {
            pid:'p1',
            desc: '免費，每個月 $0 美元',
            features:{f1:1},
            title:'Obsidian'
        };

        return directive;

        function link($scope, $element, attrs) {
            $scope.onChangeBillingClick=onChangeBillingClick;
        }

        function onChangeBillingClick(mode) {
            var promises = [
                $firebase.queryRef('plans?type=list').once('value'),
                $firebase.queryRef('plans?type=feature').once('value'),
                $firebase.queryRef('plans?type=sites').child(sitesService.siteName).once('value'),
                _core.syncTime()
            ];
            Promise.all(promises).then(function(res){
                $mdDialog.show({
                    mode:mode,
                    controller: 'PlanDialogCtrl',
                    templateUrl: 'app/parts/plans/plans-dialog.tmpl.html',
                    parent: angular.element(document.body),
                    locals: {
                        plans: res[0].val(),
                        features: res[1].val(),
                        currentPlan:res[2].val()||freePlan,
                        getSyncTime:res[3]
                    },
                    // targetEvent: ev,
                    clickOutsideToClose: true
                });
            });
        }
    }

})();
