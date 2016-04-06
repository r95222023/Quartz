(function() {
    'use strict';

    angular
        .module('app.parts.sites')
        .service('sitesService', SitesService);

    /* @ngInject */
    function SitesService($firebase, indexService){
        
        function rectifySiteName(siteName){
            return siteName.trim().replace(".","_")
        }


        function addSite(newSiteName, uid){
            var _newSiteName = rectifySiteName(newSiteName);
            $firebase.ref('users/detail/'+uid+'/sites').push({
                siteName: _newSiteName,
                createdTime: Firebase.ServerValue.TIMESTAMP
            }).then(function(){
                $firebase.update('sites', ['detail/' + _newSiteName, 'list/' + _newSiteName], {
                    //"toDetail@0": "test",
                    //"toList@1": "test",
                    "author@1": uid,
                    "siteName@1": _newSiteName,
                    "createdTime": Firebase.ServerValue.TIMESTAMP
                });
                indexService.add("record","created", {siteName:_newSiteName}, _newSiteName);
            });
        }

        function removeSite(siteName, uid){
            $firebase.ref('users/detail/' + uid + '/sites').orderByChild('siteName').equalTo(siteName).once('child_added', function (snap) {
                snap.ref().set(null);
            });
            $firebase.update('sites', ['detail/' + siteName, 'list/' + siteName], {
                "@all": null
            });
            indexService.remove(false, false, siteName);
        }

        return {
            addSite:addSite,
            removeSite:removeSite
        }
    }
})();
