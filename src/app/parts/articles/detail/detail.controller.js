(function () {
    'use strict';

    angular
        .module('app.parts.articles')
        .controller('ArticleDetailController', ArticleDetailController);

    /* @ngInject */
    function ArticleDetailController(lzString, $timeout, $firebase, $firebaseStorage, $stateParams) {
        var vm = this;

        angular.extend(vm, $stateParams);

        $firebaseStorage.getWithCache('articles/detail/' + vm.id + '@selectedSite').then(setModelData);

        function setModelData(data) {
            console.log(data);
            vm.product = data;
        }

        vm.disqusId = vm.siteName + vm.id;
        vm.selectedOption = {};
        vm.showDetail = function (articleId) {
            $state.go('quartz.admin-default.articleDetail', {id: articleId})
        }
    }
})();
