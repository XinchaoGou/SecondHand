// pages/search_section/search_section.js
var Bmob = require("../../utils/bmob.js");
var Utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title : "testwaldstadt好房4月5号-9月25号zwischen",
    price : 0,
    type : "test这里是种类",
    address : "test这里是地点",
    content : "test，可an，房间20平左右，带小阳台，周围环境很好，步行五分钟以内post，edeka，penny，sparkasse，dm一应俱全，步行到车站5分钟，4号线10分钟直达kit南校区。室友两个kit中国学生，一男一女，人很nett。要求爱干净，能定期做值日，有兴趣的私聊",
    urls: [],
    picNumber : 0,
    mDate : "",
    
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
        var urls = result.get('picUrlArray');
        if (urls == "") {
          //设置为默认图片 url数组注意
          urls = ['../../images/test/camera.png'];
        }
        //计算照片张数
        var picNumber = urls.length;
        //时间计算,德国时间加6小时为中国时间 TODO
        var mDate = Utils.getDateDiffWithJetLag(result.createdAt, 6);

        that.setData({
          title : title,
          price : price,
          type : type,
          address : address,
          content : content,
          urls: urls,
          picNumber : picNumber,
          mDate : mDate,
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

  }
})