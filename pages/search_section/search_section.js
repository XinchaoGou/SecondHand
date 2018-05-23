// pages/search_section/search_section.js
var Bmob = require("../../utils/bmob.js");
var Utils = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //条目信息
    sectionItem: {
      id: '',
      title: '',
      price: 0,
      content: '',

      type0: '',
      type1: '',
      type2: '',
      province: '',
      city: '',

      address: '',
      location: null,
      picUrlArray: [],
      publisher: '',
      contact: {},
      //用于缩略图条目显示
      src: '',
      date: '',
      //图标渲染
      favouriteshow: false,
    },
    //图片数目
    picNumber: 0,

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

    that.setData({
      objectId: objectId,
    })

    //调用api获取屏幕的宽高
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenWidth: res.windowWidth
        });
      }
    });

    that.loadLocalData(objectId);
  },

  /**
   * 加载本地缓存
   */
  loadLocalData: function (objectId) {
    console.log('加载本地sectionItem');
    var that = this;
    try {
      var favorList = wx.getStorageSync('favorList');
      //加载收藏列表
      if (favorList) {
        that.setData({
          favorList: favorList
        })
      }

      //加载全部内容列表
      var contentItems = wx.getStorageSync('contentList');
      if (contentItems) {
        that.setData({
          contentItems: contentItems
        })
      }

      //加载全部内容列表
      var sectionItem = wx.getStorageSync('sectionItem');
      if (sectionItem) {
        console.log('加载本地sectionItem');
        that.setSectionData(sectionItem);
      } else {
        //查询数据
        that.searchItem(objectId);
        console.log('根据offerId查询条目');
      }
    } catch (error) {
      console.log('section加载本地缓存出错', error);
    }

  },

  /**
   * 根据offerId搜索条目
   * by xinchao
   */
  searchItem: function (objectId) {

    var that = this;
    //查询数据
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    query.get(objectId, {
      success: function (result) {
        var sectionItem = that.cloudDataToLocal(result);
        that.setSectionData(sectionItem);
      },
      error: function (result, error) {
        console.log("查询失败");
      }
    });
  },

  /**
   * 根据条目信息设置
   * by xinchao 
   */
  setSectionData: function (sectionItem) {
    var that = this;
    //地图数据
    var location = sectionItem.location;
    var latitude = location.latitude;
    var longitude = location.longitude;
    var StrLatitude = 'markers[0].latitude';
    var StrLongitude = 'markers[0].longitude';
    var StrName = 'markers[0].name';
    sectionItem.favouriteshow = false;
    if (that.data.favorList.findIndex((favorItem) => {
      return favorItem.id == sectionItem.id;
    }) > -1) {
      sectionItem.favouriteshow = true;
    }
    that.setData({
      //条目信息
      sectionItem: sectionItem,
      picNumber: sectionItem.picUrlArray.length,
      //地图相关
      latitude: latitude,
      longitude: longitude,
      [StrLatitude]: latitude,
      [StrLongitude]: longitude,
      [StrName]: sectionItem.title,
    });
    //本地缓存也要处理
    wx.setStorage({
      key: "sectionItem",
      data: sectionItem
    })
  },
  //该函数待处理
  imageLoad: function (e) {
    var that = this;
    console.log(that.data.isLoadingHidden)
    console.log('图片加载')
    that.setData({
      isLoadingHidden: true
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
    var that = this;
    that.loadLocalData(that.data.objectId);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.removeStorage({
      key: 'sectionItem',
      success: function (res) {
        console.log("成功删除本地缓存")
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
    var that = this;
    var objectId = that.data.objectId;
    //查询数据
    that.searchItem(objectId);
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
    var title = that.data.sectionItem.title;
    var offerId = that.data.sectionItem.id;

    return {
      title: title,
      path: 'pages/search/search?id=' + offerId,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  /**
   * 打电话
   * 修改后续如果没有电话，直接禁用
   * by xinchao
   */
  phone_contact: function () {
    var that = this;
    var phoneNumber = that.data.sectionItem.contact.phoneNumber;
    if (phoneNumber == 0) {
      wx.showToast({
        title: '电话号码为空',
        icon: 'none',
        duration: 1000
      })
    } else {
      phoneNumber = phoneNumber.toString();

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
   * 微信联系对方
   * by xinchao
   */
  wx_contact: function () {
    var that = this;
    var wxNumber = that.data.sectionItem.contact.wxNumber;
    if (!wxNumber) {
      console.log('该用户没有留微信号')
      wx.showToast({
        title: '该用户没有留下微信号',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.setClipboardData({
        data: wxNumber,
        success: function (res) {
          wx.showToast({
            title: '复制微信号到剪贴板成功！\n' + wxNumber,
            icon: 'none',
            duration: 2000
          })
        },
      })
    }
  },

  /**
   * 邮箱联系对方
   * by xinchao
   */
  mail_contact: function () {
    var that = this;
    var eMail = that.data.sectionItem.contact.eMail;
    if (!eMail) {
      console.log('该用户没有留邮箱')
      wx.showToast({
        title: '该用户没有留下邮箱',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.setClipboardData({
        data: eMail,
        success: function (res) {
          wx.showToast({
            title: '复制邮箱到剪贴板成功！\n' + eMail,
            icon: 'none',
            duration: 2000
          })
        },
      })
    }
  },

  /**
   * 点击收藏图标绑定事件，修改图标，修改数据库
   * by xinchao
   */
  favourite_touch: function (event) {
    var that = this;
    var favorList = that.data.favorList
    //修改收藏图片显示
    var isshow = that.data.sectionItem.favouriteshow;
    var str = 'sectionItem.favouriteshow';
    that.setData({
      [str]: !isshow
    })

    //本地缓存也要更改！
    var mContentList = null;
    try {
      mContentList = wx.getStorageSync('contentList')
      if (mContentList) {
        favorList.forEach(function (favorItem) {
          var postId = mContentList.findIndex((Item) => {
            return Item.id == favorItem.id;
          })
          if (postId > -1) {
            mContentList[postId].favouriteshow = !isshow;
          }
        });
      }
    } catch (e) {
      // Do something when catch error
    }
    wx.setStorage({
      key: "contentList",
      data: mContentList
    })

    //获取实例
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    var offerId = that.data.sectionItem.id;
    query.get(offerId, {
      success: function (result) {
        //将对应ObjectId 的 Offer关联到收藏
        var user = Bmob.User.current();
        var relation = user.relation("like");
        //实现数据库端like的同步
        if (!isshow) {
          //点击之前为false，点击之后为true，表示收藏
          relation.add(result);
          favorList.push(that.data.sectionItem);
        } else {
          //取消收藏
          relation.remove(result);
          var index = favorList.findIndex((favorItem) => {
            return favorItem.id == offerId;
          });
          favorList.splice(index, 1);
        }
        user.save();
        that.setData({
          favorList: favorList
        });
        wx.setStorage({
          key: "favorList",
          data: favorList
        })
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
    var title = that.data.sectionItem.title;
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
    var urls = that.data.sectionItem.picUrlArray;
    //图片预览
    wx.previewImage({
      current: urls[index], // 当前显示图片的链接，不填则默认为 urls 的第一张
      urls: urls,

      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },

  /**
* 从云端查询到的条目转化为本地缓存数据
* object
* by xinchao
*/
  cloudDataToLocal: function (object) {
    var that = this;
    //获得发布条目内容详情
    var id = object.id;
    var title = object.get('title');
    var price = object.get('price');
    var content = object.get('content');

    //类别
    var type0 = object.get('type0');
    var type1 = object.get('type1');
    var type2 = object.get('type2');
    //城市
    var province = object.get('province');
    var city = object.get('city');

    var address = object.get('address');
    var location = object.get('location');
    var picUrlArray = object.get('picUrlArray');
    if (picUrlArray == "") {
      //没有图片则设置为默认图片 url数组注意
      picUrlArray = ['../../images/test/camera.png'];
    }
    var publisher = object.get('publisher');
    var contact = object.get('contact');

    var mDate = Utils.getDateDiffWithJetLag(object.createdAt);

    var localItem = {
      //发布条目相关
      id: id,
      title: title,
      price: price,
      content: content,

      type0: type0,
      type1: type1,
      type2: type2,
      province: province,
      city: city,

      address: address,
      location: location,
      picUrlArray: picUrlArray,
      publisher: publisher,
      contact: contact,
      //用于缩略图条目显示
      src: picUrlArray[0],
      date: mDate,
    }

    return localItem;
  },

  address_clip: function (e) {
    var that = this;
    var address = that.data.sectionItem.address;
    wx.setClipboardData({
      data: address,
      success: function (res) {
        wx.showToast({
          title: '复制地址到剪贴板成功！\n' + address,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

})