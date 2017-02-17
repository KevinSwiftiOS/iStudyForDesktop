/**
 * Created by Administrator on 2017/2/14 0014.
 */
MainModel.controller("LoadingCtrl",function ($scope,Loading,IsReset) {

    //首次加载题目
    $scope.des = "加载";

});
MainModel.controller("ResetLoadingCtrl",function ($scope,Loading,IsReset) {

    //重置office题目
    $scope.des = "重置";

});
