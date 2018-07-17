// 初始化Bmob
require('utils/initial.js');
var Bmob = require('utils/bmob.js');

//app.js
App({
  //test 苟新超
  onLaunch: function () {
    var user = new Bmob.User() //开始注册用户
    user.auth()

  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == 'function' && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == 'function' && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },

  //TODO:  测试用后续删除
  loadSeller: function (cb) {
    var query = new Bmob.Query('Seller');
    query.find().then(function (sellerObjects) {
      var seller = sellerObjects[0];
      cb(seller);
    });
  },


  globalData: {
    userInfo: null
  }
})
