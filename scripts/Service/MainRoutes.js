/**
 * Created by hcnucai on 2016/12/21.
 */
var MainModel = angular.module('MainModel', ['ui.router', 'ngAnimate', 'ngSanitize', 'ab-base64', 'btford.modal']);
MainModel.constant("hostip", "http://dodo.hznu.edu.cn/");
MainModel.config(function ($stateProvider, $urlRouterProvider) {
    //这里指定路由
    $stateProvider
        .state("SINGLE_CHOICE", {
            url: "/SINGLE_CHOICE",
            params: {itemsIndex: null, qusIndex: null, testid: null},
            templateUrl: "QusType/SINGLE_CHOICE.html",
            controller: 'SingleChoiceCtrl'
        })
        .state('FILL_BLANK', {
            url: "/FILL_BLANK",
            params: {itemsIndex: null, qusIndex: null, testid: null},
            templateUrl: "QusType/FILL_BLANK.html",
            controller: 'CompletionCtrl'
        })
        .state('MULIT_CHIOCE', {
            url: "/MULIT_CHIOCE",
            params: {itemsIndex: null, qusIndex: null, testid: null},
            templateUrl: "QusType/MULIT_CHIOCE.html",
            controller: 'MulitChoiceCtrl'
        })
        .state('COMPLEX', {
            url: "/COMPLEX",
            params: {itemsIndex: null, qusIndex: null, testid: null},
            templateUrl: "QusType/COMPLEX.html",
            controller: 'ComplexCtrl'
        })
        .state('PROGRAM_DESIGN', {
            url: "/PROGRAM_DESIGN",
            params: {itemsIndex: null, qusIndex: null, testid: null},
            templateUrl: "QusType/PROGRAM_DESIGN.html",
            controller: 'ProgramDesCtrl'
        })
        .state('DESIGN', {
            url: "/DESIGN",
            params: {itemsIndex: null, qusIndex: null, testid: null},
            templateUrl: "QusType/DESIGN.html",
            controller: 'DesignCtrl'
        })


    ;
});
MainModel.config(['$httpProvider', function ($httpProvider) {
    //Reset headers to avoid OPTIONS request (aka preflight)
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
}]);

