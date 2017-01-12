/**
 * Created by hcnucai on 2016/12/21.
 */
//头像的路径
//时间日期的分割
CourseAndTestListModel.factory("httpService",
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
CourseAndTestListModel.factory("subDate",function () {
    return {

        divedeToDay:function (date) {

            var year = date.substr(0,4);
            var month = date.substr(4,2);
            var day = date.substr(6,2);
            var hour = date.substr(8,2);
            var min = date.substr(10,2);
            var second = date.substr(12,2);
            return {year:year,month:month,day:day,hour:hour,min: min,second:second};
        }
    }
});