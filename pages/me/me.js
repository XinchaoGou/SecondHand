var Bmob = require("../../utils/bmob.js");
var Utils = require("../../utils/util.js");
var app = getApp();

Page({

  data: {
    imgUrl: '../../images/test/logo3.png',
    name: '点击头像登录',
    userInfo: {},
    favorList: [],
    offerList: [],
    contactList: [],

    //new contact新保存的联系方式,不要删除，用来重置表单数据的 by xinchao
    newContact: {
      wxNumber: '',
      phoneNumber: '',
      eMail: ''
    },
    //模版数目
    maxContactNumber: 3,
    //页面隐藏设计添加的变量，by yining
    isShowOffer: false,
    isShowFavourite: false,
    isShowContact: false,
    //isShowDevelop: false,
    //获取联系方式的swiper组件的当前页，从0开始
    currentTab: 0,
    //控制input组件禁用的变量，true时禁用
    isInputDisabled: true,
    //记录是哪一页的input组件可以使用，目前正在编辑的联系方式模板
    inputTab: -1,
    //判断编辑状态是否结束
    isInputFinish: true,
    //判断是否应该弹出警告
    isShowTopTips: false,
    TopTips: '',
    //获取首行焦点
    isFocus: false,
    //控制空白模板输入有无的变量
    is_wx_input: false,
    is_phone_input: false,
    is_email_input: false,

    //微信api更改之后
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isUse: false,
  },

  onLoad: function () {
    var that = this;
    console.log("监听me页面onLoad加载")
    if (!Bmob.User.current()) {
      console.log('未找到用户');
      try {
        console.log('退出登陆');
        Bmob.User.logOut();
        wx.clearStorageSync()
      } catch (e) {
        console.log(e);
      }
      console.log('重新注册');
      that.reLogin();

      setTimeout(() => {
        //等待用户信息加载，延时6秒左右，失败的情况只能下拉刷新界面
        that.searchFavouriteList();
        that.searchOfferList();
        that.upDateUserInfo();
        that.getContactList();
      },6000);
      return;
    } else {
      console.log('注册成功'+Bmob.User.current().id);
      that.searchFavouriteList();
      that.searchOfferList();
      that.upDateUserInfo();
      that.getContactList();
    }

  },

  //重构为默认从本地缓存获取
  onShow: function () {
    console.log("监听me页面onShow加载")
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
          contactList: contactList
        });
      } else {
        //从服务器获得用户联系方式
        that.getContactList();
      }

    } catch (e) {
      console.log('本地缓存favorList，offerList，userInfo,contactList读取失败');
    }
    that.setData({
      isInputDisabled: true,//页面每次重新渲染时，将保存图标改为编辑图标，编辑过程改为已完成
      isInputFinish: true,
      inputTab: -1,
    })

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
        console.log("查询当前用户收藏列表失败");
        // try {
        //   console.log('退出登陆');
        //   Bmob.User.logOut();
        //   wx.clearStorageSync()
        // } catch (e) {
        //   console.log(e);
        // }
        //刷新
        // that.onPullDownRefresh();

      }
    });
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
              var userName = userInfo.nickName;
              var userPic = userInfo.avatarUrl;
              that.setData({
                userInfo: userInfo,
                name: userName,
                imgUrl: userPic,
                isUse: true,
              });
              wx.setStorage({
                key: "userInfo",
                data: userInfo
              });
              //上传头像和昵称到数据库
              //查询用户收藏列表
              var User = Bmob.Object.extend("_User");
              var query = new Bmob.Query(User);
              query.get(Bmob.User.current().id, {
                success: function (result) {
                  // 查询成功
                  console.log("查询当前用户头像昵称成功");
                  result.set('userName', userName);
                  result.set('userPic', userPic);
                  result.save();

                },
                error: function (object, error) {
                  // 查询失败
                  console.log("查询当前用户头像昵称失败");
                }
              });


            }
          })
        }
      }
    })
  },

  /**
   * 获得用户的联系方式模版
   * by xinchao
  */
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
        if (!mContact) {    //如果查询到，存储到本地和data 
          mContact = [];
        }
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
          //更新data
          that.setData({
            contactList: mContactList,
            newContact: that.data.newContact, //用于重置表单数据
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
    that.onLoad();
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  //分享 TODO: 默认分享首页
  onShareAppMessage: function () {
    return {
      title: '老喵',
      desc: '找二手，上老喵！找房子，上老喵！\n找帮带，上老喵！找外卖，上老瞄！\n喵一眼，啥都有',
      path: '/pages/search/search',
      imageUrl: '../../images/test/poster.png',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
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
        isShowContact: false,
        //isShowDevelop: false,
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
        isShowContact: false,
        //isShowDevelop: false,
      })
    }
    this.setData({
      isShowOffer: !switch2
    })
  },

  tocontact: function () {
    var that = this;
    var switch3 = that.data.isShowContact;

    /*var query = wx.createSelectorQuery()
    query.select('#contact').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      res[0].top       // #the-id节点的上边界坐标
      res[1].scrollTop // 显示区域的竖直滚动位置
    })*/

    if (!switch3) {
      //如果原来是false，要展开联系方式列表，则折叠其他列表
      that.setData({
        isShowFavourite: false,
        isShowOffer: false,
        currentTab: 0
      })
      //与页面渲染速度有关，于是设置一个延时执行页面滚动方法
      setTimeout(() => { wx.pageScrollTo({ scrollTop: 900 }); }, 200);
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
        TopTips: '请先保存上一模板的修改',
        isShowTopTips: true
      })
      setTimeout(function () {
        that.setData({
          isShowTopTips: false
        });
      }, 700);
    }
  },
  // 点击删除联系方式模板条目，by yining，
  contactDeleteTap: function (e) {
    var that = this;
    wx.showModal({
      title: '删除确认',
      content: '您确认要删除该联系模板吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.contactDelete();
        } else if (res.cancel) {
          console.log('用户点击取消')
          return;
        }
      }
    })
  },
  //保存当前修改为新模板，by yining
  /*wxNumber: '',
  phoneNumber: '',
  eMail: ''*/
  contactSaveTap: function (newContact) {
    var that = this;
    var mContactList = that.data.contactList;
    var index = that.data.currentTab;
    if (newContact.wxNumber == "" && newContact.phoneNumber == "" && newContact.eMail == "") {
      that.setData({
        TopTips: '请至少输入一种联系方式',
        isShowTopTips: true
      })
      setTimeout(function () {
        that.setData({
          isShowTopTips: false
        });
      }, 700);
    }
    else {
      wx.showModal({
        title: '保存确认',
        content: '您确认要保存现有修改吗？',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定');
            //修改对应模版
            mContactList[index] = newContact;

            that.setData({
              inputTab: -1, //保存完毕，目前修改页重新置为-1
              isInputDisabled: true,//输入状态重新禁用
              isInputFinish: true,//修改状态设为已完成，为true
            })

            that.upDateContact(mContactList);
          }
          else if (res.cancel) {
            console.log('用户点击取消') //结束函数不删除条目
            return;
          }
        }
      })
    }

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
    if (newContact)
      wx.showModal({
        title: '保存确认',
        content: '您确认要将此联系方式添加到常用模板吗？',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            var mContact = newContact;
            mContactList.push(mContact);
            that.upDateContact(mContactList);
            //控制空白模板输入有无的变量
            that.setData({
              is_wx_input: false,
              is_phone_input: false,
              is_email_input: false,
            })
          }
          else if (res.cancel) {
            console.log('用户点击取消') //结束函数不删除条目
            return;
          }
        }
      })
  },

  //重置模版
  newContactResetTap: function (e) {
    var that = this;
    wx.showModal({
      title: '重置确认',
      content: '您确认要将联系方式重置清空吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          //用于重置表单数据
          that.setData({
            newContact: that.data.newContact,
            is_wx_input: false,//by yining, 这三个变量用于控制保存和重置按钮显示，只有输入至少一种联系方式时才显示
            is_phone_input: false,
            is_email_input: false
          })
        }
        else if (res.cancel) {
          console.log('用户点击取消') //结束函数不删除条目
          return;
        }
      }
    })
  },

  //删除联系方式的实现
  contactDelete: function () {
    var that = this;
    //发布人联系方式
    var mContactList = that.data.contactList;
    var mCurrentTab = that.data.currentTab;
    if (mCurrentTab < that.data.maxContactNumber) {
      //最多3个模版，冗余判断，增加可靠性     
      //删除data
      mContactList.splice(mCurrentTab, 1);
      //更新本地缓存
      wx.setStorage({
        key: "contactList",
        data: mContactList
      });
      //修改服务器
      that.upDateContact(mContactList);
    }
  },

  /**
   * 用户提交表单上传新模版
   * by xinchao 
   */
  formSubmit: function (e) {
    var that = this;
    that.newContactSaveTap(e.detail.value);
  },

  //常用联系模板的表单值
  formCommonSubmit: function (e) {
    var that = this;
    that.contactSaveTap(e.detail.value);
  },

  wxNumberInput: function (e) {
    var that = this;
    if (e.detail.value == "") {
      that.setData({
        is_wx_input: false
      })
    }
    else {
      that.setData({
        is_wx_input: true,
      })
    }
  },
  phoneInput: function (e) {
    var that = this;
    if (e.detail.value == "") {
      that.setData({
        is_phone_input: false
      })
    }
    else {
      that.setData({
        is_phone_input: true
      })
    }
  },
  eMailInput: function (e) {
    var that = this;
    if (e.detail.value == "") {
      that.setData({
        is_email_input: false
      })
    }
    else {
      that.setData({
        is_email_input: true
      })
    }
  },

  reLogin: function () {
    try {
      console.log('退出登陆');
      Bmob.User.logOut();
      wx.clearStorageSync()
    } catch (e) {
      console.log(e);
    }

    wx.login({
      success: function (res) {
        var user = new Bmob.User();//实例化          
        user.loginWithWeapp(res.code).then(
          function(user) {
            var openid = user.get('authData').weapp.openid
            wx.setStorageSync('openid', openid)
            //保存用户其他信息到用户表
            wx.getUserInfo({
              success: function(result) {
                var userInfo = result.userInfo
                var nickName = userInfo.nickName
                var avatarUrl = userInfo.avatarUrl
                var u = Bmob.Object.extend('_User')
                var query = new Bmob.Query(u)
                query.get(user.id, {
                  success: function(result) {
                    result.set('nickName', nickName)
                    result.set('userPic', avatarUrl)
                    result.set('openid', openid)
                    result.save()
                  }
                })
              }
            })
          },
          function(err) {
            console.log(err, 'errr')
          }
        )
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    });
  },

})
