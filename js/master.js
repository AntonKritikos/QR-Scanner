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
    maxPages: 1,
    basket: {},
    loading: false
  },

  methods: {

    onCapture(event) {
      if (event === null) {

      } else {
        this.onDecode(event.result);
      }
    },

    requestJson(type, Url, reqAuth, data) {
      reqAuth = reqAuth || false;
      data = data || null
      var Httpreq = new XMLHttpRequest();
      try {
        Httpreq.open(type, Url, false);
      } catch (e) {
        console.log(e);
      }
      if (reqAuth) {
        Httpreq.setRequestHeader('authentication-token', this.getCookie('authentication-token'));
      }
      Httpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      Httpreq.send(JSON.stringify(data));

      if (this.getCookie() || type != 'POST') {
        a = JSON.parse(Httpreq.responseText);

      }
      else {
        a = Httpreq;
      }
      return a
    },

    onDecode(result) {
      Vue.set(vue, 'offset', 0);
      Vue.set(vue, 'result', result);
      Vue.set(vue, 'pagination', 0);
      try {
        var a = this.getData(result);
      } catch (e) {
        alert(e);
      }
      if (a) {
        return true
      } else {
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
          this.addToList(this.temp.elements);
          this.changePage('list');
        }
      } else if ('sku' in this.temp) {
        Vue.set(vue, 'product', this.temp);
        if (this.product != '') {
        }
      } else {
        return false
      }
      Vue.set(vue, 'temp', {});
      return true
    },

    cheatButton(result) {
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
      Vue.set(vue.product, 'imageLink', this.getImage(this.product.images[1].effectiveUrl, 'L'))
      this.changePage('product')
    },

    getImage(data, index, size) {
      size = size || "S";
      var img = new Image();
      // img.src = "https://demoimages.sellsmart.nl/Sellsmart-B2XDefault-Site/images/" + size + "/" + data + ".jpg";
      img.src = "http://jxdemoserver.intershop.de" + data;
      // img.src = './assets/icon-no-image.png';
      return img.src

    },

    addToList(content) {
      Vue.set(vue, target, this.data.concat(content));
    },

    createUrl(dataQuery) {
      // Sellsmart Server
      // return "https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/" + dataQuery;

      // JX Demo Server
      return "http://jxdemoserver.intershop.de/INTERSHOP/rest/WFS/inSPIRED-inTRONICS-Site/-/" + dataQuery;
    },

    setCookie(name, data, minutes) {
      minutes = minutes || 15;
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
        this.setCookie('authentication-token', a.getResponseHeader('authentication-token'));
        this.setCookie('basket-id', (JSON.parse(a.responseText)).title);
        Vue.set(vue, 'basket', JSON.parse(a.responseText));
        return a
      }
      return false
    },

    addToBasket(id, quantity) {
      if (quantity != 0) {
        this.createBasket();
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
        return true;
      }
    },

    getBasket() {
      this.createBasket();
      a = this.requestJson('GET', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items'), true);
      if ('elements' in a) {
        Vue.set(vue, 'basket', a.elements);
        this.changePage('basket');
      }

      return true;
    },

    changeBasketItem(id, quantity, index) {
      if (quantity <= 0) {
        this.removeFromBasket(id);
        return false;
      }
      else {
        data = {
          'quantity': {
            'value': quantity
          }
        }
        Vue.set(vue.basket[index].quantity, 'value', quantity);
        a = this.requestJson('PUT', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items/' + id), true, data);
        return true;
      }
    },

    removeFromBasket(id) {
      try {
        a = this.requestJson('DELETE', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items/' + id), true);

      } catch (e) {

      }
      this.getBasket();
      return a;
    },

    getBasketOptions() {
      return this.requestJson('OPTIONS', this.createUrl('baskets/' + this.getCookie('basket-id')), true)
    },

    getPayments() {
      return this.requestJson('OPTIONS', this.createUrl('baskets/' + this.getCookie('basket-id') + '/payments'), true)
    },

    pageBack() {
      if (this.page == 'product' && this.data.length != 0 || this.page == 'basket' && this.data.length != 0) {
        this.changePage('list');
        return true
      }
      else if (this.page == 'basket' && isEmpty(this.product) != true) {
        this.changePage('product');
        return true
      }
      else {
        this.changePage('scan');
        return true
      }
      return false
    },
    
    listScroll() {
      if (vue.page == "list" && (window.innerHeight + document.querySelector('.list_page').scrollTop) >= document.querySelector('.list_page').scrollHeight && vue.data.length == vue.amount + vue.offset) {
        console.log(1);
        Vue.set(vue, 'offset', vue.offset + vue.amount);
        Vue.set(vue, 'pagination', 0);
        vue.getData(vue.result);
      }
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
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
