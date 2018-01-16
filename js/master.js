var vue = new Vue({

  el: '#app-root',

  data: {
    acceptTermsAndConditions:false,
    altAddress:false,
    amount:25,
    basket: {},
    commonShipToAddress: {
      country:"",
      mainDivision:"",
      title:"",
      type:"Address"
    },
    data:[],
    invoiceToAddress:{
      country:"",
      mainDivision:"",
      title:"",
      type:"Address"
    },
    loading:false,
    maxPages:1,
    offset:0,
    page:"scan",
    pagination:0,
    payMethods:[],
    paymentUri:"",
    product:{},
    result:"",
    selectedPayMethod:"",
    selectedShipMethod:"",
    shippingMethods:{},
    temp:{}
  },

  methods: {

    ////////////////////////////////////////////////////////////////////////////
    // Functions oly to be used while still in development                    //
    ////////////////////////////////////////////////////////////////////////////

    test(result) {
      result = result || 'acer';
      result = "list:" + result
      this.onDecode(result);
      return result
    },

    ////////////////////////////////////////////////////////////////////////////
    // Functions that are only used by the Vue js QR-Scanner                  //
    ////////////////////////////////////////////////////////////////////////////

    onCapture(event) {
      if (event === null) {
      } else {
        this.onDecode(event.result);
      }
    },

    onDecode(result) {
      Vue.set(vue, 'offset', 0);
      result = result.replace(/ +/g, "");
      Vue.set(vue, 'result', result);
      Vue.set(vue, 'data', []);
      Vue.set(vue, 'product', {});
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

    async onInit (promise) {
    // show loading indicator
    this.page = "test1"

      try {
        await promise
        // successfully initialized
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          // user denied camera access permisson
          alert(error.name)
        } else if (error.name === 'NotFoundError') {
          // no suitable camera device installed
          alert(error.name)

        } else if (error.name === 'NotSupportedError') {
          // page is not served over HTTPS (or localhost)
          alert(error.name)

        } else if (error.name === 'NotReadableError') {
          // maybe camera is already in use
          alert(error.name)

        } else if (error.name === 'OverconstrainedError') {
          // passed constraints don't match any camera. Did you requested the front camera although there is none?
          alert(error.name)

        } else {
          // browser is probably lacking features (WebRTC, Canvas)
          alert('error')
        }
      } finally {
        // hide loading indicator
        this.page = "test2"
      }
    },

    ////////////////////////////////////////////////////////////////////////////
    // GET Functions that retrieve data and store it locally                  //
    ////////////////////////////////////////////////////////////////////////////

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
          a = [
            JSON.parse(Httpreq.responseText),
            {'authentication-token':Httpreq.getResponseHeader('authentication-token')}
          ];

        }
      } catch (e) {
        a = Httpreq.responseText;
      } finally {
        return a
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
          this.viewProduct( this.getObjectData(this.getObjectData(this.temp.elements, 'attributes'), 'value'));
        } else {
          Vue.set(vue, 'data', this.data.concat(this.temp.elements));
          this.changePage('list');
        }
      } else if ('sku' in this.temp) {
        Vue.set(vue, 'product', this.temp);
        if (this.product != '') {
          this.viewProduct()
        }
      } else {
        return false
      }
      Vue.set(vue, 'temp', {});
      return true
    },

    viewProduct(id) {
      if (id) {
        this.getData(id);
      }
      id = id || this.product.sku;
      try {
        Vue.set(vue.product, 'imageLink', this.getImage( this.getObjectData(this.product.images, 'L', 'typeID').effectiveUrl, 'L' ))
      } catch (e) {
        Vue.set(vue.product, 'imageLink', this.getImage( this.product.sku, 'L') )
      }
      this.limitWords(this.product.longDescription, 50)
      this.changePage('product')
    },

    getImage(data, size) {
      size = size || "S";
      var img = new Image();
      if (data && data.indexOf('INTERSHOP') == -1) {
        img.src = "https://demoimages.sellsmart.nl/Sellsmart-B2XDefault-Site/images/" + size + "/" + data.match('([0-9A-z]+\-(STK|stk))')[0] + ".jpg";
      }
      else if (data && data.indexOf('INTERSHOP') > -1) {
        img.src = "http://jxdemoserver.intershop.de" + data;
      }
      else {
        img.src = './assets/icon-no-image.png';
      }
      return img.src

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

    getBasketImg(id,index) {
      if (!this.basket[index].image) {
        a = this.requestJson('GET', this.createUrl('products/' + id));
        Vue.set(vue.basket[index],"image",this.getImage(this.getObjectData(a.images, 'S', 'typeID').effectiveUrl));
      }
      return this.basket[index].image
    },

    getShippingMethod(){
      var b = []
      for (var i = 0; i < this.basket.length; i++) {
        a = this.requestJson('OPTIONS', this.createUrl('baskets/' + this.getCookie('basket-id') + '/items/' + this.basket[i].id), true);
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

    getPaymentMethod(){
      a = this.requestJson('GET', this.createUrl('baskets/' + this.getCookie('basket-id') + '/payments'), true);
      if (a.elements.length > 0 && this.getObjectData(a.elements, this.selectedPayMethod, 'title')) {
        return false
      }
      else {
        if (a.elements.length > 0) {
          this.removePaymentMethod(this.getObjectData(a.elements, 'uri'));
        }

        return true
      }
    },

    getPayments() {
      a = this.requestJson('OPTIONS', this.createUrl('baskets/' + this.getCookie('basket-id') + '/payments'), true);
      return this.getObjectData(a.methods, 'payments')
    },

    getOrder(id){
      // Requires user to be logged in so currently does not work
      a = this.requestJson('GET', this.createUrl(id), true);
    },

    listScroll() {
      if (this.page == "list" && (window.innerHeight + document.querySelector('.list_page').scrollTop) >= document.querySelector('.list_page').scrollHeight && vue.data.length == this.amount + this.offset) {

        Vue.set(vue, 'offset', vue.offset + vue.amount);
        Vue.set(vue, 'pagination', 0);
        vue.getData(this.result);
      }
    },

    getObjectData(parent, child, identifier){
      for (var i = 0; i < parent.length; i++) {
        if (identifier && parent[i][identifier] == child) {
          return parent[i]
        }
        else if (child in parent[i]) {
          return parent[i][child]
        }
      }
      return false
    },

    ////////////////////////////////////////////////////////////////////////////
    // SET Functions that change data locally or on the server                //
    ////////////////////////////////////////////////////////////////////////////

    changePage(value) {
      Vue.set(vue, 'page', value)
    },

    createUrl(dataQuery) {
      // Sellsmart Server
      // Should work if test.sellSmart.nl updates to Intershop 7.8+
      // if ( dataQuery.indexOf('Sellsmart-B2XDefault-Site/-/') == -1) dataQuery = 'Sellsmart-B2XDefault-Site/-/' + dataQuery;
      // return "https://test.sellsmart.nl/sellsmart/rest/WFS/" + dataQuery;

      // JX Demo Server
      if ( dataQuery.indexOf('inSPIRED-inTRONICS-Site/-/') == -1) dataQuery = 'inSPIRED-inTRONICS-Site/-/' + dataQuery;
      return "http://jxdemoserver.intershop.de/INTERSHOP/rest/WFS/" + dataQuery;
    },

    setCookie(name, data, minutes) {
      minutes = minutes || 15;
      var date = new Date();
      date.setTime(date.getTime() + (minutes * 60 * 1000));
      document.cookie = name + "=" + data + "; expires=" + date.toGMTString();
    },

    createBasket() {
      if (!this.getCookie('authentication-token')) {
        this.clearAddresses()
        a = this.requestJson('POST', this.createUrl('baskets'));
        this.setCookie('authentication-token', this.getObjectData(a, 'authentication-token'));
        this.setCookie('basket-id', this.getObjectData(a, 'title'));
        Vue.set(vue, 'basket', this.  getObjectData(a, 'title'));
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
        Vue.set(vue.product,'amountInBasket', quantity);
        return true;
      }
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
      this.getBasket();
      for (var i = 0; i < this.basket.length; i++) {
        this.$children[i].counter = this.basket[i].quantity.value;
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
          getOrder(a.uri)
        }

      }
    },

    readMore(){
      if (this.page == 'product') {
        Vue.set(vue.product, 'finalText', this.product.longDescription)
      }
    },

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
          finalText = finalText + " " + text3[i] + " "
        Vue.set(vue.product,'finalText',finalText);
      }
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
      if (this.page == 'product' && this.data.length > 0 || this.page == 'basket' && this.data.length != 0) {
        this.changePage('list');
        return true
      }
      else if (this.page == 'basket' && 'sku' in this.product) {
        this.changePage('product');
        return true
      }
      else {
        this.changePage('scan');
        return true
      }
      return false
    }

  }
});
