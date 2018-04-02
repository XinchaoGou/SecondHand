// pages/offer/offer.js

var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //发布标题
    showTopTips: false,
    TopTips: '',
    //物品类别
    types: ["电子产品", "学习资料", "家具", "其他"],
    typeIndex: "0",
    //交易地点
    address: '点击选择位置',
    longitude: 0, //经度
    latitude: 0,//纬度
    //物品内容
    content: "",
    noteNowLen: 0,//备注当前字数
    noteMaxLen: 200,//备注最多字数
    //物品图片


    //阅读并同意填写联系方式
    isAgree: false,
    showInput: false,//显示输入真实姓名,
    //发布须知
    notice_status: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({//初始化数据
      src: "",
      isSrc: false,
    })
  },

  /**
   * 提交表单
   * by xinchao
   */
  submitForm: function (event) {

  },

  /**
   * 改变活动类别
   * by xinchao
   */
  bindTypeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },

  /**
   * 选择交易地点
   * by xinchao
   */
  addressChange: function (e) {
    this.addressChoose(e);
  },
  addressChoose: function (e) {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        //电脑调试的时候，经纬度为空，手机上可以运行
        that.setData({
          address: res.name,
          longitude: res.longitude, //经度
          latitude: res.latitude,//纬度
        })
        if (e.detail && e.detail.value) {
          this.data.address = e.detail.value;
        }
      },
      fail: function (e) {
      },
      complete: function (e) {
      }
    })
  },

  /**
   * 物品内容，字数改变触发事件
   * by xinchao
   */
  bindTextAreaChange: function (e) {
    var that = this
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > that.data.noteMaxLen)
      return;
    that.setData({
      content: value, noteNowLen: len
    })
  },

  /**
   * 物品图片
   * by xinchao
   */
  //上传活动图片
  uploadPic: function () {//选择图标
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], //压缩图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          isSrc: true,
          src: tempFilePaths
        })
      }
    })
  },
  //删除图片
  clearPic: function () {//删除图片
    that.setData({
      isSrc: false,
      src: ""
    })
  },

  /**
   * 发布须知
   * by xinchao
   */
  //同意相关条例
  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length,
      showInput: !this.data.showInput
    });
  },

  /**
   * 发布须知
   * by xinchao
   */
  tapNotice: function (e) {
    if (e.target.id == 'notice') {
      this.hideNotice();
    }
  },
  showNotice: function (e) {
    this.setData({
      'notice_status': true
    });
  },
  hideNotice: function (e) {
    this.setData({
      'notice_status': false
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