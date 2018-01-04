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
    altAddress:false,
    acceptTermsAndConditions:false,
    shippingMethods:[],
    selectedShipMethod:'',
    payMethods:[],
    selectedPayMethod:'',
    paymentUri:''
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
      result = result.replace(/ +/g, "");
      Vue.set(vue, 'result', result);
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

    test(result) {
      this.onDecode("list:"+result);
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
      if ( dataQuery.indexOf('inSPIRED-inTRONICS-Site/-/') == -1) {
        dataQuery = 'inSPIRED-inTRONICS-Site/-/' + dataQuery
      }
      return "http://jxdemoserver.intershop.de/INTERSHOP/rest/WFS/" + dataQuery;
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
        this.clearAddresses()
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
      else {
        return true
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
      a = this.getBasketItems();
      if (a) {
        if (this.basket.length > 0) {
          a = this.getAllBasketData();
          Vue.set(vue.basket, "totalPrice", a.totals.basketTotal.value);
          if ('invoiceToAddress' in a) {
            Vue.set(vue, "invoiceToAddress", a.invoiceToAddress);
          }
          return true
        }
      }
    },

    getAllBasketData() {
      a = this.requestJson('GET', this.createUrl('baskets/' + this.getCookie('basket-id')), true);
      return a
    },

    getBasketItems() {
      a = this.createBasket();
      if (a) {
        a = this.requestJson('GET', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items'), true);
        if ('elements' in a) {
          Vue.set(vue, 'basket', a.elements);
          this.changePage('basket');
        }
        return true;
      }
      return false
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
      if (typeof a !== 'string' || !a instanceof String || a.indexOf("DuplicateAddress") !== -1) {
        this.changePage('shipAddress');
      }
      else {
        alert(a)
      }

      return true
    },

    clearAddresses(){
      this.invoiceToAddress = {
        type : "Address",
        mainDivision : "",
        title : "",
        country : ""
      }
      this.commonShipToAddress = {
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
        b = this.getShippingMethod()
        Vue.set(vue, 'shippingMethods', b);
        this.changePage('shipSelect');
      }
      else {
        alert(a)
      }

      return true
    },

    setShippingMethod(){
      data = {
        "shippingMethod":{
          id:this.selectedShipMethod
        }
      }
      for (var i = 0; i < this.basket.length; i++) {
        a = this.requestJson('PUT', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items/' + this.basket[i].id), true, data);
      }

      if (typeof a !== 'string' || !a instanceof String || a.indexOf("DuplicateAddress") !== -1) {
        b = this.getPayments();
        Vue.set(vue, 'payMethods', b);
        this.changePage('paySelect');
      }
      else {
        alert(a)
      }

    },

    getShippingMethod(){
      var b = []
      for (var i = 0; i < this.basket.length; i++) {
        a = this.requestJson('OPTIONS', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items/' + this.basket[i].id), true);
        // console.log(a.eligibleShippingMethods.shippingMethods);
        for (var j = 0; j < a.eligibleShippingMethods.shippingMethods.length; j++) {
          for (var k = 0; k < b.length; k++) {
            if (b[k].id != a.eligibleShippingMethods.shippingMethods[j].id) {
              b.push(a.eligibleShippingMethods.shippingMethods[j]);
            }
          }
          if (b.length == 0) {
            b.push(a.eligibleShippingMethods.shippingMethods[j]);
          }
        }
      }
      return b
    },

    setPaymentMethod(){
      a = this.getPaymentMethod();
      if (a) {
        data = {
          "name": this.selectedPayMethod,
          "type": "Payment"
        };
        b = this.requestJson('POST', this.createUrl('baskets/' + this.getCookie('basket-id') + '/payments'), true, data);
        if (typeof a !== 'string' || !a instanceof String || a.indexOf("DuplicateAddress") !== -1) {
          this.changePage('order');
        }
        else {
          alert(b)
        }
      }
      else {
        this.changePage('order');
      }
    },

    getPaymentMethod(){
      a = this.requestJson('GET', this.createUrl('baskets/' + this.getCookie('basket-id') + '/payments'), true);
      if (a.elements.length > 0 && a.elements[0].titel == this.selectedPayMethod) {
        return false
      }
      else {
        if (a.elements.length > 0) {
          this.removePaymentMethod(a.elements[0].uri);
        }

        return true
      }
    },

    getPayments() {
      a = this.requestJson('OPTIONS', this.createUrl('baskets/' + this.getCookie('basket-id') + '/payments'), true);
      return a.methods[0].payments
    },

    removePaymentMethod(uri){
      this.requestJson('DELETE', this.createUrl(uri), true);
    },

    setOrder(){
      if (this.acceptTermsAndConditions == true) {
        data = {
          "basketID": this.getCookie('basket-id'),
          "acceptTermsAndConditions": "true"
        };
        a = this.requestJson('POST', this.createUrl('orders/'), true, data);
        if (typeof a !== 'string' || !a instanceof String || a.indexOf("DuplicateAddress") !== -1) {
          this.deleteAllCookies()
          this.changePage('thankYou');
        }

      }
    },

    getOrder(){
      a = this.requestJson('GET', this.createUrl('orders/' + "NMQKAE0kZpUAAAFg2rFOw7tV"), true);
    },

    deleteAllCookies() {
      var cookies = document.cookie.split(";");

      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    },

    pageBack() {
      if (this.page == "terms") {
        this.changePage('order');
        return true
      }
      else if (this.page == "order") {
        this.changePage('paySelect');
        return true
      }
      else if (this.page == 'paySelect') {
        this.changePage('shipSelect');
        return true
      }
      else if (this.page == "shipSelect") {
        this.changePage('shipAddress');
        return true
      }
      else if (this.page == 'shipAddress') {
        this.changePage('invoiceAddress');
        return true
      }
      else if (this.page == 'invoiceAddress') {
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
