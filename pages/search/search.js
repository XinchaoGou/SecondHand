// pages/search/search.js
var Bmob = require("../../utils/bmob.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {


    /*定义search页面加载内容的数组*/
    contentItems: [],
    location: null,
    isHideLoadMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //查询数据库获得发布物品信息
    var Offer = Bmob.Object.extend("Offer");
    var offer = new Bmob.Query(Offer);
    // 查询所有数据
    offer.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
        //var offerArray = that.data.contentItems;
        var offerArray = new Array();
        // 循环处理查询到的数据
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          var title = object.get('title');
          var price = object.get('price');
          var address = object.get('address');
          var urls = object.get('picUrlArray');
          var mDate = object.createdAt;
          var offerItem = {
            title: title,
            price: price,
            address: address,
            src: urls[0],
            date: mDate
          }
          offerArray.push(offerItem);
        }
        //存储到本地
        that.setData({
          contentItems: offerArray
        })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
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
   * by xinchao
   */
  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.onLoad();
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    that.setData({
      isHideLoadMore: false
    });
    console.log("已经触底");
    //模拟加载
    setTimeout(function()
    {
      console.log("模拟结束");
    },1500);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 跳转搜索设置
   * by yining
   */
  tosubsearch: function () {
    wx.navigateTo({ url: '../search_sublevel1/search_sublevel1' })
  },

  /**
   * 设置搜索地址
   * by xinchao
   */
  setLocation: function (params) {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        //电脑调试的时候，经纬度为空，手机上可以运行
        var longitude = res.longitude;
        var latitude = res.latitude;
        var location = new Bmob.GeoPoint({ latitude: latitude, longitude: longitude });
        that.setData({
          location: location
        })
        console.log(that.data.location);
      },
      fail: function (e) {
      },
      complete: function (e) {
      }
    })
  }
})