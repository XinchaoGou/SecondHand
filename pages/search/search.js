// pages/search/search.js
var Bmob = require("../../utils/bmob.js");
var Utils = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {


    /*定义search页面加载内容的数组*/
    contentItems: [],
    location: null,
    isHideLoadMore: false,
    pageindex: 0, //第几次加载
    callbackcount: 5, //设置每页返回数据的多少
    searchLoadingComplete: false,
    favouriteshow: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.searchFromCloud(0, that.data.callbackcount);
    that.setData({
      //重置数据 TODO与data保持一致！
      contentItems: [],
      location: null,
      isHideLoadMore: false,
      pageindex: 0, //第几次加载
      callbackcount: 10, //设置每页返回数据的多少
      searchLoadingComplete: false
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
    // that.setData({
    //   isHideLoadMore: false
    // });
    var newPageIndex = that.data.pageindex + 1;
    that.searchFromCloud(newPageIndex, that.data.callbackcount);
    //未搜索到底则递增分页
    if (!that.data.searchLoadingComplete) {
      that.setData({
        pageindex: newPageIndex,
        //isHideLoadMore: true
      })
    }
    else {
      //加载完毕，已全部加载
      that.setData({
        isHideLoadMore: true
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


  /**
   * 设置搜索地址
   * by xinchao
   */
  setLocation: function () {
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
  },

  /**
   * 查询服务器
   * pageindex: 分页页码
   * callbackcount : 每页返回数据数目
   * by xinchao
   */
  searchFromCloud: function (pageindex, callbackcount) {

    var that = this;
    //查询数据库获得发布物品信息
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    //设置查询分页大小
    console.log(pageindex, callbackcount);
    query.limit(callbackcount);
    query.skip(callbackcount * pageindex);
    // 查询所有数据
    query.find({
      success: function (results) {
        if (results.length == 0) {
          that.setData({
            searchLoadingComplete: true,
            isHideLoadMore: true
          })
        } else {
          console.log("共查询到 " + results.length + " 条记录");
          //var offerArray = that.data.contentItems;
          var offerArray;
          if (pageindex > 0) {
            offerArray = that.data.contentItems;
          } else {
            offerArray = new Array();
          }
          // 循环处理查询到的数据
          for (var i = 0; i < results.length; i++) {
            var object = results[i];
            var id = object.get('id');
            var title = object.get('title');
            var price = object.get('price');
            var address = object.get('address');
            var urls = object.get('picUrlArray');
            if (urls == "") {
              //设置为默认图片 url数组注意
              urls = ['../../images/test/camera.png'];
            }
            //时间计算,德国时间加6小时为中国时间
            var mDate = Utils.getDateDiffWithJetLag(object.createdAt , 6);

            var offerItem = {
              title: title,
              price: price,
              address: address,
              src: urls[0],
              date: mDate,
              id : id
            }
            offerArray.push(offerItem);
            console.log(offerArray);
          }
          //存储到本地
          that.setData({
            contentItems: offerArray
          })
        }
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },
  /*通往搜索sublevel1子页面入口，出现了问题，堆栈方面的，需要后续处理 by yining*/
  tosubsearch: function () {
    wx.navigateTo({ url: '../search_sublevel1/search_sublevel1' })
  },

  /*点击切换favourite图标 by yining*/
  favourite_touch: function () {
    var isshow = this.data.favouriteshow;
    this.setData({ favouriteshow: !isshow })
  },
  /*通往搜索section子页面入口，出现了问题，堆栈方面的，需要后续处理 ，暂时设置的便于前端设计，后续要更改by_yining*/
  to_page_search_section: function () {
    wx.navigateTo({ url: '../search_section/search_section' })
  }

})