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
    phoneNumber: ""

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var objectId = options.id;
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
        // var phoneNumber = parseInt(result.get('phoneNumber'));
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

        that.setData({
          title: title,
          price: price,
          type: type,
          address: address,
          content: content,
          urls: urls,
          picNumber: picNumber,
          date: date,
          phoneNumber: phoneNumber
        })

      },
      error: function (result, error) {
        console.log("查询失败");
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
   * 打电话
   */
  phone_contact: function () {
    var that = this;
    var phoneNumber = this.data.phoneNumber.toString();
    wx.makePhoneCall({  
      phoneNumber: phoneNumber, //此号码并非真实电话号码，仅用于测试  
      success:function(){  
        console.log("拨打电话成功！")  
      },  
      fail:function(){  
        console.log("拨打电话失败！")  
      }  
    })  
  },
})