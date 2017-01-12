/**
 * Created by hcnucai on 2016/12/26.
 */
var HomeWorkListModel = angular.module('HomeWorkListModel', ['ui.router','ngAnimate','ngSanitize','angular-loading-bar']);
HomeWorkListModel.constant("hostip","http://dodo.hznu.edu.cn/");
HomeWorkListModel.config(function($stateProvider, $urlRouterProvider) {
    //这里指定路由
    $stateProvider
        .state("HomeWork", {
            url: "/HomeWork",

            templateUrl: "HomeWorkType/HomeWork.html",
            controller: 'HomeWorkCtrl'
        })
        .state('Experiment', {
            url: "/Experiment",

            templateUrl: "HomeWorkType/Experiment.html",
            controller: 'ExperimentCtrl'
        })
        .state('Exercise', {
            url: "/Exercise",

            templateUrl: "HomeWorkType/Exercise.html",
            controller: 'ExerciseCtrl'
        })
});