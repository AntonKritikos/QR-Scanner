# QR reader webshop with Vue.js and Intershop REST API

## Introduction:
This is a QR-Reader making use of Vue.js and of the Intershop REST API that is on any Intershop product.
*Current support only for Intershop versions 7.8+*

## Setup:
Setting the QR reader up on a localhost server requires you to download or clone the repository, starting your localhost server and finally connect with you localhost and directing your browser to the correct file via the URL.
*example URL 'localhost/mysite/QR-Scanner/index.html'*
*If the camera does not work you might need to allow this in your browser's settings or to disable the camera on any other browser and/or application*

## Usage:
After you have locally set up the web-application you should be able to use your camera to scan QR-codes, the QR-codes to use have a simple structure to the to simplify the decoding and to lessen the load on the device and to lessen data usage.
*To be sure the camera is supported it is best to connect to either localhost or an Https server*

The structure to be used for a QR-code is to put 'list:' in front of a string, such as 'tape', for having a list page with multiple products sharing a 'search term', depending on how the back office is set up the string can be anything from name of the product to certain tags, if the search comes out with 1 product it turns that search into a product search, in order to search for a single product is to use 'product:' followed by the product's Id, for example '000001', this will always come back with a single product as a result.
*Using a 'product:' search is more reliable than using a 'list:' search, even if that search is guaranteed to come back with a single result*
