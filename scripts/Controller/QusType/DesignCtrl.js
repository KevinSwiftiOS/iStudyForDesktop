/**
 * Created by hcnucai on 2016/12/23.
 */
MainModel.controller("DesignCtrl",function ($scope,$stateParams,httpService,QusService,base64,$timeout,AnsCopy,IsReset,$document) {
    var itemsIndex = $stateParams.itemsIndex;
    var qusIndex = $stateParams.qusIndex;
    var testid = $stateParams.testid;
    initView();
    function initView() {
        var qus = QusService.qusItems[itemsIndex].questions[qusIndex];
        $scope.content = qus.content;
        $scope.files = qus.files;
        //看是文件上传类型题目还是富文本题目
        $scope.files = qus.files;
        $scope.answerfiles = qus.answerfiles;
        //答案
        var answer = qus.answer;
        $scope.Ans = {
            answer:answer
        }


    }
    //开始答题 调用jsapi
$scope.startAnswer = function () {
	jsapi.questionWork(angular.toJson(QusService.qusItems[itemsIndex]),angular.toJson(QusService.qusItems[itemsIndex].questions[qusIndex]));
   //答题完成后 调用将按钮变绿
    jsapi.setEvent_OnQuestionWorked('afterSave');
}
    var ls = window.localStorage;
    var authtoken = ls.getItem("authtoken");


window.afterSave = function (result) {
  if(result.success) {
    $scope.isSave = true;
    QusService.qusItems[itemsIndex].questions[qusIndex].answer = "FILE";
    QusService.qusItems[itemsIndex].questions[qusIndex].icon = "fa fa-circle";
    initView();
  }else{
      swal("保存失败",result.message,"error");
  }
}



//答案的监听
    $scope.$watch('Ans',function (newV,oldV) {
        if(newV != oldV) {
            AnsCopy.ansCopy = newV;
        }
    },true);


//重置动作
    $scope.reset = IsReset.reset;
    $scope.$watch('reset',function (newV,oldV) {
        if(newV != oldV) {

            initView();
        }
    },true);
})