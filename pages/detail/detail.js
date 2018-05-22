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
    is_disabled: true,//判断是否禁用accept和delete按钮
  },
  /**
     * 物品内容，字数改变触发事件
     * TODO: 根据重构的代码修改
     * by xinchao
     * 从offer.js页面直接摘抄by yining
     */
  bindTextAreaChange: function (e) {
    var that = this;
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > that.data.noteMaxLen)
      return;
    that.setData({
      content: value,
      noteNowLen: len
    })
    if (len > 0) {
      that.setData({
        is_disabled: false
      })
    }
    else {
      that.setData({
        is_disabled: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('监听detail页面onLoad函数')
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
    console.log('监听detail页面onShow函数')
    var that = this;
    console.log(that.data.content.length)
    if (that.data.content.length > 0) {
      that.setData({
        is_disabled: false
      })
    }
    else{
      that.setData({
        is_disabled: true
      })
    }
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
    console.log('执行了卸载函数')
    var that = this;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面 //直接调用上一个页面的setData()方法，把数据存到上一个页面中去 
    var value = that.data.content,
      len = parseInt(value.length);
    var str = 'offerItem.content';
    if (len > 0) {
      prevPage.setData({
        [str]: value,
        isContent: true
      })
    }
    else{
      prevPage.setData({
        [str]: value,
        isContent: false
      })
    }
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
      content: '',
      is_disabled:true
    })
  },
  //by yining
  accept_tap: function (e) {
    wx.navigateBack({
      delta: 1
    })
  }
})