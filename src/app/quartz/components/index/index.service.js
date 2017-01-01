(function () {
    'use strict';

    angular
        .module('quartz.components')
        .service('indexService', IndexService);

    /* @ngInject */
    function IndexService($firebase) {

        ////////////////

        function create(siteName){
            var obj = {
                "_state":"index",
                "siteName": siteName,
                "task": "create"
            };
            return $firebase.queryRef("queue-tasks").push(obj);
        }
        function deleteIndex(siteName){
            var obj = {
                "_state":"index",
                "siteName": siteName,
                "task": "delete"
            };
            return $firebase.queryRef("queue-tasks").push(obj);
        }

        function add(type, id, body) {
            return toQueue("add", type, id, body)
        }

        function update(type, id, body) {
            return toQueue("update", type, id, body)
        }

        function remove(type, id) {
            return toQueue("remove", type, id)
        }

        function toQueue(task, type, id, body) {
            if (!_core.util.siteName) {
                console.log("Please select a site");
                return;
            }

            var obj = {
                "_state":"index"
            };
            obj.siteName = _core.util.siteName;
            if (angular.isString(task)) obj.task = task;
            if (angular.isString(type)) obj.type = type;
            if (angular.isString(id)) obj.id = id;
            if (body) obj.body = body;

            return $firebase.queryRef("queue-tasks").push(obj);
        }

        return {
            add: add,
            update: update,
            remove: remove,
            create:create,
            deleteIndex:deleteIndex
        }

    }
})();
