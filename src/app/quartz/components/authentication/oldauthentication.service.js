(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('Auth', function(){
            return {}
        })
        // .run(run);

    /*@ngInject*/
    // function Auth($firebaseAuth, $q, $firebase, $stateParams, config) {
    //
    //     var Auth = $firebaseAuth((new Firebase('https://quartz.firebaseio.com')));
    //
    //     Auth.checkIfAccountExistOnFb = function (authData) {
    //         var def = $q.defer(),
    //             opt={},
    //             userPath = 'users/detail/'+ authData.uid;
    //         if (!authData) def.reject('AUTH_NEEDED');
    //
    //         function checkIfCreated(){
    //             $firebase.ref(userPath+'/createdTime').once('value', function (snap) {
    //                 opt.registered = snap.val() !== null;
    //                 def.resolve(angular.extend({},authData,opt));
    //             }, function (err) {
    //                 def.reject(err)
    //             });
    //         }
    //
    //         if($stateParams.siteName){
    //             var siteName = $stateParams.siteName;
    //             $firebase.ref(userPath+'/sitesRegistered/'+siteName).once('value', function(regSnap){
    //                 if(regSnap.val()===null&&!config.standalone) opt.regSite = siteName;
    //                 checkIfCreated();
    //             })
    //         } else {
    //             checkIfCreated();
    //         }
    //
    //         return def.promise
    //     };
    //
    //     Auth.createAccount = function (authData) {
    //         var uid = authData.uid,
    //             userPaths =['list/'+uid,'detail/'+uid],
    //             basicData = Auth.basicAccountUserData(authData),
    //             def=$q.defer(),
    //             regSite = function(){
    //                 if(authData.regSite){
    //                     var data={},
    //                         siteName = authData.regSite;
    //                     data["users/detail/"+uid+"/sitesRegistered/"+siteName]=Firebase.ServerValue.TIMESTAMP;
    //                     data["sites/detail/"+siteName+"/users/list/"+uid]=basicData;
    //                     $firebase.update('', data).then(function () {
    //                         def.resolve();
    //                     })
    //                 } else {
    //                     def.resolve();
    //                 }
    //             };
    //
    //         if (authData.registered!==true) {
    //             $firebase.update('users', userPaths, basicData).then(regSite);
    //         } else {
    //             regSite();
    //         }
    //         // if (opt === undefined || !angular.isObject(opt)) {
    //         //     var uid = authData.uid;
    //         //     return $firebase.update('users', ['list/'+uid,'detail/'+uid], Auth.basicAccountUserData(authData, opt));
    //         // } else {
    //         //     //TODO: structure user data by passing opt in
    //         // }
    //         return def.promise
    //     };
    //     //Example
    //     //var opt={
    //     //    structure:[
    //     //        {
    //     //            refUrl:'users/$uid',
    //     //            value:'authData' //主要user acc, 將全部authData update 到此refUrl
    //     //        },
    //     //        {
    //     //            refUrl:'userList/$uid', //產生一個只有 name和email 的list item
    //     //            value:{
    //     //                name:'password.name', //此string 代表authData.password.name
    //     //                email:'password.email'
    //     //            }
    //     //        }
    //     //    ]
    //     //};
    //
    //     function firstPartOfEmail(emailAddress) {
    //         return emailAddress.substring(0, emailAddress.indexOf("@"));
    //     }
    //
    //     Auth.basicAccountUserData = function (authData) {
    //         var provider = authData.provider,
    //             name = authData[provider].displayName || authData.uid,
    //             email = authData[provider].email || null,
    //             profileImageURL = authData[provider].profileImageURL || null;
    //         if (provider === 'password') name = firstPartOfEmail(authData.password.email);
    //         var basicUser = {createdTime: Firebase.ServerValue.TIMESTAMP, provider: authData.provider};
    //         basicUser.info = {
    //             name: name,
    //             email: email,
    //             profileImageURL: profileImageURL
    //         };
    //         basicUser[provider] = {
    //             id: authData[provider].id || null
    //         };
    //         return basicUser
    //     };
    //
    //
    //     Auth.loginWithProvider = function (provider, options) {
    //         var opt = typeof options === 'object' ? options : {};
    //         switch (provider) {
    //             case 'password':
    //                 return Auth.$authWithPassword({email: opt.email, password: opt.password}, opt);
    //                 break;
    //             case 'custom':
    //                 return Auth.$authWithCustomToken(opt.customToken, opt);
    //                 break;
    //             case 'anonymous':
    //                 opt.rememberMe = opt.rememberMe || 'none';
    //                 return Auth.$authAnonymously(opt);
    //                 break;
    //             default:
    //                 if (opt.popup === false) {
    //                     return Auth.$authWithOAuthRedirect(provider, opt);
    //                 } else {
    //                     return Auth.$authWithOAuthPopup(provider, opt);
    //                 }
    //                 break;
    //         }
    //     };
    //
    //     Auth.removeUserData = function (authData, extraCallBack) {
    //         var uid = authData.uid;
    //         $firebase.update('users',['list/'+uid,'detail/'+uid],{
    //             "@all":null
    //         }).then(function(){
    //             if (extraCallBack) extraCallBack(authData);
    //         });
    //     };
    //
    //     return Auth;
    // }

    /*@ngInject*/
    // function run($rootScope, promiseService, Auth, $firebase, FBURL){
    //     function assignUser(authData) {
    //         $firebase.databases.currentUser = {
    //             url: FBURL.split("//")[1].split(".fi")[0] + '#users/detail/' + authData.uid
    //         };
    //     }
    //
    //     Auth.$onAuth(function (authData) {
    //         $rootScope.user = authData;
    //         $rootScope.loggedIn = !!authData;
    //
    //         promiseService.reset('userData');
    //
    //         if (authData) {
    //             angular.extend($firebase.params,{
    //                 '$uid': authData.uid
    //             });
    //
    //             assignUser(authData);
    //
    //             $firebase.ref('users/detail/' + authData.uid + '/info').once('value', function(snap){
    //                 var userData = Auth.basicAccountUserData(authData);
    //                 userData.info = snap.val();
    //                 userData.info.profileImageURL = authData[authData.provider].profileImageURL;
    //                 $rootScope.user = userData;
    //
    //                 promiseService.resolve('userData', userData);
    //             });
    //
    //         } else {
    //             console.log('no user', authData);
    //             promiseService.resolve('userData', null);
    //             $firebase.params["$uid"] = "";
    //         }
    //     });
    // }
})();

