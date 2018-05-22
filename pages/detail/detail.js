// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //物品内容
    content: "",
    noteNowLen: 0,//备注当前字数
    noteMaxLen: 600,//备注最多字数
    accept_disabled: true,//判断是否禁用accept按钮
    delete_disabled: true,//判断是否禁用delete按钮
  },
  /**
     * 物品内容，字数改变触发事件
     * TODO: 根据重构的代码修改
     * by xinchao
     * 从offer.js页面直接摘抄by yining
     */
  bindTextAreaChange: function (e) {

    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面 
    var prevPage = pages[pages.length - 2]; //上一个页面 //直接调用上一个页面的setData()方法，把数据存到上一个页面中去 
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > currPage.data.noteMaxLen)
      return;
    currPage.setData({
      content: value,
      noteNowLen: len
    })
    var str = 'offerItem.content';
    prevPage.setData({
      [str]: value,
      isContent: true,
    })
    if (len > 0) {
      currPage.setData({
        accept_disabled: false,
        delete_disabled: false
      })
    }
    else{
      currPage.setData({
        accept_disabled: true,
        delete_disabled: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var content = options.content;
    console.log(content);
    that.setData({
      content: content,
      noteNowLen: parseInt(content.length)
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
    console.log('此时要修改父页面的值')
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面 
    var prevPage = pages[pages.length - 2]; //上一个页面 //直接调用上一个页面的setData()方法，把数据存到上一个页面中去 
    var str = 'offerItem.content';
    prevPage.setData({
      [str]: that.data.content,
      isContent: true,
    })
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

  //by yining 
  /**
   * modified by xinchao
   */
  delete_tap: function (e) {
    var that = this;
    that.setData({
      content: ''
    })
  },
  //by yining
  accept_tap: function (e) {
    console.log('进入了此函数')
    wx.navigateBack({
      delta: 1
    })
  }
})