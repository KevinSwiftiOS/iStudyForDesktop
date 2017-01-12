/**
 * Created by hcnucai on 2016/12/20.
 */
//定义公有的http服务
MainModel.factory("httpService",
    function($http, $q,hostip) {
        return {
            post: function (suburl,params) {
                var defer = $q.defer();
                $http({
                    method: 'POST',
                    params: params,
                    url: hostip + suburl,
                }).success(function (data) {
                    if(data.retcode == 0) {
                        defer.resolve(data.items);
                    }
                    else
                        defer.reject(data.message);
                }).error(function (data) {
                    defer.reject(data);
                });
                return defer.promise;
            },
            infoPost: function (suburl,params) {
                var defer = $q.defer();
                $http({
                    method: 'POST',
                    params: params,
                    url: hostip + suburl,
                }).success(function (data) {
                    if(data.retcode == 0) {
                        defer.resolve(data);
                    }
                    else
                        defer.reject(data.message);
                }).error(function (data) {
                    defer.reject(data);
                });
                return defer.promise;
            },

        };

    });
/**
 * Created by hcnucai on 2016/12/21.
 */
MainModel.factory("QusService",function () {
    return {
        qusItems:null
    }
});

MainModel.factory('myModal', function (btfModal) {
    return btfModal({
        controller: 'MyModalCtrl',

        templateUrl:  "QusType/Modal.html"
    });
});
//答案的副本 在重置的时候有用
MainModel.factory("AnsCopy",function () {
    return {
        ansCopy:"",
    }
});
//是否重置
MainModel.factory("IsReset",function () {
    return {
        reset: {isReset:0},
    }
});
//定时器的设置
MainModel.factory("Timer",function () {
    return {
        times:null
    }
})




MainModel.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('change', function(){
                $parse(attrs.fileModel).assign(scope,element[0].files)
                scope.$MainModelly();
            });
        }
    }}]);


//定义保存的服务
