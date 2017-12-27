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
    loading: false,
    invoiceToAddress:{
      type : "Address",
      mainDivision : "",
      title : "",
      country : ""
    },
    commonShipToAddress:{
      type : "Address",
      mainDivision : "",
      title : "",
      country : ""
    },
    selected:"",
    update:"",
    altAddress:false
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
        if (reqAuth) {
          Httpreq.setRequestHeader('authentication-token', this.getCookie('authentication-token'));
        }
        Httpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        Httpreq.send(JSON.stringify(data));
      } catch (e) {
        console.log(e);
      }
      try {
        if (!Url.endsWith("baskets")) {
          a = JSON.parse(Httpreq.responseText);
        }
        else {
          a = [Httpreq.responseText,Httpreq.getResponseHeader('authentication-token')];

        }
      } catch (e) {
        a = Httpreq.responseText;
      } finally {
        return a
      }

    },
    async onInit(promise) {
      // show loading indicator
      this.loading = true;
      try {
        await promise

        // successfully initialized
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          // user denied camera access permisson
        } else if (error.name === 'NotFoundError') {
          // no suitable camera device installed
        } else if (error.name === 'NotSupportedError') {
          // page is not served over HTTPS (or localhost)
        } else if (error.name === 'NotReadableError') {
          // maybe camera is already in use
        } else {
          // browser is probably lacking features (WebRTC, Canvas)
        }
      } finally {
        this.loading = true;

      }
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
        if (this.temp.elements.length == 1 && this.data.length == 0 ) {
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
      Vue.set(vue, 'data', this.data.concat(content));
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
        this.setCookie('authentication-token', a[1]);
        this.setCookie('basket-id', (JSON.parse(a[0])).title);
        Vue.set(vue, 'basket', JSON.parse(a[0]));
        if (!this.getCookie('authentication-token')) {
          alert("You are blocking cookies");
        }
        else {
          return a
        }
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
      this.getBasketItems();
      if (this.basket.length > 0) {
        this.getBasketValue();
        return true
      }
    },

    getBasketValue() {
      a = this.requestJson('GET', this.createUrl('baskets/' + this.getCookie('basket-id')), true);
      Vue.set(vue.basket, "totalPrice", a.totals.basketTotal.value);
      return a
    },

    getBasketItems() {
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
        Vue.set(vue.basket[index].quantity, 'value', quantity);
        if (this.update) {
          clearTimeout(this.update);
          this.update = null;
        }
        this.update = setTimeout("vue.updateBasket()", 1000);

        return true;
      }
    },

    updateBasket(){
      for (var i = 0; i < this.basket.length; i++) {
        data = {
          'quantity': {
            'value': this.basket[i].quantity.value
          }
        }
        a = this.requestJson('PUT', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items/' + this.basket[i].id), true, data);
      }
      this.getBasketItems();
      for (var i = 0; i < this.basket.length; i++) {
        this.$children[0].counter = this.basket[0].quantity.value;
      }
      this.getBasketValue();
    },

    removeFromBasket(id) {
      try {
        a = this.requestJson('DELETE', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items/' + id), true);

      } catch (e) {

      }
      this.getBasket();
      return a;
    },

    getBasketImg(id,index) {
      if (!this.basket[index].image) {
        a = this.requestJson('GET', this.createUrl('products/' + id));
        // console.log(a.images[1].effectiveUrl);
        Vue.set(vue.basket[index],"image",this.getImage(a.images[1].effectiveUrl));
      }
      return this.basket[index].image
    },

    getBasketOptions() {
      return this.requestJson('OPTIONS', this.createUrl('baskets/' + this.getCookie('basket-id')), true)
    },

    setInvoiceAddress(){
      Vue.set(vue.invoiceToAddress,"countryCode","NL");
      data = {
        invoiceToAddress:this.invoiceToAddress
      };
      a = this.requestJson('PUT', this.createUrl('baskets/' + this.getCookie('basket-id')), true, data);
      console.log(a);
      if (typeof a !== 'string' || !a instanceof String || a.indexOf("DuplicateAddress") !== -1) {
        this.changePage('shipping');
      }
      else {
        alert(a)
      }

      return true
    },

    clearInvoice(){
      this.invoiceToAddress = {
        type : "Address",
        mainDivision : "",
        title : "",
        country : ""
      }
    },

    setShippingAddress(){
      if (!this.altAddress) {
        Vue.set(vue,'commonShipToAddress',{
          "title" : this.invoiceToAddress.title,
          "firstName" : this.invoiceToAddress.firstName,
          "lastName" : this.invoiceToAddress.lastName,
          "postalCode" : this.invoiceToAddress.postalCode,
          "email" : this.invoiceToAddress.email,
          "addressLine1" : this.invoiceToAddress.addressLine1,
          "mainDivision" : this.invoiceToAddress.mainDivision,
          "country" : this.invoiceToAddress.country,
          "countryCode" : this.invoiceToAddress.countryCode,
          "city" : this.invoiceToAddress.city
        });
      }
      else if (this.altAddress) {
        Vue.set(vue.commonShipToAddress,"countryCode",this.invoiceToAddress.countryCode);
        Vue.set(vue.commonShipToAddress,"mainDivision",this.invoiceToAddress.mainDivision);
      }
      data = {
        commonShipToAddress:this.commonShipToAddress
      };
      a = this.requestJson('PUT', this.createUrl('baskets/' + this.getCookie('basket-id')), true, data);
      console.log(a);
      if (typeof a !== 'string' || !a instanceof String || a.indexOf("DuplicateAddress") !== -1) {
        this.changePage('order');
      }
      else {
        alert(a)
      }

      return true
    },

    getPayments() {
      return this.requestJson('OPTIONS', this.createUrl('baskets/' + this.getCookie('basket-id') + '/payments'), true)
    },

    pageBack() {
      if (this.page == 'shipping') {
        this.changePage('invoice');
        return true
      }
      else if (this.page == 'invoice') {
        this.changePage('basket');
        return true
      }
      if (this.page == 'product' && this.data.length >= 0 || this.page == 'basket' && this.data.length != 0) {
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
      if (this.page == "list" && (window.innerHeight + document.querySelector('.list_page').scrollTop) >= document.querySelector('.list_page').scrollHeight && vue.data.length == this.amount + this.offset) {
        console.log(1);

        Vue.set(vue, 'offset', vue.offset + vue.amount);
        Vue.set(vue, 'pagination', 0);
        vue.getData(this.result);
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
  },
  watch: {

  }
});
// vue.use(VueQrcodeReader);
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
