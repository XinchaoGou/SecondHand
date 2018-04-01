// pages/offer/offer.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //发布标题
    showTopTips: false,
    TopTips: '',
    //物品类别
    types: ["电子产品", "学习资料", "家具", "其他"],
    typeIndex: "0",
    //交易地点
    address: '点击选择位置',
    longitude: 0, //经度
    latitude: 0,//纬度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 提交表单
   * by xinchao
   */
  submitForm: function (event) {

  },

  /**
   * 改变活动类别
   * by xinchao
   */
  bindTypeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },

  /**
   * 选择地点
   * by xinchao
   */
  addressChange: function (e) {
    this.addressChoose(e);
  },
  addressChoose: function (e) {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        //电脑调试的时候，经纬度为空，手机上可以运行
        that.setData({
          address: res.name,
          longitude: res.longitude, //经度
          latitude: res.latitude,//纬度
        })
        if (e.detail && e.detail.value) {
          this.data.address = e.detail.value;
        }
      },
      fail: function (e) {
      },
      complete: function (e) {
      }
    })
  },

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