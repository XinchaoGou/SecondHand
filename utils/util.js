const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function obj2uri(obj) {
  return Object.keys(obj).map(function (k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
  }).join('&');
}


//字符串转换为时间戳
function getDateTimeStamp(dateStr) {
  return Date.parse(dateStr.replace(/-/gi, "/"));
}
//格式化时间
function getDateDiffWithJetLag(dateStr, jetLag) {
  var publishTime = getDateTimeStamp(dateStr) / 1000;
  var d_seconds;
  var d_minutes;
  var d_hours;
  var d_days;
  //添加周，月份和年份 by xinchao
  var d_weeks;
  var d_months
  var d_years;

  var d;
  var timeNow = parseInt(new Date().getTime() / 1000) + jetLag * 60 * 60;

  d = timeNow - publishTime;
  d_days = parseInt(d / 86400);
  d_hours = parseInt(d / 3600);
  d_minutes = parseInt(d / 60);
  d_seconds = parseInt(d);
  //添加月份和年份 by xinchao
  d_weeks = parseInt(d_days / 7);
  d_months = parseInt(d_days / 30);
  d_years = parseInt(d_days / 365);

  if (d_years > 0) {
    return d_years + '年前';
  } else if (d_years <= 0 && d_months > 6) {
    return '半年前';
  } else if (d_years <= 0 && d_months > 0) {
    return d_months + '月前';
  } else if (d_years <= 0 && d_months <= 0 && d_weeks > 0) {
    return d_weeks + '周前';
  } else if (d_years <= 0 && d_months <= 0 && d_weeks <= 0 && d_days > 0) {
    return d_days + '天前';
  } else if (d_days <= 0 && d_hours > 0) {
    return d_hours + '小时前';
  } else if (d_hours <= 0 && d_minutes > 0) {
    return d_minutes + '分钟前';
  } else if (d_seconds < 60) {
    if (d_seconds <= 0) {
      return '刚刚';
    } else {
      return d_seconds + '秒前';
    }
  }
}

function buttonClicked(self) {
  self.setData({
    buttonClicked: true
  })
  setTimeout(function () {
    self.setData({
      buttonClicked: false
    })
  }, 500)
}

module.exports = {
  formatTime: formatTime,
  getDateDiffWithJetLag: getDateDiffWithJetLag,
  buttonClicked: buttonClicked,
}

