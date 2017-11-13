// First create a new Vue instance
var vue = new Vue({
  el : '#main_page',
  data : {
    page : 'scan',
    data : [],
    offset : 0,
    amount : 25,
    product : {},
    result : '',
    image : '',
    temp : {},
    pagination: 0,
    maxPages : 5
  },
  methods : {
    onCapture(event) {
      if (event === null) {
        // no QR-Code dected since last capture
      } else {
        this.onDecode(event.result);
        event.points // array of QR-Code module positions
      }
    },
    getJson(yourUrl) {
      var Httpreq = new XMLHttpRequest(); // a new request
      Httpreq.open("GET", yourUrl, false);
      Httpreq.send(null);
      return Httpreq.responseText;
    },
    onDecode(result) {
      Vue.set(vue, 'offset', 0);
      Vue.set(vue, 'result', result);
      Vue.set(vue, 'pagination', 0);
      try {
        a = this.getData(result);
      } catch (e) {
        alert('Something went wrong ');
        location.reload();
      }
      if (a == 'list') {
        if (this.data[this.pagination].length == 1) {
          this.viewProduct(this.data[this.pagination].attributes[0].value);
        } else {
          this.changePage('list');
        }
      }
      else if (a == 'product') {
        if (this.product != '') {
          this.viewProduct();

        }
      }
      return true
    },
    getData(dataQuery) {

      if (~dataQuery.toUpperCase().indexOf("LIST:")) dataQuery = dataQuery.toUpperCase().replace('LIST:', '?amount=' + this.amount + '&offset=' + this.offset + '&attrs=sku,salePrice,image&searchTerm=');
      else if (~dataQuery.toUpperCase().indexOf("PRODUCT:")) dataQuery = dataQuery.toUpperCase().replace('PRODUCT:', '');


      try {
        // Sellsmart Server
        // Vue.set(vue, 'temp', JSON.parse(this.getJson("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/products/" + dataQuery)));

        // JX Demo Server
        Vue.set(vue, 'temp', JSON.parse(this.getJson("http://jxdemoserver.intershop.de/INTERSHOP/rest/WFS/inSPIRED-inTRONICS-Site/-/products/" + dataQuery)));
      } catch (e) {
        alert("Er is een fout opgetreden bij het ophalen van data uit de database.");
      }
      if ('elements' in this.temp && this.temp.elements.length != 0) {
        this.createPagination();
        return 'list'
      }
      else if ('attributes' in this.temp) {
        Vue.set(vue, 'product', this.temp);
        return 'product'
      }
      // Vue.set(vue, 'temp', {});
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
      }
      else if (this.pagination == this.data.length - 1 && this.data[this.pagination].length == this.amount / this.maxPages) {
        Vue.set(vue, 'offset', this.offset + this.amount);
        Vue.set(vue, 'pagination', 0);
        this.getData(this.result);
      }
    },
    prev() {
      if (this.pagination > 0) {
        Vue.set(vue, 'pagination', this.pagination - 1);
      }
      else if (this.pagination == 0 && this.offset != 0) {
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
    createPagination() {
      Vue.set(vue, 'data', []);
      while (this.temp.elements.length > 0)
        this.data.push(this.temp.elements.splice(0, this.amount / this.maxPages));
    }

  },
  filters : {
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
