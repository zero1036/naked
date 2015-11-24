angular.module('nd.sptable', ['ngAnimate'])

.directive('ndSptable', function() {
    return {
        scope: {
            spArr: '='
        },
        controller: function($scope, $element, $attrs, $transclude) {

            if (!angular.isDefined($attrs.rowField) || !angular.isDefined($attrs.scaleField) || !angular.isDefined($attrs.isdelField)) {
                return;
            }

            //刷新集合
            this.refreshArr = function(arr, oldArr) {
                if (arr === undefined) {
                    arr = $scope.spArr;
                }

                //目前最多支持10行
                for (var irow = 1; irow <= 10; irow++) {
                    //获取当前行所有item集合
                    var arrInRow = arr.filter($attrs.rowField, irow);
                    //过滤不是删除的记录
                    arrInRow = arrInRow.filter($attrs.isdelField, false);

                    if (arrInRow.length === 0) {
                        return;
                    }

                    //获取所有item所占scale总和
                    var totalScale = getTotalScale(arrInRow);

                    for (var i = 0, en; en = arrInRow[i++];) {
                        calculateWidth(en, totalScale);
                    }
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
                    item.width = (itemScale / totalScale) * 100;
                    item.width = item.width + "%";
                }

            }
        }
    }
})

.directive('ndSpitem', function() {
    return {
        require: ['?^ndSptable', '?^ndSpitem'],
        scope: {
            spItem: '='
        },
        controller: function($scope, $element, $attrs, $transclude) {

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
            }, function(scale) {
                self.refreshParentArr();
            });

            //监听item的比例变化，并通知父指令全局刷新所有item
            $scope.$watch(function(scope) {
                return scope.spItem.isDel;
            }, function(isDel) {
                if (isDel) {
                    self.refreshParentArr();
                }
            });

        },
        link: function(scope, el, attr, ctrls) {
            ctrls[1].refreshParentArr = ctrls[0].refreshArr;
        }
    };
})



// .directive('ndSpadd', function() {
//     return {
//         require: ['?^ndSptable', '?^ndSpitem'],
//         scope: {
//             spItem: '='
//         },
//         controller: function($scope, $element, $attrs, $transclude) {

//             this.refreshParentArr = angular.loop;
//             var self = this;
//             //监听item的宽度变化，并改变DOM样式
//             $scope.$watch(function(scope) {
//                 return scope.spItem.width;
//             }, function(wid) {
//                 //获取元素
//                 $element[0].style.width = wid;
//             });

//             //监听item的比例变化，并通知父指令全局刷新所有item
//             $scope.$watch(function(scope) {
//                 return scope.spItem.scale;
//             }, function(scale) {
//                 self.refreshParentArr();
//             });

//         },
//         link: function(scope, el, attr, ctrls) {
//             ctrls[1].refreshParentArr = ctrls[0].refreshArr;
//         }
//     };
// })
