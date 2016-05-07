(function () {
    'use strict';

    angular
        .module('app.parts.users')
        .controller('AllUsersController', AllUsersController)
        .controller('SiteUsersController', SiteUsersController)
        .controller('AdminsController', AdminsController);

    /* @ngInject */
    function AllUsersController($firebase, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        usersCtrl("users/list", vm, $firebase);
    }

    /* @ngInject */
    function SiteUsersController($firebase, $stateParams, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        vm.paginator = $firebase.paginator("sites/detail/"+$stateParams.siteName+"/users/list");

        usersCtrl("sites/detail/"+$stateParams.siteName+"/users/list", vm, $firebase);
    }

    /* @ngInject */
    function AdminsController($firebase, $stateParams, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        usersCtrl("sites/detail/"+$stateParams.siteName+"/users/list", vm, $firebase, {orderBy:'access.read', equalTo:true});

        vm.actions =[
            ['allowWrite', 'USERS.ALLOWWRITE']
        ];
    }

    function usersCtrl(userListRefUrl, vm, $firebase, option) {
        option=option||{};
        vm.filters = [
            ['User Id', ''],
            ['Name', 'info.name']
        ];

        vm.actions =[
            ['setAsAdmin', 'USERS.SETASADMIN']
        ];

        vm.action=function(action,uid){
          switch(action){
              case 'setAsAdmin':
                  $firebase.ref('users/list/'+uid+'/access/read@selectedSite').set(true);
                  break;
          }
        };


        vm.paginator = $firebase.paginator(userListRefUrl);
        vm.paginator.onReorder(option||'info.name');
        vm.onPaginate = function (page, size) { //to prevent this being overwritten
            vm.paginator.get(page, size)
        };

        vm.onReorder = function (orderBy) {
            vm.paginator.onReorder(orderBy);
        };

        vm.getFiltered= function () {
            vm.paginator.onReorder({orderBy:vm.orderBy, equalTo:vm.equalTo,startAt:vm.startAt,endAt:vm.endAt});
        };
    }
})();
