var Bmob = require("../../utils/bmob.js");
var Utils = require("../../utils/util.js");
var app = getApp();

Page({

  data: {
    imgUrl: '../../images/test/user_default.png',
    name: '点击头像登录',
    userInfo: {},
    favorList: [],
    offerList: [],
    contactList: [{
      wxNumber: 'deutschning',
      phoneNumber: 18817870927,
      eMail: 'liuyn_tongji@163.com'
    }, {
      wxNumber: '刘一宁大傻逼',
      phoneNumber: 110,
      eMail: 'liuyn_sha@163.com'
    }],

    //new contact新保存的联系方式
    newContact: {
      wxNumber: '123',
      phoneNumber: 456,
      eMail: '789'
    },

    //页面隐藏设计添加的变量，by yining
    isShowOffer: false,
    isShowFavourite: false,
    isShowContact: false,
    currentTab: 0,//获取联系方式的swiper组件的当前页，从0开始
    isInputDisabled: true,//控制input组件禁用的变量，true时禁用
    inputTab: -1,//记录是哪一页的input组件可以使用
    isInputFinish: true,//判断编辑状态是否结束
    isShowTopTips: false,//判断是否应该弹出警告
    isFocus: false,//获取首行焦点
    //微信api更改之后
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isUse: false,
  },

  onLoad: function () {

  },

  //重构为默认从本地缓存获取
  onShow: function () {
    var that = this;
    try {
      //加载收藏列表
      var favorList = wx.getStorageSync('favorList');
      if (favorList) {
        //从本地缓存读取
        that.setData({
          favorList: favorList
        })
      } else {
        //从服务器读取
        that.searchFavouriteList();
      }

      //加载发布列表
      var offerList = wx.getStorageSync('offerList');
      if (offerList) {
        //从本地缓存
        that.setData({
          offerList: offerList
        })
      } else {
        //从服务器缓存
        that.searchOfferList();
      }

      //加载用户信息
      var userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        that.setData({
          userInfo: userInfo,
          name: userInfo.nickName,
          imgUrl: userInfo.avatarUrl,
          isUse: true,
        });
      } else {
        that.upDateUserInfo();
      }

      //加载用户联系方式
      var contactList = wx.getStorageSync('contactList');
      if (contactList) {
        that.setData({
          contactList : contactList
        });
      } else {
        //从服务器获得用户联系方式
        that.getContactList();
      }

    } catch (e) {
      console.log('本地缓存favorList，offerList，userInfo读取失败');
    }
  },

  /**
   * 更新用户名字和头像
   * by xinchao
   */
  upDateUserInfo: function () {
    console.log('更新用户名和头像');
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              var userInfo = res.userInfo;
              that.setData({
                userInfo: userInfo,
                name: userInfo.nickName,
                imgUrl: userInfo.avatarUrl,
                isUse: true,
              });
              wx.setStorage({
                key: "userInfo",
                data: userInfo
              });
            }
          })
        }
      }
    })
  },

  /**
   * 上传用户联系方式数据到本地和缓存
   * by xinchao 
   */
  newContactSaveTap: function () {
    var that = this;
    //查询用户收藏列表
    var User = Bmob.Object.extend("_User");
    var query = new Bmob.Query(User);
    query.get(Bmob.User.current().id, {
      success: function (result) {
        // 查询成功
        console.log("查询当前用户成功");
        var mContactList = that.data.contactList;
        var mContact = that.data.newContact;
        if (mContactList.length <= 2) {
          //已有模版数小于2， 总模版数小于3
          mContactList.push(mContact);
          //上传数据库
          result.set('contactList', mContactList);
          result.save();
          //更新data
          that.setData({
            contactList: mContactList,
            newContact: {
              wxNumber: '',
              phoneNumber: 0,
              eMail: ''
            }
          });
          //更新本地缓存
          wx.setStorage({
            key: "contactList",
            data: contactList
          })

        } else {
          // 模版数为3 不能增加新的模版,最好不用显示
          wx.showToast({
            title: '模版数目最多为3条！',
            icon: 'none',
            duration: 2000
          })
        }
      },
      error: function (object, error) {
        // 查询失败
        console.log("查询当前用户失败");
      }
    });
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   * 重构为默认重新从服务器加载收藏和发布列表
   * by xinchao
   */
  onPullDownRefresh: function () {
    // console.log('执行了下拉刷新');
    var that = this;
    wx.vibrateShort();  // 使手机振动15ms  
    wx.showNavigationBarLoading() //在标题栏中显示加载
    // that.onLoad();
    that.searchFavouriteList();
    that.searchOfferList();
    that.upDateUserInfo();
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },


  //分享 TODO: 默认分享首页
  onShareAppMessage: function () {
    return {
      title: '自定义分享标题',
      desc: '自定义分享描述',
      path: '/page/user?id=123'
    }
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
  /*
   * 查询用户的所有发布
   * 获得发布条目内容详情,同时缓存到本地
   * by xinchao
   */
  searchOfferList: function () {
    console.log("从云端搜索发布列表");
    var that = this;
    var userId = Bmob.User.current().id;

    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    var isme = new Bmob.User();
    isme.id = userId;     //当前用户的objectId
    query.equalTo("publisher", isme);
    query.descending('createdAt');  //排序

    query.find({
      success: function (results) {
        console.log("查询到" + results.length + "条发布");
        var offerArray = [];
        for (let i = 0; i < results.length; i++) {
          var object = results[i];
          var offerItem = that.cloudDataToLocal(object);
          offerArray.push(offerItem);
        }

        that.setData({
          offerList: offerArray
        });
        wx.setStorage({
          key: "offerList",
          data: offerArray
        });
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },

  /**
   * 查询用户收藏列表封装
   * 获得收藏列表内容详情，同时缓存到本地
   * by xinchao
   */
  searchFavouriteList: function () {
    console.log("从云端搜索收藏列表");
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
            console.log("查询到" + list.length + "条收藏");
            var favourArray = [];
            for (let i = 0; i < list.length; i++) {
              var object = list[i];
              var favorItem = that.cloudDataToLocal(object);
              favorItem.favouriteshow = true; //给结构体添加一个属性
              favourArray.push(favorItem);
            }
            that.setData({
              favorList: favourArray
            });
            wx.setStorage({
              key: "favorList",
              data: favourArray
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

    //即时更新视图，从收藏列表删除对应收藏
    var isshow = this.data.favorList[postId].favouriteshow;
    var tFavorItems = that.data.favorList;
    tFavorItems.splice(postId, 1);
    that.setData({
      favorList: tFavorItems
    })
    wx.setStorage({
      key: "favorList",
      data: tFavorItems
    });

    //获取实例
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    query.get(objectId, {
      success: function (result) {
        //将对应ObjectId 的 Offer关联到收藏
        var user = Bmob.User.current();
        var relation = user.relation("like");
        //实现数据库端like的同步
        if (!isshow) {
          //点击之前为false，点击之后为true，表示收藏
          console.log('添加收藏成功，这句话应该执行不到吧？？？');
          relation.add(result);
        } else {
          //取消收藏
          console.log('取消收藏成功');
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
    // var favor = that.data.favorList[postId].favouriteshow;
    console.log('跳转详情' + objectId);
    try {
      wx.setStorageSync('sectionItem', that.data.favorList[postId])
    } catch (e) {
    }
    //跳转条目详情
    wx.navigateTo({
      url: '../search_section/search_section?id=' + objectId
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
    console.log('跳转详情' + objectId);
    try {
      wx.setStorageSync('sectionItem', that.data.offerList[postId])
    } catch (e) {
    }
    //跳转条目详情
    wx.navigateTo({
      url: '../search_section/search_section?id=' + objectId
    })
  },

  /**
   * 点击按钮重新编辑某一个发布条目
   * 从本地缓存获取数据，跳转页面
   * by xinchao
   */
  offerSetTap: function (event) {
    console.log('重新编辑发布条目信息');
    var that = this;
    var postId = event.currentTarget.dataset.postid;
    var objectId = that.data.offerList[postId].id;  // 获得数据库对应objectId
    wx.showModal({
      title: '修改发布确认',
      content: '您确认要修改该发布吗？',
      success: function (res) {
        if (res.confirm) {
          //同步缓存到数据到本地
          var offerForm = that.data.offerList[postId];
          if ((offerForm.picUrlArray.length == 1) && (offerForm.picUrlArray[0] == '../../images/test/camera.png')) {
            offerForm.picUrlArray = [];
          }
          try {
            wx.setStorageSync('offerForm', offerForm);
            wx.switchTab({
              url: '../offer/offer'
            })
          } catch (e) {
          }
        } else if (res.cancel) {
          console.log('用户点击取消') //结束函数不修改条目
          return;
        }
      }
    })

  },

  /**
 * 点击按钮提示是否删除条目
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
          that.offerDelete(postId, objectId); //删除已发布条目
        } else if (res.cancel) {
          console.log('用户点击取消') //结束函数不删除条目
          return;
        }
      }
    })
  },

  /**
   * 删除某一个发布条目
   * by xinchao
   */
  offerDelete: function (postId, objectId) {
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

            //即时更新视图，从发布列表中删除已经发布条目 
            var tOfferItems = that.data.offerList;
            tOfferItems.splice(postId, 1);
            that.setData({
              offerList: tOfferItems
            });
            wx.setStorage({
              key: "offerList",
              data: tOfferItems
            });
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
    if (!switch1) {
      //如果原来是false，要展开收藏列表，则折叠其他列表
      that.setData({
        isShowOffer: false,
        isShowContact: false
      })
    }
    this.setData({
      isShowFavourite: !switch1

    })
  },

  tooffer: function () {
    var that = this;
    var switch2 = that.data.isShowOffer;
    if (!switch2) {
      //如果原来是false，要展开发布列表，则折叠其他列表
      that.setData({
        isShowFavourite: false,
        isShowContact: false
      })
    }
    this.setData({
      isShowOffer: !switch2
    })
  },

  tocontact: function () {
    var that = this;
    var switch3 = that.data.isShowContact;
    if (!switch3) {
      //如果原来是false，要展开联系方式列表，则折叠其他列表
      that.setData({
        isShowFavourite: false,
        isShowOffer: false,
        currentTab: 0
      })

    }
    this.setData({
      isShowContact: !switch3
    })
  },

  //微信api更改之后，登陆按钮
  bindGetUserInfo: function (e) {
    var that = this;
    var userInfo = e.detail.userInfo;
    that.setData({
      userInfo: userInfo,
      name: userInfo.nickName,
      imgUrl: userInfo.avatarUrl,
      isUse: true,
    })
  },
  // 滚动切换联系方式标签样式，by yining
  switchTab: function (e) {
    var that = this;
    var index = e.detail.current;//当前所在页面的 index
    that.setData({
      currentTab: e.detail.current,
    });
    //如果当前页面与正在编辑的页面不同，则恢复默认样式
    if (index != that.data.inputTab) {
      that.setData({
        isInputDisabled: true,
      })
    }
    //否则，重置回原样式
    else {
      that.setData({
        isInputDisabled: false,
      })
    }
  },
  // 编辑联系方式模板条目，by yining
  contactSetTap: function (e) {
    var that = this;
    //如果当前页面修改状态为已完成，则正常弹出编辑弹窗，否则弹出warning
    if (that.data.isInputFinish) {
      wx.showModal({
        title: '编辑确认',
        content: '您确认要编辑该联系模板吗？',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            that.setData({
              inputTab: that.data.currentTab,//记录修改页，避免多模板同时修改
              isInputDisabled: false,//取消input禁用
              isInputFinish: false,//当前页面修改状态为未完成状态
              isFocus: true//获取第一行焦点
            })

          } else if (res.cancel) {
            console.log('用户点击取消') //结束函数不编辑条目
            return;
          }
        }
      })
    }
    //弹出warning
    else {
      that.setData({
        isShowTopTips: true
      })
      setTimeout(function () {
        that.setData({
          isShowTopTips: false
        });
      }, 700);
    }
  },
  // 删除联系方式模板条目，by yining，
  contactDeleteTap: function (e) {
    wx.showModal({
      title: '删除确认',
      content: '您确认要删除该联系模板吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          //删除的函数欠缺，TODO by Xinchao
        } else if (res.cancel) {
          console.log('用户点击取消')
          return;
        }
      }
    })
  },
  //保存当前修改为新模板，by yining
  contactSaveTap: function (e) {
    var that = this;
    wx.showModal({
      title: '保存确认',
      content: '您确认要保存现有修改吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.setData({
            inputTab: -1, //保存完毕，目前修改页重新置为-1
            isInputDisabled: true,//输入状态重新禁用
            isInputFinish: true,//修改状态设为已完成，为true
          })
          //保存函数欠缺，TODO by Xinchao
        }
        else if (res.cancel) {
          console.log('用户点击取消') //结束函数不删除条目
          return;
        }
      }
    })
  },
  newcontactSaveTap: function (e) {
    wx.showModal({
      title: '保存确认',
      content: '您确认要将此联系方式添加到常用模板吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')

          //保存函数欠缺，TODO by Xinchao
        }
        else if (res.cancel) {
          console.log('用户点击取消') //结束函数不删除条目
          return;
        }
      }
    })
  },
  newcontactResetTap: function (e) {
    wx.showModal({
      title: '重置确认',
      content: '您确认要将所有内容重置清空吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          //重置函数欠缺，TODO by Xinchao
        }
        else if (res.cancel) {
          console.log('用户点击取消') //结束函数不删除条目
          return;
        }
      }
    })
  }
})
