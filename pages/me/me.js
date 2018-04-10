var Bmob = require("../../utils/bmob.js");
var Utils = require("../../utils/util.js");
var app = getApp();

Page({

  data: {
    warnSize: 'default',
    imgUrl: null,
    userInfo: {},
    contentItems: [],

    //页面隐藏设计添加的变量，by yining
    showOffer: false,
    showFavourite: false
  },

  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        name: userInfo.nickName,
        imgUrl: userInfo.avatarUrl
      })
    })
    that.searchFavouriteList();
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
              var offerItem = {
                title: title,
                price: price,
                address: address,
                src: urls[0],
                date: mDate,
                id: id,
                favouriteshow: true
              }
              favourArray.push(offerItem);
            }
            that.setData({
              contentItems: favourArray
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

  //页面隐藏设计添加的函数，by yining
  tofavourite: function () {
    var that = this;
    var switch1 = that.data.showFavourite;
    this.setData({
      showFavourite: !switch1
    })
  },

  tooffer: function () {
    var that = this;
    var switch2 = that.data.showOffer;
    this.setData({
      showOffer: !switch2
    })
  },

  //TODO
  onShow: function () {

  },
  //分享 TODO
  onShareAppMessage: function () {
    return {
      title: '自定义分享标题',
      desc: '自定义分享描述',
      path: '/page/user?id=123'
    }
  },
})
