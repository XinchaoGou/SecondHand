var Bmob = require("../../utils/bmob.js");
var Utils = require("../../utils/util.js");
var app = getApp();

Page({

  data: {
    // warnSize: 'default',
    imgUrl: null,
    userInfo: {},
    favorList: [],
    offerList: [],

    //页面隐藏设计添加的变量，by yining
    isShowOffer: false,
    isShowFavourite: false
  },

  onLoad: function () {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        name: userInfo.nickName,
        imgUrl: userInfo.avatarUrl
      })
    })

  },

  //TODO
  onShow: function () {
    var that = this;
    //获取用户收藏列表和用户发布列表 TODO
    that.searchFavouriteList();
    that.searchOfferList();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作TODO
   * by xinchao
   */
  onPullDownRefresh: function () {
    // console.log('执行了下拉刷新');
    var that = this;
    wx.vibrateShort();  // 使手机振动15ms  
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //todo
    that.onLoad();
    that.onShow();
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },


  //分享 TODO
  onShareAppMessage: function () {
    return {
      title: '自定义分享标题',
      desc: '自定义分享描述',
      path: '/page/user?id=123'
    }
  },

  /*
   * 查询用户的所有发布
   * by xinchao
   */
  searchOfferList: function () {
    var that = this;
    var currentUser = Bmob.User.current();
    var objectId = currentUser.id;

    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    var isme = new Bmob.User();
    isme.id = objectId;     //当前用户的objectId
    query.equalTo("publisher", isme);
    query.descending('createdAt');  //排序

    query.find({
      success: function (results) {
        console.log("查询到" + results.length + "条发布");
        var offerArray = [];
        for (let i = 0; i < results.length; i++) { 
          
          var object = results[i];
          //获得发布条目内容详情
          var id = object.id;
          var title = object.get('title');
          var price = object.get('price');
          var address = object.get('address');
          var urls = object.get('picUrlArray');
          if (urls == "") {
            //没有图片则设置为默认图片 url数组注意
            urls = ['../../images/test/camera.png'];
          }
          //考虑时差，换算
          var mDate = Utils.getDateDiffWithJetLag(object.createdAt);
          var offerItem = {
            id: id,
            title: title,
            price: price,
            address: address,
            src: urls[0],
            date: mDate,
          }
          offerArray.push(offerItem);
        }

        that.setData({
          offerList: offerArray
        })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },

  /**
   * 查询用户收藏列表封装
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
        query.descending('createdAt');  //排序
        query.find({
          success: function (list) {
            // list contains post liked by the current user which have the title "I'm Hungry".
            console.log("查询到" + list.length + "条收藏");
            var favourArray = [];
            for (let i = 0; i < list.length; i++) {
              var object = list[i];
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
              var favorItem = {
                title: title,
                price: price,
                address: address,
                src: urls[0],
                date: mDate,
                id: id,
                favouriteshow: true
              }
              favourArray.push(favorItem);
            }
            that.setData({
              favorList: favourArray
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
   * 点击收藏图标绑定事件，修改图标，修改数据库
   * by xinchao
   */
  favourite_touch: function (event) {
    var that = this;
    var postId = event.currentTarget.dataset.favouriteid;
    var objectId = that.data.favorList[postId].id;  // 获得数据库对应objectId

    //即时更新视图，不再显示已经取消的收藏   
    var isshow = this.data.favorList[postId].favouriteshow;
    var tFavorItems = that.data.favorList;
    tFavorItems.splice(postId, 1);
    that.setData({
      favorList: tFavorItems
    })

    //获取实例
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    console.log('abc');
    query.get(objectId, {
      success: function (result) {
        console.log('success');
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
   * 点击某一个收藏条目查看详情
   * by xinchao
   */
  favorItemTap: function (event) {
    var that = this;
    var postId = event.currentTarget.dataset.postid;
    var objectId = that.data.favorList[postId].id;  // 获得数据库对应objectId
    var favor = that.data.favorList[postId].favouriteshow;
    console.log(favor);
    //跳转条目详情
    wx.navigateTo({
      url: '../search_section/search_section?id=' + objectId + '&favor=' + favor
        + '&postId=' + postId
    })
  },

  /**
   * 点击某一个发布条目查看详情
   * by xinchao
   */
  offerItemTap: function (event) {
    var that = this;
    var postId = event.currentTarget.dataset.postid;
    var objectId = that.data.offerList[postId].id;  // 获得数据库对应objectId
    // var favor = that.data.offerList[postId].favouriteshow;
    //TODO
    var favor = false;
    //跳转条目详情
    wx.navigateTo({
      url: '../search_section/search_section?id=' + objectId + '&favor=' + favor
        + '&postId=' + postId
    })
  },

  /**
   * 点击按钮删除某一个发布条目
   * by xinchao
   */
  offerDeleteTap: function (event) {
    var that = this;
    var postId = event.currentTarget.dataset.postid;
    var objectId = that.data.offerList[postId].id; // 获得数据库对应发布条目的objectId

    //删除确认框
    wx.showModal({
      title: '删除确认',
      content: '您确认要删除该发布吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.offerDelete(postId,objectId);
        } else if (res.cancel) {
          console.log('用户点击取消') //结束函数不删除条目
          return;
        }
      }
    })
  },

  /**
   * 点击按钮重新编辑某一个发布条目
   * by xinchao
   */
  offerSetTap: function (event) {
    console.log('重新编辑发布条目信息');
    var that = this;
    var postId = event.currentTarget.dataset.postid;
    var objectId = that.data.offerList[postId].id;  // 获得数据库对应objectId

    //加载对应发布条目内容
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    query.get(objectId, {
      success: function (result) {
        var id = result.id;
        var picUrlArray = result.get("picUrlArray");
        var title = result.get("title");
        var typeName = result.get("typeName");
        var address = result.get("address");
        var location = result.get("location");
        var content = result.get("content");
        var price = result.get("price");
        var publisher = result.get("publisher");
        var wxNumber = result.get("wxNumber");
        var phoneNumber = result.get("phoneNumber");
        var eMail = result.get("eMail");

        var offerForm = {
          id: id,
          picUrlArray: picUrlArray,
          title: title,
          typeName: typeName,
          address: address,
          location: location,
          content: content,
          price: price,
          publisher: publisher,
          wxNumber: wxNumber,
          phoneNumber: phoneNumber,
          eMail: eMail,
        }
        //同步缓存到数据到本地
        try {
          wx.setStorageSync('offerForm', offerForm);
          //跳转发布页面 TODO 可能BUG跳转页面后数据还没存到本地
          wx.switchTab({
            url: '../offer/offer'
          })
        } catch (e) {
        }
      },
      error: function (object, error) {
        // 查询失败
      }
    });


  },

  /**
   * 删除某一个发布条目
   * by xinchao
   */
  offerDelete: function (postId,objectId) {
    var that = this;
    //根据对应的objectId删除指定的发布条目
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    query.get(objectId, {
      success: function (myObject) {
        // 查询成功，调用destroy删除指定条目
        myObject.destroy({
          success: function (myObject) {
            // 删除成功
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 2000
            })

            //即时更新视图，不再显示已经删除的条目  
            var tOfferItems = that.data.offerList;
            tOfferItems.splice(postId, 1);
            that.setData({
              offerList: tOfferItems
            })
          },
          error: function (myObject, error) {
            // 删除失败
            console.log('删除条目失败')
          }
        });
      },
      error: function (object, error) {
        // 查询失败
        console.log('查询要删除的条目失败')
      }
    });
  },

  //页面隐藏设计添加的函数，by yining
  tofavourite: function () {
    var that = this;
    var switch1 = that.data.isShowFavourite;
    this.setData({
      isShowFavourite: !switch1
    })
  },

  tooffer: function () {
    var that = this;
    var switch2 = that.data.isShowOffer;
    this.setData({
      isShowOffer: !switch2
    })
  },

})
