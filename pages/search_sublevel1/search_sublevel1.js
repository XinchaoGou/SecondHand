// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /*定义选择组件wiper的数据 */
    array: ['按距离远近', '按发布时间', '按价格从低到高', '按价格从高到低'],
    objectArray: [
      {
        id: 0,
        name: '按距离远近'
      },
      {
        id: 1,
        name: '按发布时间'
      },
      {
        id: 2,
        name: '按价格从低到高'
      },
      {
        id: 3,
        name: '按价格从高到低'
      }
    ],
    index: 0,
    priceHide: false,
    //picker组件的多列选择器
    multiArray: [['二手物品', '房屋租赁'], ['所有','电子产品', '学习资料', '家具厨具', '交通工具', '其他'], ['']],
    objectMultiArray: [
      [
        {
          id: 0,
          name: '二手物品'
        },
        {
          id: 1,
          name: '房屋租赁'
        }
      ], [
        {
          id: 0,
          name: '所有'
        },
        {
          id: 1,
          name: '电子产品'
        },
        {
          id: 2,
          name: '学习资料'
        },
        {
          id: 3,
          name: '家具用品'
        },
        {
          id: 4,
          name: '交通工具'
        },
        {
          id: 5,
          name: '其他'
        }
      ], [
        {
          id: 0,
          name: ''
        }
      ]
    ],
    multiIndex: [0, 0, 0]
  },

  switch1Change: function (e) {
    if (e.detail.value == false) {
      this.setData({
        priceHide: false
      })
    } else if (e.detail.value == true) {
      this.setData({
        priceHide: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },

  confirm: function () {
    wx.navigateBack()
  },

  back: function () {
    wx.navigateBack()
  },
  //以下代码来自开发者文档，加注释
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
            data.multiArray[1] = ['所有','电子产品', '学习资料', '家具厨具', '交通工具', '其他'];
            data.multiArray[2] = [];
            break;
          case 1:
            data.multiArray[1] = ['仅限zwischen', '可nach'];
            data.multiArray[2] = ['WG', 'Haus'];
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
                data.multiArray[2] = ['所有', '台灯', '床垫', '电饭锅', '电磁炉','其他'];
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
              case 2:
                data.multiArray[2] = ['蜥蜴', '龟', '壁虎'];
                break;
            }
            break;
        }
        data.multiIndex[2] = 0;
        console.log(data.multiIndex);
        break;
    }
    this.setData(data);
  }

})