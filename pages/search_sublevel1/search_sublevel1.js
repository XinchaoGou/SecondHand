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
    multiArray: [['二手物品', '房屋租赁', '有偿帮带'], ['所有', '电子产品', '学习资料', '家具厨具', '交通工具', '其他'], ['']],
    objectMultiArray: [
      [
        {
          id: 0,
          name: '二手物品'
        },
        {
          id: 1,
          name: '房屋租赁'
        },
        {
          id: 2,
          name: '有偿帮带'
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
    multiIndex: [0, 0, 0],
    //以下是City的数组定义
    multiCityArray: [['德国'], ['所有地区', 'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen',], ['']],
    objectMultiCityArray: [
      [
        {
          id: 0,
          name: '德国'
        }
      ], [
        {
          id: 1,
          name: 'Baden-Württemberg'
        },
        {
          id: 2,
          name: 'Bayern'
        },
        {
          id: 3,
          name: 'Berlin'
        },
        {
          id: 4,
          name: 'Brandenburg'
        },
        {
          id: 5,
          name: 'Bremen'
        },
        {
          id: 6,
          name: 'Hamburg'
        }
        ,
        {
          id: 7,
          name: 'Hessen'
        }
        ,
        {
          id: 8,
          name: 'Mecklenburg-Vorpommern'
        }
        ,
        {
          id: 9,
          name: 'Niedersachsen'
        }
        ,
        {
          id: 10,
          name: 'Nordrhein-Westfalen'
        },
        {
          id: 11,
          name: 'Rheinland-Pfalz'
        },
        {
          id: 12,
          name: 'Saarland'
        },
        {
          id: 13,
          name: 'Sachsen'
        },
        ,
        {
          id: 14,
          name: 'Sachsen-Anhalt'
        },
        {
          id: 15,
          name: 'Schleswig-Holstein'
        }
        ,
        {
          id: 16,
          name: 'Thüringen'
        }
      ], [
        {
          id: 0,
          name: ''
        }
      ]
    ],
    multiCityIndex: [0, 0, 0]
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
      //如果修改的列为第二列
      case 1:
        switch (data.multiCityIndex[0]) {
          //此时如果第一列为第一个大类
          case 0:
            //判断第二列选择的是哪一小类
            switch (data.multiCityIndex[1]) {
              case 0:
                data.multiCityArray[2] = [];
                break;
              case 1:
                data.multiCityArray[2] = ['所有', 'Stuttgart', 'Karlsruhe', 'Mannheim', 'Freiburg', 'Heidelberg', 'Tübingen', '其他'];
                break;
              case 2:
                data.multiCityArray[2] = ['所有', 'München', 'Nürnberg', 'Algusburg', 'Regensburg', 'Ingolstadt', 'Würzburg', 'Fürth', 'Erlangen', '其他'];
                break;
              case 3:
                data.multiCityArray[2] = [''];
                break;
              case 4:
                data.multiCityArray[2] = ['所有', 'Potsdam', '其他'];
                break;
              case 5:
                data.multiCityArray[2] = [''];
                break;
              case 6:
                data.multiCityArray[2] = [''];
                break;
              case 7:
                data.multiCityArray[2] = ['所有', 'Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach', '其他'];
                break;
              case 8:
                data.multiCityArray[2] = ['所有', 'Rostock','Schwerin', '其他'];
                break;
              case 9:
                data.multiCityArray[2] = ['所有', 'Hannover', 'Braunschweig', 'Wolfsburg', 'Osnabrück', 'Oldenburg', 'Göttingen', '其他'];
                break;
              case 10:
                data.multiCityArray[2] = ['所有', 'Köln', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Aachen','其他'];
                break;
              case 11:
                data.multiCityArray[2] = ['所有', 'Mainz', 'Ludwigshafen', 'Trier', 'Kaiserslautern', 'Worms', '其他'];
                break;
              case 12:
                data.multiCityArray[2] = ['所有', 'Saarbrücken', 'Neunkirchen', '其他'];
                break;
              case 13:
                data.multiCityArray[2] = ['所有', 'Dresden', 'Leipzig', 'Chemnitz','其他'];
                break;
              case 14:
                data.multiCityArray[2] = ['所有', 'Halle', 'Magdeburg', '其他'];
                break;
              case 15:
                data.multiCityArray[2] = ['所有', 'Kiel', 'Lübeck', '其他'];
                break;
              case 16:
                data.multiCityArray[2] = ['所有', 'Erfurt', 'Jena', 'Gera', 'Weimar','其他'];
                break;
            }
            break;
          //此时如果第一列为第二个大类
        }
        data.multiCityIndex[2] = 0;
        console.log(data.multiCityIndex);
        break;
    }
    this.setData(data);
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

})