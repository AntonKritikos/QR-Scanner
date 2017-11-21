// First create a new Vue instance
var vue = new Vue({
  el: '#app-root',
  data: {
    page: 'scan',
    data: [],
    offset: 0,
    amount: 25,
    product: {},
    result: '',
    temp: {},
    pagination: 0,
    maxPages: 5,
    basket: {}
  },
  methods: {
    onCapture(event) {
      if (event === null) {
        // no QR-Code dected since last capture
      } else {
        this.onDecode(event.result);
        event.points // array of QR-Code module positions
      }
    },
    requestJson(type, Url, reqAuth, data) {
      reqAuth = reqAuth || false;
      data = data || null
      var Httpreq = new XMLHttpRequest(); // a new request
      Httpreq.open(type, Url, false);
      if (reqAuth) {
        Httpreq.setRequestHeader('authentication-token', this.getCookie('authentication-token'));
      }
      Httpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      Httpreq.send(JSON.stringify(data));
      if (!this.getCookie('authentication-token')) {
       this.setCookie('authentication-token', Httpreq.getResponseHeader('authentication-token'));
       this.setCookie('basket-id', (JSON.parse(Httpreq.responseText)).title );
      }
      return JSON.parse(Httpreq.responseText);
    },
    onDecode(result) {
      Vue.set(vue, 'offset', 0);
      Vue.set(vue, 'result', result);
      Vue.set(vue, 'pagination', 0);
      try {
        var a = this.getData(result);
      } catch (e) {
        alert(e);
        // location.reload();
      }
      if (a) {
        return true
      }
      else {
        return false
      }
    },
    getData(dataQuery) {

      if (~dataQuery.toUpperCase().indexOf("LIST:")) dataQuery = dataQuery.toUpperCase().replace('LIST:', '?amount=' + this.amount + '&offset=' + this.offset + '&attrs=sku,salePrice,image&searchTerm=');
      else if (~dataQuery.toUpperCase().indexOf("PRODUCT:")) dataQuery = dataQuery.toUpperCase().replace('PRODUCT:', '');


      try {
        Vue.set(vue, 'temp', this.requestJson('GET', this.createUrl('products/' + dataQuery)));
      } catch (e) {
        alert(e);
      }
      if ('elements' in this.temp && this.temp.elements.length != 0) {
        if (this.temp.elements.length == 1) {
          this.viewProduct(this.temp.elements[0].attributes[0].value);
        } else {
          this.createPagination(this.temp.elements ,'data');
          this.changePage('list');
        }
      } else if ('sku' in this.temp) {
        Vue.set(vue, 'product', this.temp);
        if (this.product != '') {
          this.viewProduct();
        }
      }
      else {
        return false
      }
      Vue.set(vue, 'temp', {});
      return true
    },
    cheatButton(result, event) {
      this.onDecode(result);
    },
    changePage(value) {
      if (value === 'scan') {
        Vue.set(vue, 'data', []);
        Vue.set(vue, 'product', {});
      }
      Vue.set(vue, 'page', value)
    },
    viewProduct(id) {
      if (id) {
        this.getData(id);
      }
      id = id || this.product.sku;
      Vue.set(vue.product, 'imageLink', this.getImage(id, 'L'))
      this.changePage('product')
    },
    next() {
      if (this.pagination < this.data.length - 1) {
        Vue.set(vue, 'pagination', this.pagination + 1);
      } else if (this.pagination == this.data.length - 1 && this.data[this.pagination].length == this.amount / this.maxPages) {
        Vue.set(vue, 'offset', this.offset + this.amount);
        Vue.set(vue, 'pagination', 0);
        this.getData(this.result);
      }
    },
    prev() {
      if (this.pagination > 0) {
        Vue.set(vue, 'pagination', this.pagination - 1);
      } else if (this.pagination == 0 && this.offset != 0) {
        Vue.set(vue, 'offset', this.offset - this.amount);
        Vue.set(vue, 'pagination', this.maxPages - 1);
        this.getData(this.result);
      }
    },
    getImage(data, index, size) {
      size = size || "S";
      var img = new Image();
      // img.src = "https://demoimages.sellsmart.nl/Sellsmart-B2XDefault-Site/images/" + size + "/" + data + ".jpg";
      img.src = './assets/icon-no-image.png';
      return img.src

    },
    createPagination(content, target) {
      Vue.set(vue, target, []);
      a = [];
      while (content.length > 0)
        a.push(content.splice(0, this.amount / this.maxPages));
      Vue.set(vue, target, a);
    },
    createUrl(dataQuery) {
      // Sellsmart Server
      // return "https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/" + dataQuery;

      // JX Demo Server
      return "http://jxdemoserver.intershop.de/INTERSHOP/rest/WFS/inSPIRED-inTRONICS-Site/-/" + dataQuery;
    },
    setCookie(name, data, minutes) {
      minutes = minutes || 30;
      var date = new Date();
      date.setTime(date.getTime() + (minutes * 60 * 1000));
      document.cookie = name + "=" + data + "; expires=" + date.toGMTString();
    },
    getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
    createBasket() {
      if (!this.getCookie('authentication-token')) {
        a = this.requestJson('POST', this.createUrl('baskets'));
        Vue.set(vue, 'basket', a);
      }
    },
    addToBasket(id, quantity) {
      quantity = quantity || 1
      data = {
        elements: [{
          'sku': id,
          'quantity': {
            'value': quantity
          }
        }]
      }
      a = this.requestJson('POST', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items'), true, data);
      return a;
    },
    getBasket() {
      a = this.requestJson('GET', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items'), true);
      data = a;
      Vue.set(vue, 'basket', data.elements);
      this.changePage('basket');
      return data;
    },
    removeFromBasket(id) {
      console.log(id);
      try {
        a = this.requestJson('DELETE', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items/' + id), true);

      } catch (e) {

      }
      this.getBasket();
      return a;
    }
  },
  filters: {
    limitWords(textToLimit, wordLimit) {
      if (!textToLimit) {
        return "";
      }
      var finalText = "";

      var text2 = textToLimit.replace(/\s+/g, ' ');

      var text3 = text2.split(' ');

      var numberOfWords = text3.length;

      var i = 0;

      if (numberOfWords > wordLimit) {
        for (i = 0; i < wordLimit; i++)
          finalText = finalText + " " + text3[i] + " ";

        return finalText + "...";
      } else return textToLimit;
    }
  }
});
