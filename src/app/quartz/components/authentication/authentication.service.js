(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('Auth', Auth);

    /*@ngInject*/
    function Auth($firebaseAuth, $q, FBURL, snippet, $firebase) {

        var Auth = $firebaseAuth($firebase.ref());

        Auth.checkIfAccountExistOnFb = function (authData) {
            var def = $q.defer();
            if (!authData) def.reject('AUTH_NEEDED');
            var ref = $firebase.ref('users/'+ authData.uid+ '/createdTime');
            ref.once('value', function (snap) {
                if (snap.val() === null) {
                    def.resolve(authData);
                }
            }, function (err) {
                def.reject(err)
            });
            return def.promise
        };

        Auth.createAccount = function (authData, opt) {
            if (!authData) return;
            if (opt === undefined || (typeof opt !== 'object')) {
                var ref = $firebase.ref('users/'+authData.uid);
                return $firebase.handler(function (cb) {
                    ref.set(Auth.basicAccountUserData(authData, opt), cb);
                })
            } else {
                var def = $q.defer();
                if (!!opt.structure) {
                    var rawData = snippet.flatten(authData, opt.flattenConfig);
                    rawData.authData = authData;
                    var values = snippet.createBatchUpdateValues(rawData, opt.structure);
                    console.log(JSON.stringify(values));
                    $firebase.batchUpdate(values, opt.isConsecutive).then(function () {
                        def.resolve();
                    }, opt.errorHandler);
                } else {
                    def.reject('USERDATA_STRUCTURE_NEEDED')
                }
                return def.promise
            }
        };
        //Example
        //var opt={
        //    structure:[
        //        {
        //            refUrl:'users/$uid',
        //            value:'authData' //主要user acc, 將全部authData update 到此refUrl
        //        },
        //        {
        //            refUrl:'userList/$uid', //產生一個只有 name和email 的list item
        //            value:{
        //                name:'password.name', //此string 代表authData.password.name
        //                email:'password.email'
        //            }
        //        }
        //    ]
        //};

        Auth.basicAccountUserData = function (authData) {
            var provider = authData.provider,
                name = authData[provider].displayName || authData.uid,
                email = authData[provider].email || null,
                profileImageURL = authData[provider].profileImageURL || null;
            if (provider === 'password') name = snippet.firstPartOfEmail(authData.password.email);
            var basicUser = {createdTime: Firebase.ServerValue.TIMESTAMP};
            basicUser.info = {
                name: name,
                email: email,
                profileImageURL: profileImageURL
            };
            basicUser[provider] = {
                id: authData[provider].id || null
            };
            return basicUser
        };


        Auth.loginWithProvider = function (provider, options) {
            var opt = typeof options === 'object' ? options : {};
            switch (provider) {
                case 'password':
                    return Auth.$authWithPassword({email: opt.email, password: opt.password}, opt);
                    break;
                case 'custom':
                    return Auth.$authWithCustomToken(opt.customToken, opt);
                    break;
                case 'anonymous':
                    opt.rememberMe = opt.rememberMe || 'none';
                    return Auth.$authAnonymously(opt);
                    break;
                default:
                    if (opt.popup === false) {
                        return Auth.$authWithOAuthRedirect(provider, opt);
                    } else {
                        return Auth.$authWithOAuthPopup(provider, opt);
                    }
                    break;
            }
        };

        Auth.removeUserData = function (authData, extraCallBack) {
            var ref = new Firebase((FBURL + 'users/' + authData.uid));   //TODO: 𩄍惩撠滚𩄍firebase𩄍𣈲𩄍

            ref.remove(function (err) {
                if (err) {
                    console.log(err.code);
                } else {
                    if (extraCallBack) extraCallBack(authData);

                }
            });
        };

        return Auth;
    }
})();

