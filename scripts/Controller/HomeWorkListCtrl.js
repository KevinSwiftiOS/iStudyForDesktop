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
    var userInfo = angular.fromJson(ls.getItem("userInfo"));
    $scope.name = userInfo.name;
    var courseInfo = angular.fromJson(ls.getItem("courseInfo"));
    $scope.coursename = courseInfo.coursename;
    $scope.exit = function () {
        ls.clear();
        window.location.href = "Login.html";
    }
});