// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /*定义选择组件wiper的数据 */
    array: ['按距离远近', '按发布时间', '按价格从低到高', '按价格从高到低'],
    objectArray: [
      {
        id: 0,
        name: '按距离远近'
      },
      {
        id: 1,
        name: '按发布时间'
      },
      {
        id: 2,
        name: '按价格从低到高'
      },
      {
        id: 3,
        name: '按价格从高到低'
      }
    ],
    index: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },

  confirm: function(){
    wx.navigateBack()
  },

  back: function(){
    wx.navigateBack()
  }
})