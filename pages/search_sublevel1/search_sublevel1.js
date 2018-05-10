// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /*定义选择组件wiper的数据 */
    array: ['按距离远近', '按发布时间', '按价格从低到高', '按价格从高到低'],
    index: 0,
    //picker组件的多列选择器
    multiArray: [['二手物品', '房屋租赁', '有偿帮带'], ['所有', '电子产品', '学习资料', '家具厨具', '交通工具', '其他'], ['']],
    multiIndex: [0, 0, 0],
    //以下是City的数组定义
    multiCityArray: [[''], ['德国所有地区', 'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen',], ['']],
    multiCityIndex: [0, 0, 0],

    lowprice: 0,
    highprice: 70, //FIXME: 因为被刘大傻写死了！
    lowshowprice: 0,
    highshowprice: 2000
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  //以下代码来自开发者文档，加注释
  bindMultiPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value) 
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
                data.multiCityArray[2] = ['所有', 'Rostock', 'Schwerin', '其他'];
                break;
              case 9:
                data.multiCityArray[2] = ['所有', 'Hannover', 'Braunschweig', 'Wolfsburg', 'Osnabrück', 'Oldenburg', 'Göttingen', '其他'];
                break;
              case 10:
                data.multiCityArray[2] = ['所有', 'Köln', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Aachen', '其他'];
                break;
              case 11:
                data.multiCityArray[2] = ['所有', 'Mainz', 'Ludwigshafen', 'Trier', 'Kaiserslautern', 'Worms', '其他'];
                break;
              case 12:
                data.multiCityArray[2] = ['所有', 'Saarbrücken', 'Neunkirchen', '其他'];
                break;
              case 13:
                data.multiCityArray[2] = ['所有', 'Dresden', 'Leipzig', 'Chemnitz', '其他'];
                break;
              case 14:
                data.multiCityArray[2] = ['所有', 'Halle', 'Magdeburg', '其他'];
                break;
              case 15:
                data.multiCityArray[2] = ['所有', 'Kiel', 'Lübeck', '其他'];
                break;
              case 16:
                data.multiCityArray[2] = ['所有', 'Erfurt', 'Jena', 'Gera', 'Weimar', '其他'];
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


  /**
   * 利用滑块设置最大价格
   * by xinchao
   */
  lowPriceSlider: function (e) {
    var that = this;
    var tHighprice = that.data.highprice
    var eValue = e.detail.value;
    var tLowPrice = 0;

    if (eValue > tHighprice) {
      tLowPrice = tHighprice;
      that.setData({
        lowprice: tHighprice
      })
    }
    else {
      tLowPrice = eValue;
      that.setData({
        lowprice: eValue
      })
    }
    var data = that.switchClass(tLowPrice);
    that.setData({
      lowshowprice: data
    })
  },

  /**
   * 利用滑块设置最大价格
   * by xinchao
   */
  highPriceSlider: function (e) {
    var that = this;
    var tHighprice = 0;
    var eValue = e.detail.value;
    var tLowPrice = that.data.lowprice;

    if (eValue < tLowPrice) {
      tHighprice = tLowPrice;
      that.setData({
        highprice: tLowPrice
      })
    }
    else {
      tHighprice = eValue;
      that.setData({
        highprice: eValue
      })
    }
    var data = that.switchClass(tHighprice);
    that.setData({
      highshowprice: data
    })
  },

  /*
   * 根据滑块等级设置
   * TODO: 目前是7个等级,而且这个被刘大傻写死了！后续把接口留出来！
   * by xinchao
   * */
  switchClass: function (price) {
    var data = 0;
    switch (price) {
      case 0:
        data = 0;
        break;
      case 10:
        data = 20;
        break;
      case 20:
        data = 50;
        break;
      case 30:
        data = 100;
        break;
      case 40:
        data = 200;
        break;
      case 50:
        data = 500;
        break;
      case 60:
        data = 1000;
        break;
      case 70:
        data = 2000;
        break;
    }
    return data;
  },

})