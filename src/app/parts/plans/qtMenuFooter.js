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
            var promises = [
                $firebase.queryRef('plans?type=list').once('value'),
                $firebase.queryRef('plans?type=feature').once('value'),
                _core.syncTime()
            ];
            $firebase.queryRef('plans?type=sites/list').child(sitesService.siteName).on('value',function(snap){
                var sitePlan = snap.val()||freePlan;
                promises[0].then(function(listSnap){
                    $scope.sitePlan = angular.extend({}, listSnap.val()[sitePlan.pid],sitePlan);
                });
            });
            $scope.onChangeBillingClick=function(mode){
                Promise.all(promises).then(function(res){
                    $mdDialog.show({
                        mode:mode,
                        controller: 'PlanDialogCtrl',
                        controllerAs: 'pd',
                        templateUrl: 'app/parts/plans/plans-dialog.tmpl.html',
                        parent: angular.element(document.body),
                        locals: {
                            plans: res[0].val(),
                            features: res[1].val(),
                            sitePlan:$scope.sitePlan,
                            getSyncTime:res[2]
                        },
                        // targetEvent: ev,
                        clickOutsideToClose: true
                    });
                });
            };
        }
    }

})();
