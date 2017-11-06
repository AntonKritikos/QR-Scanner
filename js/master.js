// First create a new Vue instance
var vue = new Vue({
  el : '#main_page',
  data : {
    page :'scan',
    data :'',
    offset : 0,
    amount : 5,
    product : {},
    result : '',
    image : '',
    temp : ''
  },
  methods : {
    onCapture (event) {
      if (event === null) {
        // no QR-Code dected since last capture
      } else {
        this.onDecode(event.result);
        event.points // array of QR-Code module positions
      }
    },
    getJson (yourUrl){
        var Httpreq = new XMLHttpRequest(); // a new request
        Httpreq.open("GET",yourUrl,false);
        Httpreq.send(null);
        return Httpreq.responseText;
    },
    onDecode (result){
      Vue.set(vue, 'offset', 0);
      Vue.set(vue, 'result', result);
      this.getData(this.result);
      try {
        if (this.$data.data.elements.length == 1) {
          this.viewProduct(this.$data.data.elements[0].attributes[0].value);
        }
        else {
          this.changePage('list');
        }
      } catch (e) {
        this.viewProduct();
      }



    },
    getData (dataQuery){
      if (~dataQuery.toUpperCase().indexOf("LIST:")) dataQuery = this.result.toUpperCase().replace('LIST:','?amount='+this.amount+'&offset='+this.offset+'&attrs=sku,salePrice&searchTerm=');
      else if (~dataQuery.toUpperCase().indexOf("PRODUCT:")) dataQuery = this.result.toUpperCase().replace('PRODUCT:','');

      try {
        Vue.set(vue, 'temp', JSON.parse(this.getJson("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/products/"+dataQuery)));
      } catch (e) {
        alert("Er is een fout opgetreden bij het ophalen van data uit de database.");
      }
      try {
        if (this.temp.elements.length != 0) {
          Vue.set(vue, 'data', this.temp)
        }
      } catch (e) {
        Vue.set(vue, 'product', this.temp)
      }
    },
    cheatButton (result,event) {
      this.onDecode(result);
    },
    changePage (value) {
      if (value === 'scan') {
        Vue.set(vue,'data','');
        Vue.set(vue,'product','');
      }
      Vue.set(vue, 'page', value)
    },
    viewProduct (id) {
      if (id) {
        this.getData(id);
      }
      id = id || this.product.sku;
      Vue.set(vue.product, 'imageLink', this.getImage(id,'L'))
      this.changePage('product')
    },
    next (){
      if (this.$data.data.elements.length == 5) {
        Vue.set(vue, 'offset', this.offset + 5);
          this.getData();
      }
    },
    prev (){
      if (this.$data.offset >0) {
        Vue.set(vue, 'offset', this.offset - 5);
        this.getData();
      }
    },
    getImage (data,size){
      size = size || "S"
      return "https://demoimages.sellsmart.nl/Sellsmart-B2XDefault-Site/images/"+size+"/"+data+".jpg";
    }
  },
  filters: {

    limitWords(textToLimit, wordLimit)
    {
    var finalText = "";

    var text2 = textToLimit.replace(/\s+/g, ' ');

    var text3 = text2.split(' ');

    var numberOfWords = text3.length;

    var i=0;

    if(numberOfWords > wordLimit)
    {
    for(i=0; i< wordLimit; i++)
    finalText = finalText+" "+ text3[i]+" ";

    return finalText+"...";
    }
    else return textToLimit;
    }
  }
});
