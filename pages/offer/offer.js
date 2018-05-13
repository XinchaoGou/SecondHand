var Bmob = require("../../utils/bmob.js");
var common = require('../../template/loadingBox.js');
// pages/offer/offer.js
Page({

  data: {
    //表单验证相关
    isShowTopTips: false,
    TopTips: '',
    //发布标题
    // title: '',
    isFocus: false,
    //物品类别
    types: ["所有种类", "房屋租赁", "电子产品", "学习资料", "家具", "交通工具", "乐器", "有偿帮带", "其他"],
    typeIndex: "0",
    //交易地点
    // address: '点击选择位置',
    // longitude: 0, //经度
    // latitude: 0,//纬度
    //物品价格 TODO:
    // price: 0,
    isPriceShow: false,
    isPriceFocus: false,
    //物品内容
    // content: "",
    noteNowLen: 0,//备注当前字数
    noteMaxLen: 400,//备注最多字数
    //物品图片
    isSrc: false,
    is9: false,
    // tempFilePaths: [],
    //阅读并同意填写联系方式
    isAgree: false,
    // isAgree: false,//显示输入真实姓名,
    //发布须知
    is_notice_status: false,
    //发布按钮禁用
    isdisabled: false,
    // is_textarea_show: true,

    //修改发布内容
    isModify: false,
    // isPicArrayFromCloud: false,

    //new Structure
    offerItem: {
      title: '',
      // typeName: '',
      address: '点击选择位置',
      location: null,
      price: '',
      picUrlArray: [],
      content: '',
      contact: {
        wxNumber: '',
        phoneNumber: '',
        eMail: ''
      }
    },


    //左右滑动切换模块，by yining
    currentTab: 0, //预设当前项的值
    //控制下拉刷新的提示内容的隐藏，by yining
    isHidePulldownRefresh: true,
    pastpos: 20,
    //联系方式模板的数组变量，by yining TODO:
    contactList: [{
      wxNumber: 'deutschning',
      phoneNumber: 18817870927,
      eMail: 'liuyn_tongji@163.com'
    }, {
      wxNumber: '刘一宁大傻逼',
      phoneNumber: 110,
      eMail: 'liuyn_sha@163.com'
    }],
    //类别的picker组件更换为多列选择器, by yining
    //picker组件的多列选择器
    multiArray: [['二手物品', '房屋租赁', '有偿帮带'], ['所有', '电子产品', '学习资料', '家具厨具', '交通工具', '其他'], ['']],
    multiIndex: [0, 0, 0],

    //以下是City的数组定义
    multiCityArray: [['德国所有地区', 'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen',], ['']],
    multiCityIndex: [0, 0]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // that = this;
  },

  /**
   * 重置表单数据，清空表单 FIXME:
   * by xinchao
   */
  clearData: function () {
    // var that = this;
    // that.setData({
    //   //表单验证相关 TODO:
    //   isShowTopTips: false,
    //   TopTips: '',
    //   //发布标题
    //   title: '',
    //   isFocus: false,
    //   //物品类别
    //   multiArray: [['二手物品', '房屋租赁', '有偿帮带'], ['所有', '电子产品', '学习资料', '家具厨具', '交通工具', '其他'], ['']],
    //   multiIndex: [0, 0, 0],
    //   //交易地点
    //   address: '点击选择位置',
    //   longitude: 0, //经度
    //   latitude: 0,//纬度
    //   //物品价格 TODO:
    //   // price: 0,
    //   isPriceShow: false,
    //   isPriceFocus: false,
    //   //物品内容
    //   content: "",
    //   noteNowLen: 0,//备注当前字数
    //   noteMaxLen: 400,//备注最多字数
    //   //物品图片
    //   isSrc: false,
    //   is9: false,
    //   tempFilePaths: [],
    //   //阅读并同意填写联系方式
    //   isAgree: false,
    //   isAgree: false,//显示输入真实姓名,
    //   //发布须知
    //   is_notice_status: false,
    //   //发布按钮禁用
    //   isdisabled: false,
    //   is_textarea_show: true,

    //   //修改发布内容
    //   isModify: false,
    // })
  },

  /**
   * 提交表单
   * by xinchao
   */
  submitForm: function (e) {
    var that = this;
    //TODO: 阅读发布须知 改为toast
    if (!that.data.isAgree) {
      wx.showModal({
        title: '提示',
        content: '请先阅读《发布须知》',
        success: function (res) {
          if (res.confirm) {
            that.showNotice();
            console.log('用户点击确定')

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
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

      // 上传图片到服务器获得URL
      const promise = that.upLoadPicToCloud();
      promise.then(function (urlArr) {
        //上传发布到服务器
        that.upLoadOfferToCloud(e, urlArr);
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
 * 封装发布照片到服务器
 * by xinchao
 */
  upLoadPicToCloud: function () {
    //同步封装上传照片到云端
    var that = this;
    return new Promise(function (resolve, reject) {

      //发布照片
      var urlArr = new Array();
      var tempFilePaths = that.data.offerItem.picUrlArray;
      var imgLength = tempFilePaths.length;

      //如果是修改状态，已经是服务器端图片url,不上传直接设置服务器端url地址
      if (that.data.isModify) {
        urlArr = tempFilePaths;
        resolve(urlArr);
        return;
      }

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
      }
      else {
        //没传图片的时候
        resolve(urlArr);
      }
    });
  },

  /**
  * 封装添加发布到数据库
  * by xinchao
  */
  upLoadOfferToCloud: function (e, urlArr) {
    var that = this;
    // console.log("进入了c")

    //发布内容相关
    var title = e.detail.value.title;//发布标题

    //FIXME:物品类别
    var typeIndex = that.data.typeIndex;
    var types = that.data.types;
    var typeName = types[typeIndex];

    var address = that.data.address;//交易地点
    // var longitude = that.data.longitude; //经度
    // var latitude = that.data.latitude;//纬度
    // var location = new Bmob.GeoPoint({ latitude: latitude, longitude: longitude });
    var location = that.data.offerItem.location;

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

    //TODO: test 使用新的结构体


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
    // console.log("进入了")
    //添加数据，第一个入口参数是null
    offer.save(null, {
      success: function (result) {
        //添加成功，返回成功之后的objectId(注意，返回的属性名字是id,而不是objectId)
        console.log("发布成功, objectId:" + result.id);
        wx.hideLoading();
        common.dataLoading("发起成功", "success", function () {
          //重置表单 TODO:
          that.clearData();
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
  },



  /**
   * 改变物品类别
   * TODO: 好想已经弃用了
   * by xinchao
   */
  bindTypeChange: function (e) {
    console.log('没有弃用！！！');
    // var that = this;
    // that.setData({
    //   typeIndex: e.detail.value
    // })
  },

  /**
   * 选择交易地点
   * by xinchao
   */
  addressChange: function (e) {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        //电脑调试的时候，经纬度为空，手机上可以运行
        var str = 'offerItem.address';
        var str_location = 'offerItem.location';
        var location = new Bmob.GeoPoint({
          latitude: res.latitude,
          longitude: res.longitude
        });
        that.setData({
          [str]: res.name,
          [str_location]: location
        })
        //FIXME:
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
      content: value,
      noteNowLen: len
    })
  },

  /**
   * 上传活动图片
   * 物品图片
   * by xinchao
   */
  uploadPic: function () {//选择图标
    var that = this;
    wx.chooseImage({
      count: 9 - that.data.offerItem.picUrlArray.length, // 默认9
      sizeType: ['compressed'], //压缩图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = that.data.offerItem.picUrlArray;
        var resTempFilePaths = res.tempFilePaths;
        for (let i = 0; i < resTempFilePaths.length; i++) {
          tempFilePaths.push(resTempFilePaths[i]);
        }
        var str = 'offerItem.picUrlArray';
        that.setData({
          isSrc: true,
          [str]: tempFilePaths
        })
        //9张图片取消添加按钮
        if (tempFilePaths.length >= 9) {
          that.setData({
            is9: true,
          })
        }
      }
    })
  },
  //删除图片 根据重构的代码修改
  clearPic: function (event) {//删除图片
    var that = this;
    var postId = event.currentTarget.dataset.clearid;
    var tFilePaths = that.data.offerItem.picUrlArray;
    tFilePaths.splice(postId, 1);
    var str = 'offerItem.picUrlArray';
    that.setData({
      is9: false,
      [str]: tFilePaths
    })
  },

  /**
   * TODO: 阅读并同意，同时推出联系方式输入界面
   * by xinchao
   */
  bindAgreeChange: function (e) {
    var that = this;
    that.setData({
      isAgree: !that.data.isAgree,
      // isAgree: !that.data.isAgree,
      currentTab: 0  //每次点开输入界面时，都显示第一个模板，by yining
    });
  },

  /**
   * 发布须知
   * by xinchao
   */
  // tapNotice: function (e) {
  //   var that = this;
  //   if (e.target.id == 'notice') {
  //     this.hideNotice();
  //   }
  // },
  showNotice: function (e) {
    var that = this;
    that.setData({
      is_notice_status: true,
      // is_textarea_show: false, //取消显示textarea，防止bug
    });
  },
  hideNotice: function (e) {
    var that = this;
    that.setData({
      is_notice_status: false,
      isAgree: true
      // is_textarea_show: true
    });
  },

  /**
   * 表单验证 TODO: 根据重构后的代码修改
   * by xinchao
   */
  showTopTips: function (e) {
    var that = this;
    var title = e.detail.value.title;//发布标题

    //test TODO:
    var address = that.data.offerItem.address;//交易地点
    var location = that.data.offerItem.location;
    var picUrlArray = that.data.offerItem.picUrlArray;


    var price = e.detail.value.price;//物品价格
    var content = e.detail.value.content;//物品内容
    // //发布人联系方式
    var wxNumber = e.detail.value.wxNumber;//微信号
    var phoneNumber = e.detail.value.phoneNumber;//手机号
    var eMail = e.detail.value.eMail;//邮箱

    var tOfferItem = {
      title: title,
      // typeName: '',
      address: address,
      location: location,
      price: price,
      picUrlArray: picUrlArray,
      content: content,
      contact: {
        wxNumber: wxNumber,
        phoneNumber: phoneNumber,
        eMail: eMail
      }
    }

    //使用新结构体存储表单数据
    that.setData({
      offerItem: tOfferItem
    })



    var flag = true;

    if (title == "") {
      flag = false;
      this.setData({
        isShowTopTips: true,
        TopTips: '请输入标题'
      });
    }
    else if (address == '点击选择位置') {
      flag = false;
      this.setData({
        isShowTopTips: true,
        TopTips: '请选择交易地点'
      });
    }
    else if (price == 0) {
      flag = false;
      this.setData({
        isShowTopTips: true,
        TopTips: '请输入价格'
      });
    }
    else if (content == "") {
      flag = false;
      this.setData({
        isShowTopTips: true,
        TopTips: '请输入物品详情介绍'
      });
    }
    else if ((wxNumber == "") && (eMail == "") && (phoneNumber == 0)) {
      flag = false;
      this.setData({
        isShowTopTips: true,
        TopTips: '请至少输入一个联系方式'
      });
    }
    setTimeout(function () {
      that.setData({
        isShowTopTips: false,
        isdisabled: false    //设置重启按钮
      });
    }, 700);
    return flag;
  },

  /*
  * 设置价格switch组件事件监听函数，by yining
  */
  switch1Change: function (e) {
    var that = this;
    if (e.detail.value == false) {
      that.setData({
        isPriceShow: false
      })
    } else if (e.detail.value == true) {
      that.setData({
        isPriceShow: true
      })
    }
  },

  //TODO: 这个isFocus是干什么用的？
  inputTap: function () {
    var that = this;
    that.setData({
      isFocus: !this.data.isFocus
    })
  },

  //TODO: 好像没有调用，是不可以删除
  inputPriceTap: function () {
    var that = this;
    that.setData({
      isPriceFocus: !this.data.isPriceFocus
    })
    console.log("this.data.isPriceFocus");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   * TODO: 不单单是显示，还有要上传服务器的东西,可以把所有数据都刷新
   */
  onShow: function () {
    // var that = this;
    // try {
    //   var value = wx.getStorageSync('offerForm');
    //   // console.log(value);
    //   // var typeIndex = types.indexOf(value.typeName);
    //   if (value) {
    //     that.setData({
    //       tempFilePaths: value.urls,
    //       title: value.title,
    //       // typeIndex : typeIndex,
    //       address: value.address,
    //       // location : value.location,
    //       latitude: value.location.latitude,
    //       longitude: value.location.longitude,
    //       content: value.content,
    //       // publisher : value.publisher,
    //       isSrc: true,
    //       price: value.price,
    //       isAgree: true,
    //       isAgree: true,
    //       isPriceShow: true,
    //       wxNumber: value.wxNumber,
    //       phoneNumber: value.phoneNumber,
    //       eMail: value.eMail,

    //       isModify: true, //用于标识修改状态，发布时修改已有条目，同时修改状态切换界面删除内容
    //       isPicArrayFromCloud: true,
    //     })
    //     if (price = 0) {
    //       // TODO: 价格面议的情况
    //       that.setData({
    //         isPriceShow: false,
    //       })
    //     }
    //   }
    // } catch (e) {
    //   // Do something when catch error
    //   console.log('没找到本地缓存');
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //处理完成后删除指定条目
    wx.removeStorage({
      key: 'offerForm',
      success: function (res) {
        console.log("成功删除本地缓存")
      }
    })
  },

  // 滚动切换联系方式标签样式，by yining
  switchTab: function (e) {

    var index = e.detail.current;//当前所在页面的 index
    this.setData({
      currentTab: e.detail.current,
    });
    //console.log(this.data.currentTab);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   * TODO: 更新数据
   */
  onPullDownRefresh: function () {
    this.setData({
      isHidePulldownRefresh: true
    })
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

  onPageScroll: function () {
    // Do something when page scroll
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('#top').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      res[0].top       // #the-id节点的上边界坐标
      res[1].scrollTop // 显示区域的竖直滚动位置
      // console.log(res[1].scrollTop, that.data.pastpos)
      if (res[1].scrollTop < that.data.pastpos && res[1].scrollTop < 20 && res[1].scrollTop >= 0) {
        that.setData({
          isHidePulldownRefresh: false
        })
        setTimeout(function () {
          that.setData({
            isHidePulldownRefresh: true   //设置重启按钮
          });
        }, 700);
      }
      that.setData({
        pastpos: res[1].scrollTop
      })
    })
  },
  //以下代码来自开发者文档，加注释， by yining
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      //如果修改的列为第一列
      case 0:
        //判断第一列选取的是哪一大类
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = ['所有', '电子产品', '学习资料', '家具厨具', '交通工具', '其他'];
            data.multiArray[2] = [];
            break;
          case 1:
            data.multiArray[1] = ['仅限zwischen', '可nach'];
            data.multiArray[2] = ['WG', 'Haus'];
            break;
          case 2:
            data.multiArray[1] = [];
            data.multiArray[2] = [];
            break;
        }
        data.multiIndex[1] = 0;
        data.multiIndex[2] = 0;
        break;
      //如果修改的列为第二列
      case 1:
        switch (data.multiIndex[0]) {
          //此时如果第一列为第一个大类
          case 0:
            //判断第二列选择的是哪一小类
            switch (data.multiIndex[1]) {
              case 0:
                data.multiArray[2] = [];
                break;
              case 1:
                data.multiArray[2] = ['所有', '手机', '电脑', '其他'];
                break;
              case 2:
                data.multiArray[2] = ['所有', '教材', '笔记', '其他'];
                break;
              case 3:
                data.multiArray[2] = ['所有', '台灯', '床垫', '电饭锅', '电磁炉', '其他'];
                break;
              case 4:
                data.multiArray[2] = ['所有', '自行车', '汽车', '其他'];
                break;
              case 5:
                data.multiArray[2] = [''];
                break;
            }
            break;
          //此时如果第一列为第二个大类
          case 1:
            //判断第二列选择的是哪一小类
            switch (data.multiIndex[1]) {
              case 0:
                data.multiArray[2] = ['WG', 'Haus'];
                break;
              case 1:
                data.multiArray[2] = ['WG', 'Haus'];
                break;
            }
            break;
        }
        data.multiIndex[2] = 0;
        console.log(data.multiIndex);
        break;
    }
    this.setData(data);
  },
  //picker多列选择器，选择所在城市
  bindMultiPickerChange1: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiCityIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange1: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiCityArray: this.data.multiCityArray,
      multiCityIndex: this.data.multiCityIndex
    };
    data.multiCityIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      //如果修改的列为第一列
      case 0:
        switch (data.multiCityIndex[0]) {
          //判断第一列选择的是哪一类
          case 0:
            data.multiCityArray[1] = [];
            break;
          case 1:
            data.multiCityArray[1] = ['所有地区', 'Stuttgart', 'Karlsruhe', 'Mannheim', 'Freiburg', 'Heidelberg', 'Tübingen', '其他城市'];
            break;
          case 2:
            data.multiCityArray[1] = ['所有地区', 'München', 'Nürnberg', 'Algusburg', 'Regensburg', 'Ingolstadt', 'Würzburg', 'Fürth', 'Erlangen', '其他城市'];
            break;
          case 3:
            data.multiCityArray[1] = [''];
            break;
          case 4:
            data.multiCityArray[1] = ['所有地区', 'Potsdam', '其他城市'];
            break;
          case 5:
            data.multiCityArray[1] = [''];
            break;
          case 6:
            data.multiCityArray[1] = [''];
            break;
          case 7:
            data.multiCityArray[1] = ['所有地区', 'Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach', '其他城市'];
            break;
          case 8:
            data.multiCityArray[1] = ['所有地区', 'Rostock', 'Schwerin', '其他城市'];
            break;
          case 9:
            data.multiCityArray[1] = ['所有地区', 'Hannover', 'Braunschweig', 'Wolfsburg', 'Osnabrück', 'Oldenburg', 'Göttingen', '其他城市'];
            break;
          case 10:
            data.multiCityArray[1] = ['所有地区', 'Köln', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Aachen', '其他城市'];
            break;
          case 11:
            data.multiCityArray[1] = ['所有地区', 'Mainz', 'Ludwigshafen', 'Trier', 'Kaiserslautern', 'Worms', '其他城市'];
            break;
          case 12:
            data.multiCityArray[1] = ['所有地区', 'Saarbrücken', 'Neunkirchen', '其他城市'];
            break;
          case 13:
            data.multiCityArray[1] = ['所有地区', 'Dresden', 'Leipzig', 'Chemnitz', '其他城市'];
            break;
          case 14:
            data.multiCityArray[1] = ['所有地区', 'Halle', 'Magdeburg', '其他城市'];
            break;
          case 15:
            data.multiCityArray[1] = ['所有地区', 'Kiel', 'Lübeck', '其他城市'];
            break;
          case 16:
            data.multiCityArray[1] = ['所有地区', 'Erfurt', 'Jena', 'Gera', 'Weimar', '其他城市'];
            break;
        }
        data.multiCityIndex[1] = 0;
        // console.log(data.multiCityIndex);
        break;
    }
    this.setData(data);
  },

  toDetailPage: function (e) {
    console.log('进入了此函数')
    wx.navigateTo({
      url: '../detail/detail'
    })

  }
})