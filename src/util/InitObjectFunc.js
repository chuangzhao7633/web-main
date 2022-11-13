/*
* 添加类方法
* */

Date.prototype.format = function(time) {
  const obj = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(), //day
    "h+" : this.getHours(), //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3), //quarter
    "S" : this.getMilliseconds() //millisecond
  }

  if(/(y+)/.test(time)) {
    time = time.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  }

  for(let k in obj) {
    if(new RegExp("("+ k +")").test(time)) {
      time = time.replace(RegExp.$1, RegExp.$1.length==1 ? obj[k] : ("00"+ obj[k]).substr((""+ obj[k]).length));
    }
  }
  return time;
};