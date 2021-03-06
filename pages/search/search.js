// pages/search/search.js
var Bmob = require("../../utils/bmob.js");
var Utils = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /*定义search页面的导航分类色块的内容*/
    moduleItems: ['美食', '二手', '租房', '帮带'],
    /*此变量定义了当前选中的导航分类色块的index，0代表外卖，1代表二手，3代表租房，4代表帮带，-1代表全体种类*/
    CurrentsId: -1,
    /*isOutTake: false,
    isSecondHand: false,
    isHausRent: false,
    isHelpBuy: false,*/
    /*定义search页面加载内容的数组*/
    contentItems: [],
    location: null,
    pageindex: 0, //第几次加载
    callbackcount: 10, //设置每页返回数据的多少
    searchLoadingComplete: false, //加载完所有条目
    totalCount: 0, //查询到的总数目
    favorList: [], //收藏的objectId列表

    //搜索条件
    searchCondition: '',
    lowPrice: 0,
    highPrice: 2000,
    //搜索地点
    searchCity: '德国所有地区',
    //搜索种类
    searchType: '所有种类',
    isNewSearch: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (options.id) {
      console.log('是转发options.id ' + options.id);
      var mObjectId = options.id;
      //跳转指定的页面
      wx.navigateTo({
        url: '../search_section/search_section?id=' + mObjectId
      })
    }

    //首页信息加载
    that.getAllFromCloud();
  },

  /**
   * 封装首页信息加载
   * by xinchao
   */
  getAllFromCloud: function() {
    var that = this;
    that.getContentItemsFromCloud(0, that.data.callbackcount);

    if (!Bmob.User.current()) {
      // console.log('未找到用户');
      // try {
      //   console.log('退出登陆');
      //   Bmob.User.logOut();
      //   wx.clearStorageSync()
      // } catch (e) {
      //   console.log(e);
      // }
      // setTimeout(() => {
      // }, 2000);
      console.log('未找到用户，重新注册');
      that.reLogin();

      setTimeout(() => {
        //等待用户信息加载，延时6秒左右，失败的情况只能下拉刷新界面
        const promise = that.getFavorListFromCloud();
        promise.then(function(favourArray) {
          var contentItems = that.data.contentItems;
          that.setData({
            contentItems: that.upDateFavorPic(contentItems, favourArray)

          })
        }, function(error) {
          console.log(error); // failure
          console.log('用户信息加载超时，重新登陆' + error); // failure
        });
      }, 6000);
      return;

    } else {
      //等待用户信息加载，延时5秒左右，失败的情况只能下拉刷新界面
      console.log('找到用户' + Bmob.User.current().id);
      const promise = that.getFavorListFromCloud();
      promise.then(function(favourArray) {
        var contentItems = that.data.contentItems;
        that.setData({
          contentItems: that.upDateFavorPic(contentItems, favourArray)

        })
      }, function(error) {
        console.log('用户id失效，重新登陆' + error); // failure
        that.reLogin();
      });
    }

  },



  /**
   * 查询服务器，加载搜索条目列表
   * pageindex: 分页页码
   * callbackcount : 每页返回数据数目
   * by xincaho
   */
  getContentItemsFromCloud: function(pageindex, callbackcount) {
    var that = this;
    var searchCondition = that.data.searchCondition;
    //查询数据库获得发布物品信息
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    //设置查询条件
    switch (searchCondition) {
      case '按价格从低到高':
        query.ascending('price'); //按价格升序排列
        break;
      case '按价格从高到低':
        query.descending('price'); //按价格降序排列
        break;
      case '按发布时间':
        query.descending('createdAt'); //按时间降序排列
        break;
      default:
        query.descending('createdAt'); //按时间降序排列
        break;
    }
    //设置价格限制
    query.lessThan('price', that.data.highPrice);
    query.greaterThan('price', that.data.lowPrice);
    //设置城市和物品类别的匹配
    if (that.data.type0 != '所有种类') {
      query.equalTo("type0", that.data.type0);
      if (that.data.type1 != '所有') {
        query.equalTo("type1", that.data.type1);
        if (that.data.type2 != '所有') {
          query.equalTo("type2", that.data.type2);
        }
      }
    }

    if (that.data.province != '德国所有地区') {
      query.equalTo("province", that.data.province);
      if (that.data.city != '所有地区') {
        query.equalTo("city", that.data.city);
      }
    }

    //设置查询分页大小
    console.log(pageindex, callbackcount);
    query.limit(callbackcount);
    query.skip(callbackcount * pageindex);

    //查询条目数量，必须设置好条件才查询总数目
    if (pageindex == 0) {
      that.searchTotalCount(query);
    }

    // 查询所有数据
    query.find({
      success: function(results) {
        if (results.length == 0) {
          that.setData({
            searchLoadingComplete: true
          })
        } else {
          console.log("共查询到 " + results.length + " 条记录");
          var offerArray;
          if (pageindex > 0) {
            offerArray = that.data.contentItems;
          } else {
            offerArray = new Array();
          }
          for (var i = 0; i < results.length; i++) {
            var object = results[i];
            var offerItem = that.cloudDataToLocal(object);
            offerItem.favouriteshow = false;
            //重要，如果在收藏列表中设置图标点亮
            if (that.data.favorList.findIndex((favorItem) => {
                return favorItem.id == object.id;
              }) > -1) {
              offerItem.favouriteshow = true;
            }

            offerArray.push(offerItem);
          }
          //存储到本地
          that.setData({
            contentItems: offerArray
          });
          //这里可以看如果已经时总数目了，可以设置加载完成的显示
          if (offerArray.length >= that.data.totalCount) {
            //加载完毕，已全部加载
            that.setData({
              searchLoadingComplete: true
            });
          }
          wx.setStorage({
            key: "contentList",
            data: offerArray
          });

        }
      },
      error: function(error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   * TODO: 搜索改变要重新刷新
   * by xinchao
   */
  onShow: function() {
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
        if (contentItems.length >= that.data.totalCount) {
          //加载完毕，已全部加载
          that.setData({
            searchLoadingComplete: true
          });
        }
      }

      //加载搜索类型 TODO: 类型变换重新搜索
      var searchType = wx.getStorageSync('searchType');
      if (searchType) {
        var tArray = searchType.mArray;
        var tIndex = searchType.mIndex;

        var type0 = tArray[0][tIndex[0]];
        var type1 = tArray[1][tIndex[1]];
        var type2 = tArray[2][tIndex[2]];

        var str0 = '';
        var str1 = '';
        var str2 = '';
        if (type0) { //如果存在则赋值，否则默认为空字符串
          str0 = type0;
        }
        //by yining
        switch (type0) {
          case '所有种类':
            that.setData({
              CurrentsId: -1
            });
            break;
          case '二手物品':
            that.setData({
              CurrentsId: 1
            })
            break;
          case '房屋租赁':
            that.setData({
              CurrentsId: 2
            })
            break;
          case '有偿帮带':
            that.setData({
              CurrentsId: 3
            })
            break;
          case '美食外卖':
            that.setData({
              CurrentsId: 0
            })
            break;
        }
        //以上by yining
        if (type1) {
          str1 = type1;
        }
        if (type2) {
          str2 = type2;
        }
        var str = str0 + ' ' + str1 + ' ' + str2

        that.setData({
          searchType: str,
          type0: type0,
          type1: type1,
          type2: type2,
        })
      }
      //加载搜索城市 TODO: 类型变换重新搜索
      var searchCity = wx.getStorageSync('searchCity');
      if (searchCity) {
        var tArray = searchCity.mArray;
        var tIndex = searchCity.mIndex;
        var province = tArray[0][tIndex[0]];
        var city = tArray[1][tIndex[1]];
        var str = province + ' ' + city

        that.setData({
          searchCity: str,
          province: province,
          city: city,
        })
      }
      //加载搜索顺序
      var searchOrder = wx.getStorageSync('searchOrder');
      if (searchOrder) {
        var tArray = searchOrder.mArray;
        var tIndex = searchOrder.mIndex;
        var str = tArray[tIndex];
        var mSearchCondition = that.data.searchCondition;
        that.setData({
          searchCondition: str
        });
        // if (mSearchCondition != str) {
        //   //如果搜索条件改变，要重新排列
        //   that.onPullDownRefresh();
        //   return;
        // }
      }
      //加载价格设置
      var priceRange = wx.getStorageSync('priceRange');
      if (priceRange) {
        var mLowPrice = that.data.lowPrice;
        var mHighPrice = that.data.highPrice;
        var lowPrice = priceRange.lowshowprice;
        var highPrice = priceRange.highshowprice;
        that.setData({
          lowPrice: lowPrice,
          highPrice: highPrice
        });
        // if ((lowPrice != mLowPrice) || (highPrice != mHighPrice)) {
        //   //如果搜索条件改变，要重新排列
        //   that.onPullDownRefresh();
        //   return;
        // }
      }

    } catch (e) {
      console.log('search条件本地缓存读取失败');
    }

    if (that.data.isNewSearch) { //设置界面跳转过来，刷新信息，重置开关，
      //刷新信息
      that.onPullDownRefresh();
      //重置开关
      that.setData({
        isNewSearch: false,
      })
    } else {
      //如果搜索条件没变化，是从其他页面跳转，那就更新一下与本地缓存同步
      var contentItems = that.data.contentItems;
      var favorList = that.data.favorList;
      that.setData({
        contentItems: that.upDateFavorPic(contentItems, favorList)
      })
    }


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   * by xinchao
   */
  onPullDownRefresh: function() {
    var that = this;
    wx.vibrateShort(); // 使手机振动15ms  
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.setData({
      searchLoadingComplete: false, //加载完所有条目
      pageindex: 0, //第几次加载
    });
    //清空条目缓存
    try {
      wx.removeStorageSync('contentList');
    } catch (e) {
      console.log(e);
    }
    that.getAllFromCloud();
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    var newPageIndex = that.data.pageindex + 1;
    that.getContentItemsFromCloud(newPageIndex, that.data.callbackcount);
    //未搜索到底则递增分页
    //TODO: 这里能不能改变一下判断条件，看总数目是不是已经达到了，但是如果没有10条，是不是不会触发这个函数
    //或者也许可以这里不判断是否完成
    if (!that.data.searchLoadingComplete) {
      that.setData({
        pageindex: newPageIndex,
      })
    } else {
      //加载完毕，已全部加载
      that.setData({
        searchLoadingComplete: true
      });
    }
  },

  /**
   * 用户点击右上角分享
   * TODO: 分享图片和名字要重新设置
   */
  onShareAppMessage: function() {

    return {
      title: '老喵',
      desc: '找二手，上老喵！找房子，上老喵！\n找帮带，上老喵！找外卖，上老瞄！\n喵一眼，啥都有',
      path: '/pages/search/search',
      imageUrl: '../../images/test/poster.png',
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },

  /**
   * 从云端查询到的条目转化为本地缓存数据
   * object
   * by xinchao
   */
  cloudDataToLocal: function(object) {
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
   * 根据favorList 更新视图的收藏图标
   * by xinchao
   */
  upDateFavorPic: function(contentItems, favorList) {

    var that = this;
    contentItems.forEach(function(e) {
      var index = favorList.findIndex((favorItem) => {
        return favorItem.id == e.id;
      })
      if (index > -1) {
        //如果条目在收藏列表中，点亮图标，否则点灭
        e.favouriteshow = true;
      } else {
        e.favouriteshow = false;
      }
    });
    return contentItems;

  },

  /**
   * 从服务器获得收藏列表
   * by xinchao
   */
  getFavorListFromCloud: function() {
    var that = this;
    return new Promise(function(resolve, reject) {
      if (!Bmob.User.current()) {
        //如果未找到用户，刷新
        console.log('搜索收藏列表时未找到用户重新刷新，重新注册');
        that.reLogin();
        // setTimeout(() => {
        // }, 2000);
        return;
      }
      var User = Bmob.Object.extend("_User");
      var query = new Bmob.Query(User);
      query.get(Bmob.User.current().id, {
        success: function(result) {
          // 查询用户成功
          console.log("getFavorListFromCloud查询当前用户成功");
          var relation = result.relation('like');
          var query = relation.query();
          query.descending('createdAt'); //排序
          query.find({
            success: function(list) {
              // 查询用户收藏成功
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
              //同步处理favourArray
              resolve(favourArray);
            }
          });
        },
        error: function(object, error) {
          console.log("getFavorListFromCloud查询当前用户失败，重新注册");
          that.reLogin();
          reject(error);
        }
      });
    })
  },

  /**
   * 查询条目数量
   * by xinchao
   */
  searchTotalCount: function(query) {
    var that = this;
    query.count({
      success: function(count) {
        console.log("共有 " + count + " 条记录");
        that.setData({
          totalCount: count
        });
        wx.setStorage({
          key: "totalCount",
          data: count
        });
        if (count == 0) { //没搜索到则清空
          that.setData({
            searchLoadingComplete: true,
            contentItems: [],
          });
          wx.setStorage({
            key: "contentItems",
            data: []
          });
        }
      },
      error: function(error) {
        console.log("查询总条目数错误，从本地缓存读取数目");
        wx.getStorage({
          key: 'totalCount',
          success: function(res) {
            that.setData({
              totalCount: res.data
            });
          }
        })
      }
    });
  },

  /*通往搜索sublevel1子页面入口，出现了问题，堆栈方面的，需要后续处理 by yining*/
  tosubsearch: function() {
    wx.navigateTo({
      url: '../search_sublevel1/search_sublevel1'
    })
  },

  /**
   * 点击收藏图标绑定事件，修改图标，修改数据库
   * by xinchao
   */
  favourite_touch: function(event) {
    var that = this;
    var postId = event.currentTarget.dataset.favouriteid;
    var objectId = that.data.contentItems[postId].id; // 获得数据库对应objectId
    //修改收藏图片显示
    var isshow = this.data.contentItems[postId].favouriteshow;
    var str = 'contentItems[' + postId + '].favouriteshow';
    that.setData({
      [str]: !isshow
    });

    //本地缓存也要更改！
    var mContentList = null;
    try {
      mContentList = wx.getStorageSync('contentList')
      if (mContentList) {
        mContentList[postId].favouriteshow = !isshow;
      }
    } catch (e) {
      console.log(e);
    }
    wx.setStorage({
      key: "contentList",
      data: mContentList
    })

    //修改favorList
    var favorList = that.data.favorList;
    //获取实例
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    query.get(objectId, {
      success: function(result) {
        //将对应ObjectId 的 Offer关联到收藏
        var user = Bmob.User.current();
        var relation = user.relation("like");
        //实现数据库端like的同步
        if (!isshow) {
          //点击之前为false，点击之后为true，表示收藏
          console.log('添加收藏');
          relation.add(result);
          //修改favorList,可能有bug
          favorList.push(that.data.contentItems[postId]);
        } else {
          //取消收藏
          console.log('取消收藏');
          relation.remove(result);
          var index = favorList.findIndex((favorItem) => {
            return favorItem.id == that.data.contentItems[postId].id;
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
      error: function(object, error) {
        // 查询失败
        console.log('收藏失败' + error);
      }
    });
  },

  /**
   * 点击某一个条目查看详情
   * by xinchao
   */
  itemTap: function(event) {
    var that = this;
    var postId = event.currentTarget.dataset.postid;
    var objectId = that.data.contentItems[postId].id; // 获得数据库对应objectId
    console.log('跳转详情' + objectId);
    try {
      wx.setStorageSync('sectionItem', that.data.contentItems[postId])
    } catch (e) {}

    //TODO: 如果是外卖跳转其他页面,外卖的索引待定！
    if (that.data.contentItems[postId].type0 == "美食外卖") {
      //跳转条目详情
      wx.navigateTo({
        url: '../takeout/takeout?id=' + objectId
      })
      return;
    }


    //跳转条目详情
    wx.navigateTo({
      url: '../search_section/search_section?id=' + objectId
    })
  },

  reLogin: function() {
    try {
      console.log('退出登陆');
      Bmob.User.logOut();
      wx.clearStorageSync()
    } catch (e) {
      console.log(e);
    }

    wx.login({
      success: function(res) {
        var user = new Bmob.User(); //实例化          
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
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    });
  },
  /*监听导航色块的点击，不断更新currentsid的变量值，by yining*/
  moduleTap: function(event) {
    var that = this;
    var postId = event.currentTarget.dataset.postid;
    var currentsId = that.data.CurrentsId;
    var typeArray = [];
    var typeIndex = [];

    typeArray[0] = ['所有种类', '二手物品', '房屋租赁', '有偿帮带', '美食外卖'];
    typeIndex[1] = 0;
    typeIndex[2] = 0;

    if (currentsId == postId) {
      that.setData({
        CurrentsId: -1
      })
      typeArray[1] = [''];
      typeArray[2] = [''];
      typeIndex[0] = 0;
    } else {
      that.setData({
        CurrentsId: postId
      })
      switch (that.data.moduleItems[postId]) {
        case '美食':
          typeArray[1] = ['所有'];
          typeArray[2] = [''];
          typeIndex[0] = 4;
          break;
        case '二手':
          typeArray[1] = ['所有', '电子产品', '学习资料', '家具厨具', '交通工具', '健身娱乐', '服装箱包', '办公用品'];
          typeArray[2] = [''];
          typeIndex[0] = 1;
          break;
        case '租房':
          typeArray[1] = ['所有', '仅限zwischen', '可nach'];
          typeArray[2] = [''];
          typeIndex[0] = 2;
          break;
        case '帮带':
          typeArray[1] = ['所有', '带到国内', '带到德国'];
          typeArray[2] = [''];
          typeIndex[0] = 3;
          break;
      }
    }
    //搜索类别
    wx.setStorage({
      key: "searchType",
      data: {
        mArray: typeArray,
        mIndex: typeIndex
      }
    });
    that.onShow();
    that.onPullDownRefresh();
  }

})