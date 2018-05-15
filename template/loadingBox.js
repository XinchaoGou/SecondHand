// 加载框
function dataLoading(txt, icon, fun) {
  wx.showToast({
    title: txt,
    icon: icon,
    duration: 500,
    mask : true,
    success: fun
  })
}
module.exports.dataLoading = dataLoading;