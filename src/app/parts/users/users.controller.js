(function () {
    'use strict';

    angular
        .module('app.parts.users')
        .controller('SiteUsersController', SiteUsersController)
        .controller('UserClassesController', UserClassesController);

    /* @ngInject */
    function SiteUsersController($firebase, $mdMedia, $state, $mdDialog, config,$timeout) {
        var vm = this;
        vm.filters = [
            ['User Id', ''],
            ['Name', 'info.name']
        ];

        var userRefStr="site-users?type=list";
        vm.getClasses = function () {
            $firebase.queryRef('site-config-user').child('classes').once('value').then(function (snap) {
                vm.userClasses=[];
                (snap.val()||[]).forEach( function(val, index){
                    vm.userClasses[index]=val;
                });
                $timeout(angular.noop,0);
            });
        };vm.getClasses();
        vm.setAs=function(uid,usrClassIndex){
            $firebase.queryRef(userRefStr).child(uid+'/class').set(usrClassIndex);
        };


        vm.paginator = $firebase.pagination(userRefStr);
        vm.paginator.onReorder('name');
        vm.onPaginate = function (page, size) { //to prevent this being overwritten
            vm.paginator.get(page, size)
        };

        vm.onReorder = function (orderBy) {
            vm.paginator.onReorder(orderBy);
        };

        vm.getFiltered = function () {
            vm.paginator.onReorder({orderBy: vm.orderBy, equalTo: vm.equalTo, startAt: vm.startAt, endAt: vm.endAt});
        };

        vm.showDetail = function (ev, uid) {
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

            function DetailDialogCtrl() {
                var detail = this;
                detail.uid = uid;
                detail.cancel = function () {
                    $mdDialog.cancel();
                };
            }
        }
    }

    /* @ngInject */
    function UserClassesController($firebase, $timeout, $state, $mdDialog, config) {
        var vm = this;
        vm.filters = [
            ['User Id', ''],
            ['Name', 'info.name']
        ];

        //classes
        vm.userClasses = [];
        vm.getClasses = function () {
            $firebase.queryRef('site-config-user').child('classes').once('value').then(function (snap) {
                vm.userClasses=[];
                (snap.val()||[]).forEach( function(val, index){
                    vm.userClasses[index]=val;
                });
                vm.oldUserClasses = JSON.stringify(vm.userClasses);
                $timeout(angular.noop,0);
            });

        };vm.getClasses();

        vm.addClass = function () {
            vm.userClasses.push({});
        };
        vm.removeClass = function (index) {
            vm.userClasses.splice(index, 1);
        };

        vm.save = function(){
            $firebase.queryRef('site-config-user').child('classes').update(vm.userClasses);
            vm.changed=false;
        };

        vm.showSaveBtn=function(){
            return JSON.stringify(vm.userClasses)!==vm.oldUserClasses
        };

        // vm.getClasses();
        vm.checkFC=function(index){
            if(!vm.userClasses[index].fc){ //it will be checked after ng-clicked
                ['pg','wg','at','pd','fs'].forEach(function(type){ //pg:page, wg:widget, at:article, pd:product, fs:file system
                    delete vm.userClasses[index][type];
                })
            }
        }
    }
})();
