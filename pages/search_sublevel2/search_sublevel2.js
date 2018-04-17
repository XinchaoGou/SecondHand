// pages/search_sublevel2/search_sublevel2.js
var app = getApp();
Page({
  data: {
    winHeight: "",//窗口高度
    left: false,//判断左滑布尔数
    right: false,//判断右滑布尔数
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    rpxR:0,//获取px/rpx换算比例
    contentItems11: ['打印机', '投影机', '笔', '收款机', '记事本','电纸书'],
    contentItems12: ['打印机', '投影机', '笔', '收款机', '记事本', '电纸书'],
    contentItems13: ['打印机', '投影机', '笔', '收款机', '记事本', '电纸书'],
  },
  // 滚动切换标签样式
  switchTab: function (e) {

    var index = e.detail.current;//当前所在页面的 index

    if (index > this.data.currentTab) {//左滑事件判断
      this.setData({
        left: true//若为左滑，left值为true
      })
    } else if (index < this.data.currentTab) {//右滑事件判断
      this.setData({
        right: true//若为右滑，right值为true
      })
    }
    this.setData({
      currentTab: e.detail.current
    });
    this.checkCor();
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTab == cur) { return false; }
    else {
      this.setData({
        lastTab: this.data.currentTab,
        currentTab: cur
      })
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab > 2 && this.data.left) {
      this.setData({
        scrollLeft: this.data.scrollLeft+220/this.data.rpxR
      })
    } 
    else if(this.data.currentTab > 2 && this.data.right){
      this.setData({
        scrollLeft: this.data.scrollLeft-220/this.data.rpxR
      })
    }
    else if(this.data.currentTab <= 2){
      this.setData({
        scrollLeft: 0
      })
    }
    else { return false; }
    this.setData({
      right:false,
      left:false
    })
    console.log(this.data.scrollLeft);
  },
  onLoad: function () {
    var that = this;
    //  高度自适应，获取获取px/rpx换算比例
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR - 180;
        console.log(calc)
        that.setData({
          winHeight: calc,
          rpxR:rpxR
        });
      }
    });
  },
  footerTap: app.footerTap,


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }

})