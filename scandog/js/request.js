function Get(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;
}
var json_obj = JSON.parse(Get("https://jxdemoserver.intershop.de/INTERSHOP/rest/WFS/inSPIRED-inTRONICS_Business-Site/-/products"));
console.log(json_obj);
// /ECO-50/ECO-50200
