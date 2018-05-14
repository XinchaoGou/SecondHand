// pages/search_section/search_section.js
var Bmob = require("../../utils/bmob.js");
var Utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    price: 0,
    type: "",
    address: "",
    content: "",
    urls: [],
    picNumber: 0,
    date: "",
    phoneNumber: 0,
    favouriteshow: false,
    offerId: "",
    postId: 0,

    

    //by yining,屏幕宽高
    screenHeight: 0,
    screenWidth: 0,  
    isLoadingHidden: false,

    //地图加载相关
    latitude: 0,
    longitude: 0,
    markers: [],
    controls: [{
      id: 1,
      iconPath: '/images/test/define-location-64.png',
      position: {
        left: 10,
        top: 20,
        width: 20,
        height: 20
      },
      clickable: true
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var objectId = options.id;
    var postId = options.postId;
    var favor = false;
    if (options.favor == 'false') {
      favor = false;
    } else {
      favor = true;
    }
    that.setData({
      offerId: objectId,
      favouriteshow: favor,
      postId: postId
    })
    //查询数据
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    query.get(objectId, {
      success: function (result) {
        // The result was retrieved successfully.
        console.log("查询成功");
        var title = result.get('title');
        var price = result.get('price');
        var type = result.get('typeName');
        var address = result.get('address');
        var content = result.get('content');
        var phoneNumber = result.get('phoneNumber');
        var urls = result.get('picUrlArray');
        if (urls == "") {
          //设置为默认图片 url数组注意
          urls = ['../../images/test/camera.png'];
        }
        //计算照片张数
        var picNumber = urls.length;
        //时间计算
        var date = Utils.getDateDiffWithJetLag(result.createdAt);
        //地图数据
        var location = result.get('location');
        var latitude = location.latitude;
        var longitude = location.longitude;
        var StrLatitude = 'markers[0].latitude';
        var StrLongitude = 'markers[0].longitude';
        var StrName = 'markers[0].name';

        that.setData({
          title: title,
          price: price,
          type: type,
          address: address,
          content: content,
          urls: urls,
          picNumber: picNumber,
          date: date,
          phoneNumber: phoneNumber,

          //地图相关
          latitude: latitude,
          longitude: longitude,
          [StrLatitude]: latitude,
          [StrLongitude]: longitude,
          [StrName]: title,

        })

      },
      error: function (result, error) {
        console.log("查询失败");
      }
    });
    //调用api获取屏幕的宽高
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenWidth: res.windowWidth
        });
      }
    });
  
  },

  //根据屏幕的宽高等比例缩放计算图片的宽高，by yining
  imageLoad: function (e) {
    var that = this;
    console.log(that.data.isLoadingHidden)
    console.log('图片加载')
    that.setData({
      isLoadingHidden:true
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
   * TODO:
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
    var that = this;
    var title = that.data.title;
    var offerId = that.data.offerId;
    
    return {
      title: title,
      path: 'pages/search/search?id='+offerId,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },

  /**
   * 打电话
   * TODO: 修改后续如果没有电话，直接禁用
   * by xinchao
   */
  phone_contact: function () {
    var that = this;
    var phoneNumber = that.data.phoneNumber;
    if (phoneNumber == 0) {
      wx.showToast({
        title: '电话号码为空',
        duration: 1000
      })
    } else {
      phoneNumber = that.data.phoneNumber.toString();

      wx.makePhoneCall({
        phoneNumber: phoneNumber, 
        success: function () {
        },
        fail: function () {
        }
      })
    }
  },

  /**
   * 点击收藏图标绑定事件，修改图标，修改数据库TODO:
   * by xinchao
   */
  favourite_touch: function (event) {
    var that = this;
    //修改收藏图片显示
    var isshow = that.data.favouriteshow;

    that.setData({
      favouriteshow: !isshow
    })
    //修改父视图中的值 TODO
    var searchPage = getCurrentPages()[getCurrentPages().length - 2];
    var postId = that.data.postId;
    var str = 'contentItems[' + postId + '].favouriteshow';

    searchPage.setData({
      [str]: !isshow
    })

    //获取实例
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    query.get(that.data.offerId, {
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
   * 点击地图置位控件
   * by xinchao
   */
  controltap: function (event) {
    var that = this;
    var StrLatitude = 'markers[0].latitude';
    var StrLongitude = 'markers[0].longitude';
    var StrName = 'markers[0].name';
    var latitude = that.data.latitude;
    var longitude = that.data.longitude;
    var title = that.data.title;
    that.setData({
      //地图相关
      latitude: latitude,
      longitude: longitude,
      [StrLatitude]: latitude,
      [StrLongitude]: longitude,
      [StrName]: title,
    })
  },

  /**
   * 点击图片放大预览
   * by xinchao
   */
  imgOverView: function (event) {
    var index = event.currentTarget.dataset.index;
    var that = this;
    var urls = that.data.urls;
    //图片预览
    wx.previewImage({
      current: urls[index], // 当前显示图片的链接，不填则默认为 urls 的第一张
      urls: urls,

      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },


})