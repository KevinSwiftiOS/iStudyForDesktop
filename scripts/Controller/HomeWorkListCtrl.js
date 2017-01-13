/**
 * Created by hcnucai on 2016/12/26.
 */

HomeWorkListModel.controller("HomeWorkListCtrl",function ($scope,$state) {
    $state.go("HomeWork");
    var selStyle = {
        "background-color": "white",
        "color":"black"

}
var unSelStyle = {
    "background-color": "#3867e8",
    "color":"white"
}
    $scope.homeWorkStyle = selStyle;
    $scope.experimentStyle = unSelStyle;
    $scope.exerciseStyle = unSelStyle;
 $scope.goToHomeWork = function () {
     $state.go("HomeWork");
     $scope.homeWorkStyle = selStyle;
     $scope.experimentStyle = unSelStyle;
     $scope.exerciseStyle = unSelStyle;

 }
 $scope.goToExerceise = function () {
     $state.go("Exercise");
     $scope.homeWorkStyle = unSelStyle;
     $scope.experimentStyle = unSelStyle;
     $scope.exerciseStyle = selStyle;
 }
 $scope.goToExperiment = function () {
     $state.go("Experiment");
     $scope.homeWorkStyle = unSelStyle;
     $scope.experimentStyle = selStyle;
     $scope.exerciseStyle = unSelStyle;
 }
 //返回按钮
    $scope.back = function () {
        window.location.href = "CourseAndTest.html";
    }
    var ls = window.localStorage;
    var info = angular.fromJson(ls.getItem("info"));
    $scope.name = info.name;
    $scope.coursename = ls.getItem("coursename");
    $scope.exit = function () {
        ls.clear();
        window.location.href = "Login.html";
    }
});