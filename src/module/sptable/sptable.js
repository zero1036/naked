angular.module('nd.sptable', ['ngAnimate'])

.directive('ndSptable', function() {
    return {
        scope: {
            spArr: '=',
            spRow: '='
        },
        controller: 'ndSptableCtrl'
    }
})

.controller('ndSptableCtrl', ['$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude) {
    if (!angular.isDefined($attrs.rowField) || !angular.isDefined($attrs.scaleField) || !angular.isDefined($attrs.isdelField)) {
        return;
    }

    //是否汇报日志
    var _isLog = angular.isDefined($attrs.isLog);

    //刷新集合
    this.refreshArr = function(arr, oldArr) {
        if (arr === undefined) {
            arr = $scope.spArr;
            if (arr === undefined) {
                return;
            }
        }

        // var curCount = 0;
        $scope.spRow = 0;
        //目前最多支持10行
        for (var irow = 1; irow <= 10; irow++) {

            //获取当前行所有item集合
            var itemsInRowAll = arr.filter($attrs.rowField, irow);
            if (itemsInRowAll.length === 0) {
                break;
            }

            //计算每行items总量
            // curCount += itemsInRowAll.length;

            //过滤非删除的记录
            var itemsInRowNotDel = itemsInRowAll.filter($attrs.isdelField, false);
            if (itemsInRowNotDel.length !== 0) {
                //设置有效行数
                $scope.spRow += 1;
            }

            //获取所有非删除items所占scale总和
            var totalScale = getTotalScale(itemsInRowNotDel);

            for (var i = 0, en; en = itemsInRowAll[i++];) {

                if (en[$attrs.isdelField] === false) {
                    //计算每个非删除item项实际宽度
                    calculateWidth(en, totalScale);
                }

                //更新行号
                en[$attrs.rowField] = $scope.spRow;

                //更新item设置所在行的下一项索引
                // en.nextIndex = curCount;
            }
        }

        if (_isLog) {
            //汇报日志
            refreshDataLog(arr);
        }
    };

    //监听item集合变化
    $scope.$watchCollection('spArr', this.refreshArr);

    //获取最大比例
    function getTotalScale(arrInRow) {
        var totalScale = 0;
        for (var i = 0, en; en = arrInRow[i++];) {
            var curScale = en[$attrs.scaleField];

            totalScale += curScale;
        }
        return totalScale;
    }

    //计算item项实际宽度
    function calculateWidth(item, totalScale) {
        var itemScale = item[$attrs.scaleField];

        if (angular.isDefined($attrs.widthUnit) && angular.isDefined($attrs.widthPx) && $attrs.widthUnit === "px") {
            item.width = ((parseInt($attrs.widthPx) * itemScale) / totalScale);
            item.width = item.width + "px";
        } else {
            if (itemScale === totalScale && itemScale === 0) {
                item.width = "100%";
            } else {
                item.width = (itemScale / totalScale) * 100;
                item.width = item.width + "%";
            }
        }
    }

    //刷新数据日志
    function refreshDataLog(arr) {
        console.log("validate sptable");
        var lastRow = null;
        for (var i = 0, en; en = arr[i++];) {
            if (lastRow !== null && lastRow > en[$attrs.rowField]) {
                console.log("！！！！sptable数据异常！！！！");
            }

            lastRow = en[$attrs.rowField];

            console.log("i:" + i + " | row:" + en[$attrs.rowField] + " | isDel:" + en[$attrs.isdelField]);

            //验证scale是否为数值
            if (!(Object.prototype.toString.call(en[$attrs.scaleField]) == "[object Number]")) {
                console.log("！！！！对象属性" + $attrs.scaleField + "只能为数值！！！！");
            }
        }
    }
}])

.directive('ndSpitem', function() {
    return {
        require: ['?^ndSptable', '?^ndSpitem'],
        scope: {
            spItem: '='
        },
        controller: 'ndSpitemCtrl',
        link: function(scope, el, attr, ctrls) {
            ctrls[1].refreshParentArr = ctrls[0].refreshArr;

            var _origalWidth = "";

            // el.bind('mouseover', function() {
            //     var me = this;
            //     if (me.offsetWidth < 300) {
            //         _origalWidth = me.style.width;
            //         me.style.width = "300px";
            //         me.style.position = "absolute";
            //     }
            // });

            // el.bind('mouseleave', function(event) {
            //     var me = this;
            //     if (_origalWidth !== "") {
            //         // me.style.width = _origalWidth;
            //         me.style.position = "initial";
            //         ctrls[1].refreshParentArr();
            //         scope.$apply();
            //     }
            // });
        }
    };
})

.controller('ndSpitemCtrl', ['$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude) {

    this.refreshParentArr = angular.loop;
    var self = this;
    //监听item的宽度变化，并改变DOM样式
    $scope.$watch(function(scope) {
        return scope.spItem.width;
    }, function(wid) {
        //获取元素
        $element[0].style.width = wid;
    });

    //监听item的比例变化，并通知父指令全局刷新所有item
    $scope.$watch(function(scope) {
        return scope.spItem[$attrs.scaleField];
    }, function(scale, oscale) {
        if (scale !== oscale) {
            if (scale === 0) {
                return;
            }
            self.refreshParentArr();
        }
    });

    //监听item的删除键变化，并通知父指令全局刷新所有item
    $scope.$watch(function(scope) {
        return scope.spItem[$attrs.isdelField];
    }, function(isDel, oisDel) {
        if (isDel !== oisDel && isDel) {
            self.refreshParentArr();
        }
    });

}]);
