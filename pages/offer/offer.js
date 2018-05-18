var Bmob = require("../../utils/bmob.js");
var common = require('../../template/loadingBox.js');
// pages/offer/offer.js
Page({

  data: {
    //表单验证相关
    isShowTopTips: false,
    TopTips: '',
    //标题
    isFocus: false,
    //价格
    isPriceShow: false,
    isPriceFocus: false,
    //用户输入了物品详情
    isContent: false,
    //物品图片
    isSrc: false,
    is9: false,
    //阅读并同意填写联系方式
    isAgree: false,
    //发布须知
    is_notice_status: false,
    //发布按钮禁用
    isdisabled: false,
    //修改发布内容
    isModify: false,

    //联系方式模板的数组变量，by xinchao
    contactList: [],
    //new Structure
    offerItem: {
      title: '',
      address: '点击选择位置',
      location: null,
      price: '',
      picUrlArray: [],
      content: '',
      publisher: '',
      contact: {
        wxNumber: '',
        phoneNumber: '',
        eMail: ''
      },
      //type
      type0: '',
      type1: '',
      type2: '',
      //city
      province: '',
      city: '',
    },

    //模版数目
    maxContactNumber: 3, //by xincaho
    //左右滑动切换模块，by yining
    currentTab: 0, //预设当前项的值
    //控制下拉刷新的提示内容的隐藏，by yining
    isHidePulldownRefresh: true,
    pastpos: 20,
    y_scroll: true,//控制页面是否可以竖向滚动的变量，by yining
    toView: '',//控制scroll into view函数滑动到对应组件的id, by yining
    //类别的picker组件更换为多列选择器, by yining
    //picker组件的多列选择器
    typeArray: [['二手物品', '房屋租赁', '有偿帮带'], ['所有', '电子产品', '学习资料', '家具厨具', '交通工具', '其他'], ['']],
    typeIndex: [0, 0, 0],

    //以下是City的数组定义
    cityArray: [['德国所有地区', 'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen',], ['']],
    cityIndex: [0, 0]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
  },

  //获得用户的联系方式模版
  getContactList: function () {
    var that = this;
    //查询用户收藏列表
    var User = Bmob.Object.extend("_User");
    var query = new Bmob.Query(User);
    query.get(Bmob.User.current().id, {
      success: function (result) {
        // 查询成功
        console.log("查询当前用户成功");
        var mContact = result.get('contactList');
        //设置当前data
        that.setData({
          contactList: mContact,
        });
        //设置本地缓存
        wx.setStorage({
          key: "contactList",
          data: mContact
        })

      },
      error: function (object, error) {
        // 查询失败
        console.log("查询当前用户失败");
      }
    });
  },

  /**
   * 重置表单数据，清空表单
   * by xinchao
   */
  clearData: function () {
    var that = this;
    that.setData({
      isShowTopTips: false,
      isPriceShow: false,
      isContent: false,//添加的
      isSrc: false,
      is9: false,
      isAgree: false,
      is_notice_status: false,
      isdisabled: false,
      isModify: false,
      //左右滑动切换模块，by yining
      currentTab: 0, //预设当前项的值
      //控制下拉刷新的提示内容的隐藏，by yining
      isHidePulldownRefresh: true,
      //new Structure
      offerItem: {
        title: '',
        address: '点击选择位置',
        location: null,
        price: '',
        picUrlArray: [],
        content: '',
        publisher: '',
        contact: {
          wxNumber: '',
          phoneNumber: '',
          eMail: ''
        },
        //type
        type0: '',
        type1: '',
        type2: '',
        //city
        province: '',
        city: '',
      },
    })
  },

  /**
   * 提交表单
   * by xinchao
   */
  submitForm: function (e) {
    var that = this;
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
        //上传发布到服务器, 里面完成后会启用按钮
        that.upLoadOfferToCloud(urlArr);
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

      if (imgLength > 0) {
        //日期作为图片名的一部分
        var newDate = new Date();
        var newDateStr = newDate.toLocaleDateString();

        var j = 0;
        for (var i = 0; i < imgLength; i++) {

          //如果是修改状态，图片已经是服务器的，所以直接添加，improtant！
          if (that.data.isModify) {
            var tUrl = tempFilePaths[i];

            if (that.data.modifiedUrl.indexOf(tUrl) > -1) {
              //如果修改状态且图片url是上传过的服务器端的url，直接添加，不再上传
              urlArr.push(tUrl);
              j++; //非常重要，判断是否上传完了所有图片
              if (imgLength == j) {
                console.log("成功上传图片");
                resolve(urlArr);
              }
              continue; //结束本次循环
            }
          }

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
  upLoadOfferToCloud: function (urlArr) {
    var that = this;
    var tOfferItem = that.data.offerItem;

    //TODO:如果是修改模式，则修改对应的数据
    if (isModify) {
      that.updateOffer();
      return;
    }

    //上传表单数据到数据库
    var Offer = Bmob.Object.extend("Offer");
    var offer = new Offer();
    offer.set("title", tOfferItem.title);
    offer.set("address", tOfferItem.address);
    var location = new Bmob.GeoPoint({ latitude: tOfferItem.location.latitude, longitude: tOfferItem.location.longitude });
    offer.set("location", location);
    if (that.data.isPriceShow) { //价格设置才会上传，否则比如没设置价格，后台传了值，不能上传，价格为空也不上传
      offer.set("price", parseFloat(tOfferItem.price));
    }
    offer.set("content", tOfferItem.content);
    offer.set("publisher", tOfferItem.publisher);
    offer.set("picUrlArray", urlArr);
    offer.set("contact", tOfferItem.contact);
    //类别
    offer.set("type0", tOfferItem.type0);
    offer.set("type1", tOfferItem.type1);
    offer.set("type2", tOfferItem.type2);
    //城市
    offer.set("province", tOfferItem.province);
    offer.set("city", tOfferItem.city);

    //添加数据，第一个入口参数是null
    offer.save(null, {
      success: function (result) {
        //添加成功，返回成功之后的objectId(注意，返回的属性名字是id,而不是objectId)
        console.log("发布成功, objectId:" + result.id);
        wx.hideLoading();
        common.dataLoading("发起成功", "success", function () {
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
   * 修改数据库表单数据
   * by xinchao
   */
  updateOffer: function () {
    var that = this;
    var tOfferItem = that.data.offerItem;

    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);

    query.get(offerItem.id, {
      success: function (offer) {
        //上传表单数据到数据库
        offer.set("title", tOfferItem.title);
        offer.set("address", tOfferItem.address);
        var location = new Bmob.GeoPoint({ latitude: tOfferItem.location.latitude, longitude: tOfferItem.location.longitude });
        offer.set("location", location);
        if (that.data.isPriceShow) { //价格设置才会上传，否则比如没设置价格，后台传了值，不能上传，价格为空也不上传
          offer.set("price", parseFloat(tOfferItem.price));
        }
        offer.set("content", tOfferItem.content);
        offer.set("publisher", tOfferItem.publisher);
        offer.set("picUrlArray", urlArr);
        offer.set("contact", tOfferItem.contact);
        //类别
        offer.set("type0", tOfferItem.type0);
        offer.set("type1", tOfferItem.type1);
        offer.set("type2", tOfferItem.type2);
        //城市
        offer.set("province", tOfferItem.province);
        offer.set("city", tOfferItem.city);
        offer.save();
      },
      error: function (object, error) {
        console.log(error);
      }
    });
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
        var latitude = res.latitude;
        var longitude = res.longitude;
        var location = {
          latitude: latitude,
          longitude: longitude
        };
        that.setData({
          [str]: res.name,
          [str_location]: location
        })
      },
      fail: function (e) {
      },
      complete: function (e) {
      }
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
   * 阅读并同意，同时推出联系方式输入界面
   * by xinchao
   */
  bindAgreeChange: function (e) {
    var that = this;
    that.setData({
      isAgree: !that.data.isAgree,
      currentTab: 0  //每次点开输入界面时，都显示第一个模板，by yining
    });
  },

  /**
   * 发布须知
   * by xinchao
   */
  showNotice: function (e) {
    var that = this;
    that.setData({
      is_notice_status: true,
    });
  },
  hideNotice: function (e) {
    var that = this;
    that.setData({
      is_notice_status: false,
      isAgree: true
    });
  },

  /**
   * 将要发布的信息存入结构体
   * by xinchao
   */
  formToOfferItem: function (e) {
    var that = this;
    var title = e.detail.value.title;//发布标题

    //发布类别，真丑囧。。。
    var type0 = that.data.typeArray[0][that.data.typeIndex[0]];
    var type1 = that.data.typeArray[1][that.data.typeIndex[1]];
    var type2 = that.data.typeArray[2][that.data.typeIndex[2]];
    //同城范围
    var province = that.data.cityArray[0][that.data.cityIndex[0]];
    var city = that.data.cityArray[1][that.data.cityIndex[1]];


    var address = e.detail.value.address;
    if (!address) { //address 没输入
      address = that.data.offerItem.address;
    }
    var location = that.data.offerItem.location;
    var picUrlArray = that.data.offerItem.picUrlArray;
    var content = that.data.offerItem.content;

    var price = e.detail.value.price;//物品价格

    //发布人联系方式
    var currentTab = that.data.currentTab;
    var contactList = that.data.contactList;
    var contact = that.data.offerItem.contact;
    if (currentTab < contactList.length) {
      //使用模版
      contact = contactList[currentTab];
    } else {
      contact = {
        wxNumber: e.detail.value.wxNumber,
        phoneNumber: e.detail.value.phoneNumber,
        eMail: e.detail.value.eMail
      }
    }

    //关联发布人
    var User = Bmob.Object.extend("_User");
    var publisher = Bmob.Object.createWithoutData("_User", Bmob.User.current().id);


    var tOfferItem = {
      title: title,
      address: address,
      location: location,
      price: price,
      picUrlArray: picUrlArray,
      content: content,
      contact: contact,
      publisher: publisher,
      //type
      type0: type0,
      type1: type1,
      type2: type2,
      //city
      province: province,
      city: city,
    }
    //使用新结构体存储表单数据
    that.setData({
      offerItem: tOfferItem
    })

    return tOfferItem;
  },

  /**
   * 表单验证 TODO: 根据重构后的代码修改
   * by xinchao
   */
  showTopTips: function (e) {
    var that = this;
    var tOfferItem = that.formToOfferItem(e);
    var flag = true;

    if (tOfferItem.title == "") {
      flag = false;
      this.setData({
        toView: 'title',
        isShowTopTips: true,
        TopTips: '请输入标题'
      });
    }
    else if (tOfferItem.address == '点击选择位置') {
      flag = false;
      this.setData({
        isShowTopTips: true,
        TopTips: '请选择交易地点'
      });
    }
    else if (that.data.isPriceShow && !tOfferItem.price) { //设置价格，但是没有输入值
      flag = false;
      this.setData({
        isShowTopTips: true,
        TopTips: '请输入价格'
      });
    }
    else if (tOfferItem.content == "") {
      flag = false;
      this.setData({
        isShowTopTips: true,
        TopTips: '请输入物品详情介绍'
      });
    }
    else if ((tOfferItem.contact.wxNumber == "") && (tOfferItem.contact.eMail == "") && (tOfferItem.contact.phoneNumber == "")) {
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

  //用来方便点击标题大框就聚焦
  //by yining
  inputTap: function () {
    var that = this;
    that.setData({
      isFocus: !that.data.isFocus
    })
  },

  //TODO: 好像没有调用，是不可以删除 
  //by yining
  inputPriceTap: function () {
    var that = this;
    that.setData({
      isPriceFocus: !that.data.isPriceFocus
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
   * 不单单是显示，还有要上传服务器的东西,可以把所有数据都刷新
   */
  onShow: function () {
    var that = this;
    try {
      //加载用户联系方式
      var contactList = wx.getStorageSync('contactList');
      if (contactList) {
        that.setData({
          contactList: contactList
        });
      } else {
        //从服务器获得用户联系方式
        that.getContactList();
      }

      var offerForm = wx.getStorageSync('offerForm');
      if (offerForm) {
        that.setData({
          offerItem: offerForm,
          isSrc: true,
          isContent: true,
          isAgree: true,

          isModify: true, //用于标识修改状态，发布时修改已有条目，同时修改状态切换界面删除内容
        })

        //价格相关
        var isPriceShow = true;
        if (!offerForm.price) { //如果价格面议则为空，发布条目里应该没有price的信息
          isPriceShow = false;
        }

        //类别列表
        var typeArray = that.data.typeArray;
        var type0 = typeArray[0].indexOf(offerForm.type0);
        var tData = that.findTypeIndex(0, type0);
        var type1 = tData.typeArray[1].indexOf(offerForm.type1);
        tData = that.findTypeIndex(1, type1);
        var type2 = tData.typeArray[2].indexOf(offerForm.type2);

        //城市列表
        var cityArray = that.data.cityArray;
        var pIndex = cityArray[0].indexOf(offerForm.province);
        var mData = that.findCityIndex(0, pIndex);
        var cIndex = mData.cityArray[1].indexOf(offerForm.city);

        //服务器端图片url
        var modifiedUrl = offerForm.picUrlArray;

        that.setData({
          isPriceShow: isPriceShow,

          cityIndex: [
            pIndex,
            cIndex
          ],

          typeIndex: [
            type0,
            type1,
            type2
          ],

          modifiedUrl: modifiedUrl
        });

      }
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
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   * 更新数据
   */
  onPullDownRefresh: function () {
    // var that = this;
    // that.setData({
    //   isHidePulldownRefresh: true
    // });
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

  //by yining
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
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      typeIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function (e) {
    var that = this;
    that.findTypeIndex(e.detail.column, e.detail.value)
  },

  /**
   * 根据前面列选择重建条目列表
   * by xinchao
   */
  findTypeIndex: function (column, value) {
    var that = this;
    var mData = {
      typeArray: that.data.typeArray,
      typeIndex: that.data.typeIndex
    };
    mData.typeIndex[column] = value;

    switch (column) {
      //如果修改的列为第一列
      case 0:
        //判断第一列选取的是哪一大类
        switch (mData.typeIndex[0]) {
          case 0:
            mData.typeArray[1] = ['所有', '电子产品', '学习资料', '家具厨具', '交通工具', '其他'];
            mData.typeArray[2] = [];
            break;
          case 1:
            mData.typeArray[1] = ['仅限zwischen', '可nach'];
            mData.typeArray[2] = ['WG', 'Haus'];
            break;
          case 2:
            mData.typeArray[1] = [];
            mData.typeArray[2] = [];
            break;
        }
        mData.typeIndex[1] = 0;
        mData.typeIndex[2] = 0;
        break;
      //如果修改的列为第二列
      case 1:
        switch (mData.typeIndex[0]) {
          //此时如果第一列为第一个大类
          case 0:
            //判断第二列选择的是哪一小类
            switch (mData.typeIndex[1]) {
              case 0:
                mData.typeArray[2] = [];
                break;
              case 1:
                mData.typeArray[2] = ['所有', '手机', '电脑', '其他'];
                break;
              case 2:
                mData.typeArray[2] = ['所有', '教材', '笔记', '其他'];
                break;
              case 3:
                mData.typeArray[2] = ['所有', '台灯', '床垫', '电饭锅', '电磁炉', '其他'];
                break;
              case 4:
                mData.typeArray[2] = ['所有', '自行车', '汽车', '其他'];
                break;
              case 5:
                mData.typeArray[2] = [''];
                break;
            }
            break;
          //此时如果第一列为第二个大类
          case 1:
            //判断第二列选择的是哪一小类
            switch (mData.typeIndex[1]) {
              case 0:
                mData.typeArray[2] = ['WG', 'Haus'];
                break;
              case 1:
                mData.typeArray[2] = ['WG', 'Haus'];
                break;
            }
            break;
        }
        mData.typeIndex[2] = 0;
        // console.log(mData.typeIndex);
        break;
    }
    this.setData(mData);
    return mData;
  },

  //picker多列选择器，选择所在城市
  bindMultiPickerChange1: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      cityIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange1: function (e) {
    var that = this;
    that.findCityIndex(e.detail.column, e.detail.value);
  },

  /**
   * 根据前面列重建城市列表数组
   * by xinchao
   */
  findCityIndex: function (column, value) {
    var that = this;
    var mData = {
      cityArray: that.data.cityArray,
      cityIndex: that.data.cityIndex
    };
    mData.cityIndex[column] = value;
    switch (column) {
      //如果修改的列为第一列
      case 0:
        switch (mData.cityIndex[0]) {
          //判断第一列选择的是哪一类
          case 0:
            mData.cityArray[1] = [];
            break;
          case 1:
            mData.cityArray[1] = ['所有地区', 'Stuttgart', 'Karlsruhe', 'Mannheim', 'Freiburg', 'Heidelberg', 'Tübingen', '其他城市'];
            break;
          case 2:
            mData.cityArray[1] = ['所有地区', 'München', 'Nürnberg', 'Algusburg', 'Regensburg', 'Ingolstadt', 'Würzburg', 'Fürth', 'Erlangen', '其他城市'];
            break;
          case 3:
            mData.cityArray[1] = [''];
            break;
          case 4:
            mData.cityArray[1] = ['所有地区', 'Potsdam', '其他城市'];
            break;
          case 5:
            mData.cityArray[1] = [''];
            break;
          case 6:
            mData.cityArray[1] = [''];
            break;
          case 7:
            mData.cityArray[1] = ['所有地区', 'Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach', '其他城市'];
            break;
          case 8:
            mData.cityArray[1] = ['所有地区', 'Rostock', 'Schwerin', '其他城市'];
            break;
          case 9:
            mData.cityArray[1] = ['所有地区', 'Hannover', 'Braunschweig', 'Wolfsburg', 'Osnabrück', 'Oldenburg', 'Göttingen', '其他城市'];
            break;
          case 10:
            mData.cityArray[1] = ['所有地区', 'Köln', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Aachen', '其他城市'];
            break;
          case 11:
            mData.cityArray[1] = ['所有地区', 'Mainz', 'Ludwigshafen', 'Trier', 'Kaiserslautern', 'Worms', '其他城市'];
            break;
          case 12:
            mData.cityArray[1] = ['所有地区', 'Saarbrücken', 'Neunkirchen', '其他城市'];
            break;
          case 13:
            mData.cityArray[1] = ['所有地区', 'Dresden', 'Leipzig', 'Chemnitz', '其他城市'];
            break;
          case 14:
            mData.cityArray[1] = ['所有地区', 'Halle', 'Magdeburg', '其他城市'];
            break;
          case 15:
            mData.cityArray[1] = ['所有地区', 'Kiel', 'Lübeck', '其他城市'];
            break;
          case 16:
            mData.cityArray[1] = ['所有地区', 'Erfurt', 'Jena', 'Gera', 'Weimar', '其他城市'];
            break;
        }
        mData.cityIndex[1] = 0;
        break;
    }
    that.setData(mData);
    return mData;
  },

  toDetailPage: function (e) {
    var that = this;
    var content = that.data.offerItem.content;
    wx.navigateTo({
      url: '../detail/detail?content=' + content
    })

  },
  //以下函数作用为在输入框获取焦点时，锁住页面不让其随意滑动，失去焦点时恢复正常，by yining
  getEmailFocus: function (e) {
    console.log('获取到焦点')
    var that = this;
    that.setData({
      y_scroll: false
    })
  },
  loseEmailFocus: function (e) {
    console.log('失去了焦点')
    var that = this;
    that.setData({
      y_scroll: true
    })
  },
  getWechatFocus: function (e) {
    var that = this;
    that.setData({
      y_scroll: false
    })
  },
  loseWechatFocus: function (e) {
    console.log('失去了焦点')
    var that = this;
    that.setData({
      y_scroll: true
    })
  },
  getPhoneFocus: function (e) {
    var that = this;
    that.setData({
      y_scroll: false
    })
  },
  losePhoneFocus: function (e) {
    var that = this;
    that.setData({
      y_scroll: true
    })
  },
  //常用联系方式长按事件监听，长按会触发底部消息弹窗
  contactLongTap: function (e) {
    console.log('长按')
    wx.showActionSheet({
      itemList: ['前往“我的”页面编辑此模板'],
      success: function (res) {
        wx.switchTab({
          url: '../me/me'
        })//点选此项，页面随即跳转“我的”页面
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },

  /**
   * 用户点击保存新的联系方式
   * by xinchao
   */
  formSubmit: function (e) {
    var that = this;
    that.newContactSaveTap(e.detail.value);
  },
  //保存新模版， by xinchao
  newContactSaveTap: function (newContact) {
    var that = this;
    var mContactList = that.data.contactList;
    if (mContactList.length >= that.data.maxContactNumber) {
      // 模版数为3 不能增加新的模版,最好不用显示
      wx.showToast({
        title: '模版数目最多为3条！',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    wx.showModal({
      title: '保存确认',
      content: '您确认要将此联系方式添加到常用模板吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var mContact = newContact;
          mContactList.push(mContact);
          that.upDateContact(mContactList);
        }
        else if (res.cancel) {
          console.log('用户点击取消') //结束函数不删除条目
          return;
        }
      }
    })
  },
  /**
   * 上传用户联系方式数据到本地和缓存
   * by xinchao 
   */
  upDateContact: function (mContactList) {
    var that = this;
    //查询用户收藏列表
    var User = Bmob.Object.extend("_User");
    var query = new Bmob.Query(User);
    query.get(Bmob.User.current().id, {
      success: function (result) {
        // 查询成功
        console.log("查询当前用户成功");
        if (mContactList.length <= that.data.maxContactNumber) {
          //已有模版数小于3
          //上传数据库
          result.set('contactList', mContactList);
          result.save();
          //更新data important 这里覆写了
          var str = 'offerItem.contact'
          that.setData({
            contactList: mContactList,
            [str]: {
              wxNumber: '',
              phoneNumber: '',
              eMail: ''
            }, //用于重置表单数据
          });
          //更新本地缓存
          wx.setStorage({
            key: "contactList",
            data: mContactList
          })

        }
      },
      error: function (object, error) {
        // 查询失败
        console.log("查询当前用户失败");
      }
    });
  },
  resetOfferForm: function (e) {
    //整个offer页面表单的重置事件已经发生,TODO by Xinchao
  }
})