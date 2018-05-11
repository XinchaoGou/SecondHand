// pages/search/search.js
var Bmob = require("../../utils/bmob.js");
var Utils = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {

    /*定义search页面加载内容的数组*/
    contentItems: [],
    location: null,
    pageindex: 0, //第几次加载
    callbackcount: 10, //设置每页返回数据的多少
    searchLoadingComplete: false, //加载完所有条目
    totalCount: 0, //查询到的总数目
    favorList: [], //收藏的objectId列表

    //搜索条件
    /* PRICE_UP
     * PRICE_DESCEND
     * DATE_DESCEND
     * DISTANCE_DESCEND
     */
    searchCondition: 'PRICE_DESCEND',
    maxDistance: 500,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.id) {
      console.log('是转发options.id ' + options.id);
      var mObjectId = options.id;
      //跳转指定的页面 TODO
      wx.navigateTo({
        url: '../search_section/search_section?id=' + mObjectId + '&favor=' + false
          + '&postId=' + 0
      })
    }

    // //TODO: 获取当前地理位置,只有根据地理位置排序的时候才需要吧
    // that.getLocation();
    that.getAllFromCloud();
  },

  /**
   * 封装首页信息加载
   * by xinchao
   */
  getAllFromCloud: function(){
    var that = this;
    that.getContentItemsFromCloud(0, that.data.callbackcount);

    const promise = that.getFavorListFromCloud();
    promise.then(function (favourArray) {
      var contentItems = that.data.contentItems;
      that.upDateFavorPic(contentItems, favourArray);
      that.setData({
        contentItems : contentItems
      })
    }, function (error) {
      console.log(error); // failure
    });


  },

  /**
   * 查询服务器，加载搜索条目列表
   * pageindex: 分页页码
   * callbackcount : 每页返回数据数目
   * by xincaho
   */
  getContentItemsFromCloud: function (pageindex, callbackcount) {
    var that = this;
    var searchCondition = that.data.searchCondition;
    //查询数据库获得发布物品信息
    var Offer = Bmob.Object.extend("Offer");
    var query = new Bmob.Query(Offer);
    //test
    // query.equalTo("typeName","电子产品");
    //TODO:设置查询条件
    switch (searchCondition) {
      case 'PRICE_UP':
        query.ascending('price'); //按价格升序排列
        break;
      case 'PRICE_DESCEND':
        query.descending('price'); //按价格降序排列
        break;
      case 'DATE_DESCEND':
        query.descending('createdAt'); //按时间降序排列
        break;
      case 'DISTANCE_DESCEND':
      // //当前用户位置，40.0改为微信获取到的位置
      // var point = that.data.location;
      // var maxDistance = that.data.maxDistance;
      // query.withinKilometers("location", point, maxDistance);  //位置周围3000米的数据
      // break;
      default:
        query.descending('createdAt'); //按时间降序排列
        break;
    }
    //设置查询分页大小
    console.log(pageindex, callbackcount);
    query.limit(callbackcount);
    query.skip(callbackcount * pageindex);

    //查询条目数量
    if (pageindex == 0) {
      that.searchTotalCount(query);
    }

    // 查询所有数据
    query.find({
      success: function (results) {
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
          //FIXME: 循环处理查询到的数据,详情
          for (var i = 0; i < results.length; i++) {
            var object = results[i];
            var id = object.id;
            var title = object.get('title');
            var price = object.get('price');
            var address = object.get('address');
            var urls = object.get('picUrlArray');
            if (urls == "") {
              //设置为默认图片 url数组注意
              urls = ['../../images/test/camera.png'];
            }
            //考虑时差，换算
            var mDate = Utils.getDateDiffWithJetLag(object.createdAt);

            //收藏
            var favouriteshow = false;
            //如果在收藏列表中
            if (that.data.favorList.findIndex((favorItem) => {
              return favorItem.id == id;
            }) > -1) {
              favouriteshow = true;
            }

            var offerItem = {
              title: title,
              price: price,
              address: address,
              src: urls[0],
              date: mDate,
              id: id,
              favouriteshow: favouriteshow
            }
            offerArray.push(offerItem);
          }
          //存储到本地
          that.setData({
            contentItems: offerArray
          });
          wx.setStorage({
            key: "contentList",
            data: offerArray
          });

        }
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
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
    var that = this;
    try {
      var favorList = wx.getStorageSync('favorList');
      //加载收藏列表
      if (favorList) {
        //从本地缓存读取
        that.setData({
          favorList: favorList
        })
      }
    } catch (e) {
      console.log('本地缓存favorList，offerList读取失败');
    }

    var contentItems = that.data.contentItems;
    var favorList = that.data.favorList;
    that.upDateFavorPic(contentItems, favorList);
    that.setData({
      contentItems : contentItems
    })

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
   * by xinchao
   */
  onPullDownRefresh: function () {
    var that = this;
    wx.vibrateShort();  // 使手机振动15ms  
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.setData({
      searchLoadingComplete: false, //加载完所有条目
      pageindex: 0, //第几次加载
    })
    that.getAllFromCloud();
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var newPageIndex = that.data.pageindex + 1;
    that.getContentItemsFromCloud(newPageIndex, that.data.callbackcount);
    //未搜索到底则递增分页
    if (!that.data.searchLoadingComplete) {
      that.setData({
        pageindex: newPageIndex,
      })
    }
    else {
      //加载完毕，已全部加载
      that.setData({
        searchLoadingComplete: true
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 根据favorList 更新视图的收藏图标
   * by xinchao
   */
  upDateFavorPic: function (contentItems, favorList) {

    var that = this;
    // var favorList = that.data.favorList;
    contentItems.forEach(function(e){
      var index =  favorList.findIndex((favorItem) => {
        return favorItem.id == e.id;
      }) 
      if ( index > -1) {
        //如果条目在收藏列表中，点亮图标，否则点灭
        e.favouriteshow = true;
      } else{
        e.favouriteshow = false;
      }
    });
    return contentItems;

  },

  /**
   * 设置搜索地址 TODO
   * by xinchao
   */
  getLocation: function () {
    var that = this;
    //TODO: 默认先从本地加载 为什么从本地加载location
    // try {
    //   var location = wx.getStorageSync('location')
    //   if (location) {
    //     that.setData({
    //       location: location
    //     });
    //     return;
    //   }
    // } catch (e) {
    //   console.log(e);
    // }

    wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        // success
        //电脑调试的时候，经纬度为空，手机上可以运行
        var longitude = res.longitude;
        var latitude = res.latitude;
        var location = new Bmob.GeoPoint({ latitude: latitude, longitude: longitude });
        that.setData({
          location: location
        });
        //缓存到本地
        wx.setStorage({
          key: "location",
          data: location
        })
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
   * 从服务器获得收藏列表
   * by xinchao
   */
  getFavorListFromCloud: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      var User = Bmob.Object.extend("_User");
      var query = new Bmob.Query(User);
      query.get(Bmob.User.current().id, {
        success: function (result) {
          // 查询用户成功
          console.log("查询当前用户成功");
          var relation = result.relation('like');
          var query = relation.query();
          query.find({
            success: function (list) {
              // 查询用户收藏成功
              console.log("查询到" + list.length + "条收藏");
              var favourArray = [];
              for (let i = 0; i < list.length; i++) {
                var object = list[i];
                //获得收藏列表内容详情
                var id = object.id;
                var title = object.get('title');
                var typeName = object.get('typeName');
                var address = object.get('address');
                var location = object.get('location');
                var price = object.get('price');
                var urls = object.get('picUrlArray');
                if (urls == "") {
                  //设置为默认图片 url数组注意
                  urls = ['../../images/test/camera.png'];
                }
                var content = object.get('content');
                var publisher = Bmob.User.current().id; //用户当前id
                var wxNumber = object.get('wxNumber');
                var phoneNumber = object.get('phoneNumber');
                var eMail = object.get('eMail');
                //考虑时差，换算
                var mDate = Utils.getDateDiffWithJetLag(object.createdAt);
                var favorItem = {
                  id: id,
                  title: title,
                  typeName: typeName,
                  address: address,
                  location: location,
                  price: price,
                  urls: urls,
                  content: content,
                  publisher: publisher,
                  contact: {
                    wxNumber: wxNumber,
                    phoneNumber: phoneNumber,
                    eMail: eMail,
                  },
                  src: urls[0],
                  date: mDate,
                  favouriteshow: true
                }
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
        error: function (object, error) {
          console.log("查询当前用户失败");
          reject(error);
        }
      });
    })
  },

  /**
   * 查询条目数量
   * by xinchao
   */
  searchTotalCount: function (query) {
    var that = this;
    query.count({
      success: function (count) {
        console.log("共有 " + count + " 条记录");
        that.setData({
          totalCount: count
        });
        wx.setStorage({
          key: "totalCount",
          data: count
        });
      },
      error: function (error) {
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
  tosubsearch: function () {
    wx.navigateTo({ 
      url: '../search_sublevel1/search_sublevel1' 
    })
  },

  /**
   * 点击收藏图标绑定事件，修改图标，修改数据库
   * by xinchao
   */
  favourite_touch: function (event) {
    var that = this;
    var postId = event.currentTarget.dataset.favouriteid;
    var objectId = that.data.contentItems[postId].id;  // 获得数据库对应objectId
    //修改收藏图片显示
    var isshow = this.data.contentItems[postId].favouriteshow;
    var str = 'contentItems[' + postId + '].favouriteshow';
    that.setData({
      [str]: !isshow
    })

    //本地缓存也要更改！
    var mContentList = null;
    try {
      mContentList = wx.getStorageSync('contentList')
      if (mContentList) {
        mContentList[postId].favouriteshow = !isshow;
      }
    } catch (e) {
      // Do something when catch error
    }
    wx.setStorage({
      key:"contentList",
      data: mContentList
    })

    //修改favorList
    var favorList = that.data.favorList;
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
          relation.add(result);
          //修改favorList,可能有bug
          favorList.push(that.data.contentItems[postId]);
        } else {
          //取消收藏
          relation.remove(result);
          var index = favorList.findIndex((favorItem) => {
            return favorItem.id == that.data.contentItems[postId].id;
            });
          favorList.splice(index,1);
        }
        user.save();
        that.setData({
          favorList : favorList
        });
        wx.setStorage({
          key:"favorList",
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
   * TODO:点击某一个条目查看详情
   * by xinchao
   */
  itemTap: function (event) {
    var that = this;
    var postId = event.currentTarget.dataset.postid;
    var objectId = that.data.contentItems[postId].id;  // 获得数据库对应objectId
    var favor = that.data.contentItems[postId].favouriteshow;
    //跳转条目详情
    wx.navigateTo({
      url: '../search_section/search_section?id=' + objectId + '&favor=' + favor
        + '&postId=' + postId
    })
  },

})