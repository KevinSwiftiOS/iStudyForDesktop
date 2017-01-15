/**
 * Created by hcnucai on 2016/12/23.
 */
MainModel.controller("ComplexCtrl",function ($scope,$stateParams,QusService,httpService,base64,$timeout,IsReset,AnsCopy) {
    var itemsIndex = $stateParams.itemsIndex;
    var qusIndex = $stateParams.qusIndex;
    //传过来的值还有testId
    var testid = $stateParams.testid;
    var keys = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    //保存触发器
    var saveTrigger = null;
   //初始化界面
    initView();
    function initView() {
        var myAnswers = [];
        var standAnswers = [];
        //大题目
        var qus = QusService.qusItems[itemsIndex].questions[qusIndex];
        //大题目的描述
        $scope.content = qus.content;
        $scope.files = qus.files;
        //标准答案进行分割
        var strandanswer = qus.strandanswer;
        var subQus = qus.subquestions;
        //放在页面上要显示的数组
        var subquestions = [];
        var answer = qus.answer;

        //标准答案分割
        standAnswers = strandanswer.split("~~~");
        //分割答案
        //自己的答案
        if(answer != null && answer != "") {
            myAnswers = answer.split("~~~");
        }
        //如果有空的情况
        else for(var i = 0; i < subQus.length;i++) {
            myAnswers.push("");
        }
        //小题目拿出来进行判断
        //进行遍历  3中题型
        for(var i = 0; i < subQus.length;i++) {
            var  oneAns = "";
            oneAns = myAnswers[i];
            switch (subQus[i].type){
                case "SINGLE_CHIOCE":
                    var options = [];
                    for (var j = 0; j < keys.length; j++) {
                        var optionDic = {};
                        var optionkey = "option" + keys[j];
                        if (subQus[i][optionkey] != "") {
                            //题目内容
                            optionDic.optionContent = keys[j].toUpperCase() + "." + subQus[i][optionkey];
                            //是否选中
                            if (oneAns == keys[j].toUpperCase())
                                optionDic.isSel = true;
                            else
                                optionDic.isSel = false;
                            options.push(optionDic);
                        }
                    }
                    //答题时有用
                   var dic = {
                       content:subQus[i].content,
                       type:subQus[i].type,
                       row:i,
                       options:options
                   }
                   subquestions.push(dic);
                    break;
                case "MULIT_CHIOCE":
                    var options = [];
                    for (var j = 0; j < keys.length; j++) {
                        var optionDic = {};
                        var optionkey = "option" + keys[j];
                        if (subQus[i][optionkey] != "") {
                            //题目内容
                            optionDic.optionContent = keys[j].toUpperCase() + "." + subQus[i][optionkey];
                            //是否选中

                            if (oneAns != null && oneAns.indexOf(keys[j].toUpperCase()) != -1)
                                optionDic.isSel = true;
                            else
                                optionDic.isSel = false;
                            options.push(optionDic);
                        }
                    }
                    //答题时有用
                    var dic = {
                        content:subQus[i].content,
                        type:subQus[i].type,
                        row:i,
                        options:options
                    }
                    subquestions.push(dic);
                    break;
                case "FILL_BLANK":
                    var options = [];
                    if(oneAns != null && oneAns != "") {
                      var arr = oneAns.split("&&&");
                        for(var j = 0; j < arr.length;j++) {
                         var optionDic = {value:arr[j]};

                            var blank = "blank" + (i+1);

                            if(qus[blank] != null && qus[blank] != "")
                                optionDic.blank = qus[blank];
                            else
                                optionDic.blank = "";
                            options.push(optionDic);
                        }
                        //小题目的blank

                        var dic = {
                            content:subQus[i].content,
                            type:subQus[i].type,
                            row:i,
                            options:options
                        }
                        subquestions.push(dic);

                    }
                    //如果填空题没有填写
                    else{
                        var regex = new RegExp("&&&", 'g');
                        var result = standAnswers[i].match(regex);
                        var count = (!result ? 0 : result.length) + 1;

                        var options = [];
                        for(var j = 0; j < count;j++) {
                            var optionDic = {};
                            var blank = "blank" + (i+1);

                            if(qus[blank] != null && qus[blank] != "")
                                optionDic.blank = qus[blank];
                            else
                                optionDic.blank = "";
                            optionDic.value = "";
                            options.push(optionDic);
                        }
                        //答题时候有用 这个row
                        var dic = {
                            content:subQus[i].content,
                            type:subQus[i].type,
                            row:i,
                            options:options
                        }
                        subquestions.push(dic);
                    }
                   break;

            }

        }
        $scope.subquestions = subquestions;
    }
    //回答单选题
    $scope.answerSingle = function ($index,row) {
      //只能选择一个
     var options = $scope.subquestions[row].options;
        for(var i = 0; i < options.length;i++) {
            if(i == $index)
                options[i].isSel = true;
            else
                options[i].isSel = false;
        }
        $scope.subquestions[row].options = options;
       save();
    }
    //回答多选题
    $scope.answerMulit = function ($index,row) {
        //能选择多个
        $scope.subquestions[row].options[$index].isSel = !$scope.subquestions[row].options[$index].isSel;
        save();
    }
    //回答填空题
    $scope.keyDown = function () {
        save();
    }
    //保存的动作 首先是小题题的封装 之后再是总共的封装
  function save() {
      var options = $scope.subquestions;
      var answer = "";
      for(var i = 0; i < options.length - 1;i++) {
          answer += assembAns(options[i]) + "~~~";
      }
      answer += assembAns(options[options.length - 1]);
      AnsCopy.ansCopy = answer;
      if(saveTrigger != null) {
          clearTimeout(saveTrigger);
          saveTrigger = null;
      }
      saveTrigger = setTimeout(function () {


        var subQus = $scope.subquestions;

        $scope.isSave = true;
        $scope.saveDes = {
          icon: "fa fa-spinner fa-spin",
          des: "正在保存答案"
      }
        var data = {
            testid:testid,
            questionid: QusService.qusItems[itemsIndex].questions[qusIndex].id,
            answer:AnsCopy.ansCopy,
            answerfile:"",
        }
        var ls = window.localStorage;
        var param = {
            authtoken:ls.getItem("authtoken"),
            data:base64.encode(angular.toJson(data)),
        }
        var promise = httpService.post( "api/submitquestion",param);
        promise.then(function (res) {
            $scope.saveDes = {
                icon:"fa  fa-check",
                des:"保存成功"
            }
            $timeout(function () {
                $scope.isSave = false;
            }, 1000);

            QusService.qusItems[itemsIndex].questions[qusIndex].answer = AnsCopy.ansCopy;

            QusService.qusItems[itemsIndex].questions[qusIndex].icon = "fa fa-circle";
            clearTimeout(saveTrigger);
            saveTrigger = null;
            initView();
        },function (err) {
            clearTimeout(saveTrigger);
            saveTrigger = null;
            $scope.isSave = false;
            swal("保存失败",err,"error");
        })
      },2000);
    }
    function  assembAns(subQus) {

        switch (subQus.type){
            case "SINGLE_CHIOCE":
                //遍历看是否有
                var options = subQus.options;

                for(var j = 0; j < options.length;j++) {
                    if(options[j].isSel == true) {

                       return  keys[j].toUpperCase();
                    }
                }
                return "";
                break;
            case "MULIT_CHIOCE":
                var options = subQus.options;
                var subMyAns = "";
                var cnt = 1000;
                var arr = [];
                for (var i = 0; i < options.length; i++)
                    if (options[i].isSel)
                        arr.push(keys[i].toUpperCase());
                subMyAns = arr.join("&&&");
              return subMyAns;
                break;
            case "FILL_BLANK":
                var options = subQus.options;
                var subMyAns = "";
                for(var j = 0; j < options.length - 1;j++)
                    subMyAns += options[j].value + "&&&";
                subMyAns += options[options.length - 1].value;
            return subMyAns;
        }
    }
    //重置按钮
    //重置
    $scope.$watch('subquestions',function (newV,oldV) {
        if(newV != oldV) {

        }
    },true);
    $scope.reset = IsReset.reset;
    $scope.$watch('reset',function (newV,oldV) {
        if(newV != oldV) {
            initView();
        }
    },true);

})