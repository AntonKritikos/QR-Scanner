// First create a new Vue instance
var vue = new Vue({
  el : "#main_page",
  data : {
    page :"scan",
    data :{},
    offset : 0,
    amount : 5,
    product : {},
    result : ''
  },
  methods : {
    onCapture (event) {
      if (event === null) {
        // no QR-Code dected since last capture
      } else {
        Vue.set(vue, 'data',JSON.parse(this.getJson("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/products/?amount="+this.$data.amount+"&offset="+this.$data.offset+"&attrs=sku&searchTerm="+event.result)));
        Vue.set(vue, 'result', event.result)
        console.log();
        if (this.$data.data.elements.length == 1) {
          this.viewProduct(this.$data.data.elements[0].attributes[0].value);
        }
        else {
          this.changePage('list');
        }
        event.points // array of QR-Code module positions
      }
    },
    getJson (yourUrl){
        var Httpreq = new XMLHttpRequest(); // a new request
        Httpreq.open("GET",yourUrl,false);
        Httpreq.send(null);
        return Httpreq.responseText;
    },
    cheatButton (result,event) {
      console.log(result);
      Vue.set(vue, 'data',JSON.parse(this.getJson("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/products/?amount="+this.$data.amount+"&offset="+this.$data.offset+"&attrs=sku&searchTerm="+result)));
      Vue.set(vue, 'result', result)
      this.changePage('list');
    },
    changePage (value) {
      Vue.set(vue, 'page', value)
    },
    viewProduct (id) {
      Vue.set(vue, 'product',JSON.parse(this.getJson("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/products/"+id)));
      this.changePage('product')
    },
    next (){
      Vue.set(vue, 'offset', this.offset + 5);
      Vue.set(vue, 'data',JSON.parse(this.getJson("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/products/?amount="+this.$data.amount+"&offset="+this.$data.offset+"&attrs=sku&searchTerm="+this.$data.result)));
    },
    prev (){
      Vue.set(vue, 'offset', this.offset - 5);
      Vue.set(vue, 'data',JSON.parse(this.getJson("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XDefault-Site/-/products/?amount="+this.$data.amount+"&offset="+this.$data.offset+"&attrs=sku&searchTerm="+this.$data.result)));
    }
  }
});
