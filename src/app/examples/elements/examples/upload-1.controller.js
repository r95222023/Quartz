(function () {
    'use strict';

    angular
        .module('app.examples.elements')
        .controller('ElementsUpload1Controller', ElementsUpload1Controller);

    /* @ngInject */
    function ElementsUpload1Controller($mdToast, $firebaseStorage) {
        var vm = this;
        vm.upload = upload;

        ////////////////

        vm.upload2 = function () {
            $firebaseStorage.update('test/test', {data: 'ajskdlfjkasldfnzxcmvlkxzhcjvhasjdkhfjkasdfhasgtuiwegquasdkfjkasldjfkljaskldfjklasdfm,nzxclvj'})
        };

        vm.get = function () {
            $firebaseStorage.getWithCache('test/test').then(function (res) {
                console.log(res)
            });
        };

        function upload($files) {
            var storageRef = firebase.storage().ref();

            if ($files !== null && $files.length > 0) {
                var message = 'Thanks for ';
                for (var fileKey in $files) {
                    var file = $files[fileKey];
                    message += file.name + ' ';
                    var uploadTask = storageRef.child('test/' + file.name).put(file);
                    uploadTask.on('state_changed', function (snapshot) {
                        // Observe state change events such as progress, pause, and resume
                        // See below for more detail
                    }, function (error) {
                        // Handle unsuccessful uploads
                    }, function () {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        var downloadURL = uploadTask.snapshot.downloadURL;
                    });
                }
                $mdToast.show({
                    template: '<md-toast><span flex>' + message + '</span></md-toast>',
                    position: 'bottom right',
                    hideDelay: 5000
                });
            }
        }
    }
})();
