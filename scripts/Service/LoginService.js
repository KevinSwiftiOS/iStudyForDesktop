/**
 * Created by hcnucai on 2016/12/20.
 */
//定义公有的http服务
loginModel.factory("httpService",
    function ($http, $q, hostip) {
        return {
            post: function (suburl, params) {
                var defer = $q.defer();
                $http({
                    method: 'POST',
                    params: params,
                    url: hostip + suburl,
                }).success(function (data) {
                    if (data.retcode == 0) {
                        defer.resolve(data.items);
                    }
                    else
                        defer.reject(data.message);
                }).error(function (data) {
                    defer.reject(data);
                });
                return defer.promise;
            },
            infoPost: function (suburl, params) {
                var defer = $q.defer();
                $http({
                    method: 'POST',
                    params: params,
                    url: hostip + suburl,
                }).success(function (data) {
                    if (data.retcode == 0) {
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