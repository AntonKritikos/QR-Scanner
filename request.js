function Get(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;
}
var json_obj = JSON.parse(Get("https://test.sellsmart.nl/sellsmart/rest/WFS/Sellsmart-B2XChannel-Site/-/categories/Producten"));
console.log(json_obj);
// /ECO-50/ECO-50200
