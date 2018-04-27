var Bmob = require("../../utils/bmob.js");
var common = require('../../template/loadingBox.js');
var that;
// pages/offer/offer.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //表单验证相关 TODO
    showTopTips: false,
    TopTips: '',
    //发布标题
    focus: false,
    //物品类别
    types: ["所有种类","房屋租赁", "电子产品", "学习资料", "家具", "交通工具","乐器","有偿帮带","其他"],
    typeIndex: "0",
    //交易地点
    address: '点击选择位置',
    longitude: 0, //经度
    latitude: 0,//纬度
    //物品价格 TODO
    // price: 0,
    isPriceShow:false,
    //物品内容
    content: "",
    noteNowLen: 0,//备注当前字数
    noteMaxLen: 400,//备注最多字数
    //物品图片
    isSrc: false,
    is9: false,
    tempFilePaths: [],
    //阅读并同意填写联系方式
    isAgree: false,
    showInput: false,//显示输入真实姓名,
    //发布须知
    notice_status: false,
    //发布按钮禁用
    isdisabled: false,
    textarea_show: true,

    //修改发布内容
    isModify : false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
  },

  /**
   * 提交表单
   * by xinchao
   */
  submitForm: function (e) {

    //阅读发布须知 TODO 改为toast
    if (that.data.showInput == false) {
      wx.showModal({
        title: '提示',
        content: '请先阅读《发布须知》'
      })
      return;
    }

    //设置禁用按钮
    that.setData({
      isdisabled: true
    })

    //表单验证
    if (that.showTopTips(e)) {

      wx.showLoading({
        title: '加载中',
      })
      const promise = new Promise(function (resolve, reject) {

        //发布照片
        var urlArr = new Array();
        var tempFilePaths = that.data.tempFilePaths;
        var imgLength = tempFilePaths.length;
        console.log("进入了a")
        if (imgLength > 0) {
          //日期作为图片名的一部分
          var newDate = new Date();
          var newDateStr = newDate.toLocaleDateString();

          var j = 0;
          for (var i = 0; i < imgLength; i++) {
            var tempFilePath = [tempFilePaths[i]];
            var extension = /\.([^.]*)$/.exec(tempFilePath[0]);
            if (extension) {
              extension = extension[1].toLowerCase();
            }
            var name = newDateStr + "." + extension;//上传的图片的别名

            var file = new Bmob.File(name, tempFilePath);
            file.save().then(function (res) {
              var url = res.url();
              urlArr.push(url);
              j++;
              if (imgLength == j) {
                console.log("成功上传图片");
                resolve(urlArr);
              }

            }, function (error) {
              console.log(error);
              reject(error);
            });
          }
          console.log("进入了b")
        }
        else {
          //没传图片的时候
          resolve(urlArr);
        }
      });

      promise.then(function (urlArr) {
        console.log("进入了c")
        //发布内容相关
        var title = e.detail.value.title;//发布标题
        var typeIndex = that.data.typeIndex;
        var types = that.data.types;
        var typeName = types[typeIndex]; //物品类别
        var address = that.data.address;//交易地点
        var longitude = that.data.longitude; //经度
        var latitude = that.data.latitude;//纬度
        var location = new Bmob.GeoPoint({ latitude: latitude, longitude: longitude });
        var price = e.detail.value.price;//物品价格
        var content = e.detail.value.content;//物品内容
        //发布人联系方式
        var wxNumber = e.detail.value.wxNumber;//微信号
        var phoneNumber = e.detail.value.phoneNumber;//手机号
        var eMail = e.detail.value.eMail;//邮箱
        var picUrlArray = urlArr; //图片url
        //关联发布人
        var User = Bmob.Object.extend("_User");
        var publisher = Bmob.Object.createWithoutData("_User", Bmob.User.current().id);
    
        //上传表单数据到数据库
        var Offer = Bmob.Object.extend("Offer");
        var offer = new Offer();
        offer.set("title", title);
        offer.set("typeName", typeName);
        offer.set("address", address);
        offer.set("location", location);
        offer.set("price", parseFloat(price));
        offer.set("content", content);
        offer.set("wxNumber", wxNumber);
        offer.set("publisher", publisher);
        if (phoneNumber != "") {
          offer.set("phoneNumber", parseInt(phoneNumber));
        }
        offer.set("eMail", eMail);
        offer.set("picUrlArray", picUrlArray);
        console.log("进入了")
        //添加数据，第一个入口参数是null
        offer.save(null, {
          success: function (result) {
            //添加成功，返回成功之后的objectId(注意，返回的属性名字是id,而不是objectId)
            console.log("发布成功, objectId:" + result.id);
            wx.hideLoading();
            common.dataLoading("发起成功", "success", function () {
              //重置表单 TODO
              that.setData({
                //表单验证相关 TODO
                showTopTips: false,
                TopTips: '',
                //物品类别
                types: ["电子产品", "学习资料", "家具", "其他"],
                typeIndex: "0",
                //交易地点
                address: '点击选择位置',
                longitude: 0, //经度
                latitude: 0,//纬度
                //物品价格 TODO
                // price: 0,
                //物品内容
                content: "",
                noteNowLen: 0,//备注当前字数
                noteMaxLen: 200,//备注最多字数
                //物品图片
                isSrc: false,
                is9: false,
                tempFilePaths: [],
                //阅读并同意填写联系方式
                isAgree: false,
                showInput: false,//显示输入真实姓名,
                //发布须知
                notice_status: false,
                //发布按钮启用
                isdisabled: false

              })
            });
          },
          error: function (result, error) {
            // 添加失败
            console.log(error);
            wx.hideLoading();
            common.dataLoading("发起失败", "loading");
            that.setData({
              //发布按钮启用
              isdisabled: false
            })
          }
        });
        // success
      }, function (error) {
        // failure
        console.log(error);
        wx.hideLoading();
        common.dataLoading("发起失败", "loading");
        that.setData({
          //发布按钮启用
          isdisabled: false
        })
      });
    }
  },

  /**
   * 改变物品类别
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
    console.log("这里可能有bug");
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
          console.log("这里可能有bug");
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
      count: 9 - that.data.tempFilePaths.length, // 默认9
      sizeType: ['compressed'], //压缩图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = that.data.tempFilePaths;
        var resTempFilePaths = res.tempFilePaths;
        for (let i = 0; i < resTempFilePaths.length; i++) {
          tempFilePaths.push(resTempFilePaths[i]);
        }
        that.setData({
          isSrc: true,
          tempFilePaths: tempFilePaths
        })
        //超过9张图片取消添加按钮
        if (tempFilePaths.length >= 9) {
          that.setData({
            is9: true,
          })
        }
      }
    })
  },
  //删除图片 TODO
  clearPic: function (event) {//删除图片
    var that = this;
    var postId = event.currentTarget.dataset.clearid;
    var tFilePaths = that.data.tempFilePaths;
    tFilePaths.splice(postId, 1);
    

    that.setData({
      is9: false,
      tempFilePaths: tFilePaths
    })
  },

  /**
   * 阅读并同意
   * by xinchao
   */
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
      'notice_status': true,
      textarea_show: false
    });
  },
  hideNotice: function (e) {
    this.setData({
      'notice_status': false,
      textarea_show: true
    });
  },

  /**
   * 表单验证
   * by xinchao
   */
  showTopTips: function (e) {
    var that = this;
    var title = e.detail.value.title;//发布标题
    var address = that.data.address;//交易地点
    var price = e.detail.value.price;//物品价格
    var content = e.detail.value.content;//物品内容
    //发布人联系方式
    var wxNumber = e.detail.value.wxNumber;//微信号
    var phoneNumber = e.detail.value.phoneNumber;//手机号
    var eMail = e.detail.value.eMail;//邮箱
    var flag = true;

    if (title == "") {
      flag = false;
      this.setData({
        showTopTips: true,
        TopTips: '请输入标题'
      });
    }
    else if (address == '点击选择位置') {
      flag = false;
      this.setData({
        showTopTips: true,
        TopTips: '请选择交易地点'
      });
    }
    else if (price == "") {
      flag = false;
      this.setData({
        showTopTips: true,
        TopTips: '请输入价格'
      });
    }
    else if (content == "") {
      flag = false;
      this.setData({
        showTopTips: true,
        TopTips: '请输入物品详情介绍'
      });
    }
    else if ((wxNumber == "") && (eMail == "") && (phoneNumber == "")) {
      flag = false;
      this.setData({
        showTopTips: true,
        TopTips: '请至少输入一个联系方式'
      });
    }
    setTimeout(function () {
      that.setData({
        showTopTips: false,
        isdisabled: false    //设置重启按钮
      });
    }, 700);
    return flag;
  },

  /*
  * 设置价格switch组件事件监听函数，by yining
  */ 
  switch1Change: function (e) {
    if (e.detail.value == false) {
      this.setData({
        isPriceShow: false
      })
    } else if (e.detail.value == true) {
      this.setData({
        isPriceShow: true
      })
    }
  },

  inputTap: function () {
    this.setData({
      focus: true
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   * TODO 不单单是显示，还有要上传服务器的东西
   */
  onShow: function () {
    var that = this;
    try {
      var value = wx.getStorageSync('offerForm');
      console.log(value);
      // var typeIndex = types.indexOf(value.typeName);
      if(value){
        that.setData({
          tempFilePaths : value.picUrlArray,
          title : value.title,
          // typeIndex : typeIndex,
          address : value.address,
          // location : value.location,
          content : value.content,
          // publisher : value.publisher,
          isSrc : true,
          price : value.price,
          isAgree : true,
          showInput : true,
          isPriceShow : true,
          wxNumber : value.wxNumber,
          phoneNumber : value.phoneNumber,
          eMail : value.eMail,

          isModify : true, //用于标识修改状态，发布时修改已有条目，同时修改状态切换界面删除内容
        })
        if (price = 0) {
          // TODO 价格面议的情况
          that.setData({
            isPriceShow : false,
          })
        }
      } 
      // if (isModify) {
      //   that.setData({
      //     tempFilePaths : [],
      //     title : '',
      //     // typeIndex : typeIndex,
      //     address : '点击选择位置',
      //     // location : value.location,
      //     content : '',
      //     // publisher : value.publisher,
      //     isSrc : false,
      //     price : 0,
      //     isAgree : false,
      //     showInput : false,
      //     isPriceShow : false,
      //     wxNumber : '',
      //     phoneNumber : '',
      //     eMail : '',
          
      //   })
      // } 
    } catch (e) {
      // Do something when catch error
      console.log('没找到本地缓存');
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //处理完成后删除指定条目
    wx.removeStorage({
      key: 'offerForm',
      success: function(res) {
        console.log("成功删除本地缓存")
        console.log(res.data)
      } 
    })
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