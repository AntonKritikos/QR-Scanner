// First create a new Vue instance
var vue = new Vue({
  el : "#main_page",
  data : {
    page :"scan",
    data :{},
    offset : 0,
    amount : 5,
    product : {},
    result : '',
    image : ''
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
    onDecode(result){
      Vue.set(vue, 'offset', 0);
      try {
        Vue.set(vue, 'data',JSON.parse(this.getJson("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/products/?amount="+this.$data.amount+"&offset="+this.$data.offset+"&attrs=sku,salePrice&searchTerm="+result)));
        Vue.set(vue, 'result', result)
        if (this.$data.data.elements.length == 1) {
          this.viewProduct(this.$data.data.elements[0].attributes[0].value);
        }
        else {
          this.changePage('list');
        }
      } catch (e) {
        alert("Hij niet doet");
      }
    },
    cheatButton (result,event) {
      this.onDecode(result);
    },
    changePage (value) {
      Vue.set(vue, 'page', value)
    },
    viewProduct (id) {
      Vue.set(vue, 'product',JSON.parse(this.getJson("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/products/"+id)));
      Vue.set(vue.product, 'imageLink', this.getImage(id))
      this.changePage('product')
    },
    next (){
      Vue.set(vue, 'offset', this.offset + 5);
      Vue.set(vue, 'data',JSON.parse(this.getJson("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/products/?amount="+this.$data.amount+"&offset="+this.$data.offset+"&attrs=sku&searchTerm="+this.$data.result)));
    },
    prev (){
      if (this.$data.offset >0) {
        Vue.set(vue, 'offset', this.offset - 5);
        Vue.set(vue, 'data',JSON.parse(this.getJson("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/products/?amount="+this.$data.amount+"&offset="+this.$data.offset+"&attrs=sku&searchTerm="+this.$data.result)));
      }
    },
    getImage (data){
      return "https://demoimages.sellsmart.nl/Sellsmart-B2XDefault-Site/images/L/"+data+".jpg";
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
