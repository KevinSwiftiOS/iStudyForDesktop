/**
 * Created by hcnucai on 2016/12/26.
 */

HomeWorkListModel.controller("HomeWorkListCtrl",function ($scope,$state) {
    $state.go("HomeWork");
    var selStyle = {
        "float":"left",
        "border-bottom-width": "1px",
        "border-bottom": "double"

}
var unSelStyle = {
    "float":"left"
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
});