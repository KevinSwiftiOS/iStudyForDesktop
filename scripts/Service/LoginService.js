/**
 * Created by hcnucai on 2016/12/20.
 */
//定义公有的http服务
LoginModel.factory("httpService",
    function ($http, $q) {
        return {
            post: function (suburl, params) {
                var defer = $q.defer();
                $http({
                    method: 'POST',
                    params: params,
                    url: jsapi.getDomain() + suburl,
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
                    url: jsapi.getDomain() + suburl,
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