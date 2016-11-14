(function() {
    'use strict';

    angular
        .module('quartz.components')
        .controller('MenuController', MenuController);

    /* @ngInject */
    function MenuController(sitesService, qtLayout,$mdDialog) {
        var vm = this;
        vm.layout = qtLayout.layout;
        vm.siteSettings = sitesService;
        vm.toggleIconMenu = toggleIconMenu;
        vm.onChangeBillingClick = onChangeBillingClick;



        ////////////
        function toggleIconMenu() {
            var menu = vm.layout.sideMenuSize === 'icon' ? 'full' : 'icon';
            qtLayout.setOption('sideMenuSize', menu);
        }

        function onChangeBillingClick(ev) {
            $mdDialog.show({
                controller: ChangeBillingDialogCtrl,
                templateUrl: 'app/quartz/components/menu/billing-dialog.tmpl.html',
                parent: angular.element(document.body),
                // targetEvent: ev,
                clickOutsideToClose: true
            });
        }
    }

    /* @ngInject */
    function ChangeBillingDialogCtrl($scope) {
        var features = [
            '有資料庫、儲存空間、代管服務和 Test Lab 使用量配額',
            '您的專案可使用更多 Google Cloud Platform 功能',
            '所有方案皆包含數據分析、通知、當機報告和支援等服務'
        ];
        $scope.cards=[
            {title:'Free', desc:'免費，每個月 $0 美元',features:features},
            {title:'Sparks', desc:'固定價格，每個月 $25 美元',features:features},
            {title:'Pay as You go', desc:'用多少，付多少',features:features}
        ];
    }
})();
