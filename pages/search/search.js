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
    callbackcount: 10, //设置每页返回数据的多少
    searchLoadingComplete: false, //加载完所有条目
    totalCount: 0, //查询到的总数目
    favour: [], //收藏的objectId列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //查询条目数量
    that.searchTotalCount();
    //查询用户收藏列表
    const promise = new Promise(function (resolve, reject) {
      //查询用户收藏列表
      var User = Bmob.Object.extend("_User");
      var query = new Bmob.Query(User);
      query.get(Bmob.User.current().id, {
        success: function (result) {
          // 查询成功
          console.log("查询当前用户成功");
          var relation = result.relation('like');
          var query = relation.query();
          query.find({
            success: function (list) {
              console.log("查询到" + list.length + "条收藏");
              var favourArray = [];
              for (let i = 0; i < list.length; i++) {
                favourArray.push(list[i].id);
              }
              that.setData({
                favour: favourArray
              });
              resolve(favourArray);
            }
          });
        },
        error: function (object, error) {
          // 查询失败
          console.log("查询当前用户失败");
          reject(error);
        }
      });
    });
    //查询数据
    promise.then(function(favourArray) {
      // success
      that.searchFromCloud(0, that.data.callbackcount);
    }, function(error) {
      // failure
      console.log(error);
    });

    //重置数据 TODO与data保持一致！
    that.setData({
      /*定义search页面加载内容的数组*/
      contentItems: [],
      location: null,
      isHideLoadMore: false,
      pageindex: 0, //第几次加载
      callbackcount: 10, //设置每页返回数据的多少
      searchLoadingComplete: false, //加载完所有条目
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
    wx.vibrateShort();  // 使手机振动15ms  
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
    var newPageIndex = that.data.pageindex + 1;
    that.searchFromCloud(newPageIndex, that.data.callbackcount);
    //未搜索到底则递增分页
    if (!that.data.searchLoadingComplete) {
      that.setData({
        pageindex: newPageIndex,
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
   * 设置搜索地址 TODO
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
   * 查询条目数量 TODO  封装
   * by xinchao
   */
  searchTotalCount: function () {
    var that = this;
    //查询条目数量
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    query.count({
      success: function (count) {
        // 查询成功，返回记录数量
        console.log("共有 " + count + " 条记录");
        that.setData({
          totalCount: count
        })
      },
      error: function (error) {
        // 查询失败
        console.log("查询总条目数错误");
        console.log(error);
      }
    });
  },

  /**
   * 查询用户收藏列表 TOTO 封装
   * by xinchao
   */
  searchFavouriteList: function () {
    var that = this;
    //查询用户收藏列表
    var User = Bmob.Object.extend("_User");
    var query = new Bmob.Query(User);
    query.get(Bmob.User.current().id, {
      success: function (result) {
        // 查询成功
        console.log("查询当前用户成功");
        var relation = result.relation('like');
        var query = relation.query();
        query.find({
          success: function (list) {
            // list contains post liked by the current user which have the title "I'm Hungry".
            console.log("查询到" + list.length + "条收藏");
            var favourArray = [];
            for (let i = 0; i < list.length; i++) {
              favourArray.push(list[i].id);
            }
            that.setData({
              favour: favourArray
            });
          }
        });
      },
      error: function (object, error) {
        // 查询失败
        console.log("查询当前用户失败");
      }
    });
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
    query.descending('createdAt'); //按时间降序排列
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
            var id = object.id;
            var title = object.get('title');
            var price = object.get('price');
            var address = object.get('address');
            var urls = object.get('picUrlArray');
            if (urls == "") {
              //设置为默认图片 url数组注意
              urls = ['../../images/test/camera.png'];
            }
            //考虑时差，换算
            var mDate = Utils.getDateDiffWithJetLag(object.createdAt);

            //收藏
            var favouriteshow = false;
            console.log(id, );
            if (that.data.favour.indexOf(id) > -1) {
              favouriteshow = true;
            }

            var offerItem = {
              title: title,
              price: price,
              address: address,
              src: urls[0],
              date: mDate,
              id: id,
              favouriteshow: favouriteshow
            }
            offerArray.push(offerItem);
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

  /**
   * 点击收藏图标绑定事件，修改图标，修改数据库
   * by xinchao
   */
  favourite_touch: function (event) {
    var that = this;
    var postId = event.currentTarget.dataset.favouriteid;
    var objectId = that.data.contentItems[postId].id;  // 获得数据库对应objectId
    //修改收藏图片显示
    var isshow = this.data.contentItems[postId].favouriteshow;
    var str = 'contentItems[' + postId + '].favouriteshow';

    this.setData({
      [str]: !isshow
    })

    //获取实例
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    query.get(objectId, {
      success: function (result) {
        //将对应ObjectId 的 Offer关联到收藏
        var user = Bmob.User.current();
        var relation = user.relation("like");
        //实现数据库端like的同步
        if (!isshow) {
          //点击之前为false，点击之后为true，表示收藏
          relation.add(result);
        } else {
          //取消收藏
          relation.remove(result);
        }
        user.save();
      },
      error: function (object, error) {
        // 查询失败
        console.log(error);
      }
    });

  },

  /**
   * 点击某一个条目查看详情
   * by xinchao
   */
  itemTap: function (event) {
    var that = this;
    var postId = event.currentTarget.dataset.postid;
    var objectId = that.data.contentItems[postId].id;  // 获得数据库对应objectId
    //跳转条目详情
    wx.navigateTo({
      url: '../search_section/search_section?id=' + objectId
    })
  }

})