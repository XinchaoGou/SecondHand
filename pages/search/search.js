// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    
   
    /*定义search页面加载内容的数组*/
    contentItems:['','','','','',''],
    favouriteshow:true
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
  /*通往搜索sublevel1子页面入口，出现了问题，堆栈方面的，需要后续处理 by yining*/
  tosubsearch: function(){
    wx.navigateTo({url:'../search_sublevel1/search_sublevel1'})
  },

  /*点击切换favourite图标 by yining*/
  favourite_touch: function(){
    var isshow=this.data.favouriteshow;
    this.setData({favouriteshow:!isshow})
  },
  /*通往搜索section子页面入口，出现了问题，堆栈方面的，需要后续处理 ，暂时设置的便于前端设计，后续要更改by_yining*/
  to_page_search_section: function () {
    wx.navigateTo({ url: '../search_section/search_section' })
  },
})