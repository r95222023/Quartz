(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('$auth', Auth)
        .run(run);

    /*@ngInject*/
    function Auth($firebase) {
        var Auth = firebase.auth(_core.util.app);

        var readyPromise = new Promise(function(resolve,reject){
            var unsubscribe = Auth.onAuthStateChanged(function () {
                resolve(Auth.currentUser);
                unsubscribe();
            });
        });

        Auth.waitForAuth = function () {
            return Promise.resolve(Auth.currentUser);
        };

        Auth.requireAuth = function () {
            if (Auth.currentUser) {
                return Promise.resolve(Auth.currentUser)
            } else {
                return Promise.reject()
            }
        };

        Auth.checkIfAccountExistOnFb = function () {
            return _core.util.auth.checkIfAccountExist();
        };

        Auth.createAccount = function (opt) {
            return _core.util.auth.createAccount(opt);
        };

        Auth.loginWithProvider = function (provider, options) {
            return _core.util.auth.loginWithProvider(provider,options);
        };

        Auth.removeUserData = function (authData, extraCallBack) {
            var uid = authData.uid;
            $firebase.update(['user?type=list', 'user/type=detail'], {
                "@all": null
            },{id:uid}).then(function () {
                if (extraCallBack) extraCallBack(authData);
            });
        };

        Auth.getClass = function(authData){
            var user = authData||Auth.currentUser;
            return new Promise(function(resolve,reject){
                if(!user.uid) reject('user not found');
                $firebase.queryRef('site-user?type=list&userId='+user.uid).child('class').once('value', function(classSnap){
                    var promises = [];

                    var classId = classSnap.val();

                    promises[0] = $firebase.queryRef('site-config-user').child('classes').once('value');
                    promises[1] = $firebase.queryRef('users/detail/'+user.uid+'/sites').orderByChild('siteName').equalTo(_core.util.siteName||'')
                        .once('child_added');
                    Promise.all(promises).then(function(res){
                        if(res[1].val()){
                            Auth.class={name:'owner', fc:true}; //fc:full control
                        } else {
                            var classes=res[0].val()||{};
                            Auth.class=classes[classId]||{};
                        }
                        if(Auth.class.name) console.log('user class: '+Auth.class.name);
                        resolve(Auth.class);
                    });
                });
            });
        };

        return Auth;
    }

    /*@ngInject*/
    function run($rootScope, $auth, $firebase) {

        $auth.onAuthStateChanged(function (user) {
            $rootScope.user = user;
            $rootScope.loggedIn = !!user;

            if (user) {
                $firebase.queryRef('user?userId='+user.uid).once('value', function (snap) {
                    var val = snap.val()||{},
                        userData = {},
                        providerData = user.providerData;
                    userData.info = val.info||{};
                    userData.info.name = user.displayName||providerData[0].displayName||firstPartOfEmail(user.email);
                    userData.info.photoURL = user.photoURL||providerData[0].photoURL;
                    $rootScope.user.info=userData.info;
                    $auth.getClass();
                });

            } else {
                console.log('no user', user);
            }
        });
    }

    function firstPartOfEmail(emailAddress) {
        return emailAddress.substring(0, emailAddress.indexOf("@"));
    }
})();

