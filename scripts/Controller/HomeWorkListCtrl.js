/**
 * Created by hcnucai on 2016/12/26.
 */

HomeWorkListModel.controller("HomeWorkListCtrl", function ($scope, $state) {
    $state.go("HomeWork");
   $scope.isHomeWork = true;
    $scope.isExperiment = false;
    $scope.isExercice = false;
    // $scope.homeWorkStyle = selStyle;
    // $scope.experimentStyle = unSelStyle;
    // $scope.exerciseStyle = unSelStyle;
    $scope.goToHomeWork = function () {
        $state.go("HomeWork");
        // $scope.homeWorkStyle = selStyle;
        // $scope.experimentStyle = unSelStyle;
        // $scope.exerciseStyle = unSelStyle;
        $scope.isHomeWork = true;
        $scope.isExperiment = false;
        $scope.isExercice = false;

    }
    $scope.goToExerceise = function () {
        $state.go("Exercise");
        // $scope.homeWorkStyle = unSelStyle;
        // $scope.experimentStyle = unSelStyle;
        // $scope.exerciseStyle = selStyle;
        $scope.isHomeWork = false;
        $scope.isExperiment = false;
        $scope.isExercice = true;
    }
    $scope.goToExperiment = function () {
        $state.go("Experiment");
        // $scope.homeWorkStyle = unSelStyle;
        // $scope.experimentStyle = selStyle;
        // $scope.exerciseStyle = unSelStyle;
        $scope.isHomeWork = false;
        $scope.isExperiment = true;
        $scope.isExercice = false;
    }
    //返回按钮
    var ls = window.localStorage;
    $scope.back = function () {
        window.location.href = "CourseAndTest.html";
        //返回键将课程信息和作业信息清除
        ls.removeItem("courseInfo");
        ls.removeItem("testInfo");
    }
    var userInfo = angular.fromJson(ls.getItem("userInfo"));
    $scope.name = userInfo.name;
    var courseInfo = angular.fromJson(ls.getItem("courseInfo"));
    $scope.coursename = courseInfo.coursename;
    $scope.exit = function () {
        swal({
                title: "提醒",
                text: "您确认退出吗?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
                if (isConfirm) {
                    ls.clear();
                    jsapi.exit();
                }
            }
        )
    }
});