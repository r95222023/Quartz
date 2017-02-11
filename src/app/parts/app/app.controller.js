(function () {
    'use strict';

    angular
        .module('app.parts.app')
        .controller('AppBuilderCtrl', AppBuilderCtrl);

    /* @ngInject */
    function AppBuilderCtrl($scope, $firebase, $stateParams, $mdDialog, indexService, sitesService) {
        var ab = this;
        var siteName = $stateParams.siteName;
        ab.platforms = ['android','iOS'];
        ab.selectedPlatform = 'android';
        ab.pluginOptions = [
            'cordova-plugin-device',
            'cordova-plugin-statusbar',
            'cordova-plugin-splashscreen',
            'cordova-plugin-console',
            'cordova-plugin-inappbrowser',
            'cordova-plugin-file',
            'cordova-plugin-camera',
            'cordova-plugin-network-information',
            'cordova-plugin-geolocation',
            'cordova-plugin-dialogs',
            'cordova-plugin-file-transfer',
            'cordova-plugin-globalization',
            'cordova-plugin-media',
            'cordova-plugin-vibration',
            'cordova-plugin-device-orientation',
            'cordova-plugin-media-capture',
            'cordova-plugin-device-motion',
            'cordova-plugin-contacts',
            'cordova-plugin-battery-status',
            'cordova-plugin-crosswalk-webview',
            'cordova-sqlite-storage',
            'cordova-plugin-x-socialsharing',
            'phonegap-plugin-barcodescanner'
        ];
        ab.plugins = [];
        ab.progress = {};
        var appConfigRef = $firebase.queryRef('site-config?siteName='+siteName).child('app');
        appConfigRef.on('value', function(snap){
            ab.app = snap.val()||{};
            ab.appName = ab.app.appName||siteName;
        });

        ab.getDownload=function(){
            var platform = ab.selectedPlatform;
            var path = 'http://localhost/apps/'+siteName+'/platforms/'+platform;
            switch(platform){
                case 'android':
                    path+='/build/apk/android-debug.apk';
                    break;
            }
            return path
        };
        ab.getQRcode = function(){
            return "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl="+ab.getDownload()+"&choe=UTF-8"
        };

        $scope.$on('$destroy', function(){
            appConfigRef.off();
        });

        ab.removePlugin = function (index) {
            ab.plugins.splice(index, 1);
        };
        ab.addPlugin = function (input) {
            if (JSON.stringify(ab.plugins).indexOf(JSON.stringify(input)) !== -1) return; //input is duplicated
            ab.plugins.push(input);
        };
        ab.buildApp = function (platform) {
            var taskRef = $firebase.queryRef('queue-tasks').push();
            taskRef.set({
                _state:'app_build',
                siteName: siteName,
                appName: ab.appName,
                plugins: ab.plugins,
                platform: platform
            });
            taskRef.child('_progress').on('value', function (snap) {
                taskRef.child('_progress').off();
                ab.progress[platform] = snap.val();
            })
        }
    }

})();
