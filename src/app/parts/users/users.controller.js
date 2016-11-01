(function () {
    'use strict';

    angular
        .module('app.parts.users')
        .controller('AllUsersController', AllUsersController)
        .controller('SiteUsersController', SiteUsersController)
        .controller('AdminsController', AdminsController);

    /* @ngInject */
    function AllUsersController($firebase, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;
        vm.paginator = $firebase.pagination('users?type=list');
        vm.paginator.onReorder('name');

        usersCtrl(vm);
    }

    /* @ngInject */
    function SiteUsersController($firebase, $mdMedia, $state, $mdDialog, config) {
        var vm = this;
        vm.paginator = $firebase.pagination("site-users?type=list");
        vm.paginator.onReorder('name');

        usersCtrl(vm);

        vm.showDetail= function(ev, uid){
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));

            $mdDialog.show({
                controller: DetailDialogCtrl,
                controllerAs: 'detail',
                templateUrl: 'app/parts/users/user-data-dialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: useFullScreen
            })
                .then(function (onComplete) {
                    if (angular.isFunction(onComplete)) onComplete();
                }, function (onCancel) {
                    if (angular.isFunction(onCancel)) onCancel();
                });

            function DetailDialogCtrl(){
                var detail=this;
                detail.uid=uid;
                detail.cancel = function () {
                    $mdDialog.cancel();
                };
            }
        }
    }

    /* @ngInject */
    function AdminsController($firebase, $stateParams, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;
        vm.paginator = $firebase.pagination("site-users?type=list", {equalTo: true});
        vm.paginator.onReorder('access.read');
        usersCtrl(vm);

        vm.actions = [
            ['allowWrite', 'USERS.ALLOWWRITE']
        ];
    }


    function usersCtrl(vm) {
        vm.userClasses=['super-admin','admin', 'vendor'];

        vm.filters = [
            ['User Id', ''],
            ['Name', 'info.name']
        ];


        vm.setAs = function (uid, className) {
            //
        };


        vm.onPaginate = function (page, size) { //to prevent this being overwritten
            vm.paginator.get(page, size)
        };

        vm.onReorder = function (orderBy) {
            vm.paginator.onReorder(orderBy);
        };

        vm.getFiltered = function () {
            vm.paginator.onReorder({orderBy: vm.orderBy, equalTo: vm.equalTo, startAt: vm.startAt, endAt: vm.endAt});
        };


    }
})();
