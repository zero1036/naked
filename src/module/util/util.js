var ut = angular.module('nd.util', []);

ut.factory('$$util', function() {
    var service = {};

    //返回对象格式名称
    service.lastName = function(filepath, tp) {
        //获取欲上传的文件路径
        //var filepath = document.getElementById("file1").value;
        //为了避免转义反斜杠出问题，这里将对其进行转换
        var re = /(\\+)/g;
        var filename = filepath.replace(re, "#");
        //对路径字符串进行剪切截取
        var one = filename.split("#");
        //获取数组中最后一个，即文件名
        var two = one[one.length - 1];
        //再对文件名进行截取，以取得后缀名
        var three = two.split(".");
        //获取截取的最后一个字符串，即为后缀名
        var last = three[three.length - 1];
        //添加需要判断的后缀名类型
        //var tp = "jpg,gif,bmp,png,JPG,GIF,BMP,PNG";
        //返回符合条件的后缀名在字符串中的位置
        var rs = tp.indexOf(last);
        //如果返回的结果大于或等于0，说明包含允许上传的文件类型
        if (rs >= 0) {
            return true;
        } else {
            alert("您选择的上传文件不是有效的图片文件！");
            return false;
        }
    };

    //获取选中对象的属性，并生成以逗号连接的文本
    service.getChecked = function(list, key) {
        var selectIds = ""; //选中的ID
        if (list === null) {
            return "";
        }

        for (var i = 0, en; en = list[i++];) {
            if (en.isChecked) {
                selectIds += (en[key] + ",");
            }
        }

        if (selectIds.length > 0)
            selectIds = selectIds.substring(0, selectIds.length - 1); //去掉最后一个","
        return selectIds;
    };

    //根据实体的属性排序
    service.sort = function(array, attr) {
        return array.sort(function(a, b) {
            return a[attr] - b[attr];
        });
    };

    // 对Date的扩展，将 Date 转化为指定格式的String 
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
    // 例子： 
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
    Date.prototype.Format = function(fmt) { //author: meizz 
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    return service;
});
