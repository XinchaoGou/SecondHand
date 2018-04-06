// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    
   
    /*定义search页面加载内容的数组*/
    contentItems: [],
    location: null,
    isHideLoadMore: true,
    pageindex: 0, //第几次加载
    callbackcount: 10, //设置每页返回数据的多少
    searchLoadingComplete: false,
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
            searchLoadingComplete: true
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