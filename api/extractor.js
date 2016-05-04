'use strict';
let http = require('http');
let data = "";
let products = [];
function parseImg(article){
    article = article.substring(article.indexOf("src"), article.indexOf("data-altimage"));
    return (article.substring(article.indexOf('"') + 1, article.lastIndexOf('"')));
}
function parseTitleAndUrl(article){
    article = article.substring(article.indexOf('<h3 class="product-item-headline">'), article.indexOf("</h3>"));
    article = article.substring(article.indexOf('<a href='));
    let url = article.substring(article.indexOf('"')+1, article.indexOf(">")-1);
    let title = article.substring(article.indexOf(">")+ 1, article.lastIndexOf("<"));
    return {url: url, title: title}
}
function parsePrice(article){
    article = article.substring(article.indexOf("product-item-price-discount"),article.indexOf("</small>"));
    let discountPrice = article.substring(article.indexOf(">") + 1, article.indexOf("<small>")).trim().replace(/\r?\n|\r/g,"");
    article = article.substring(article.indexOf("<small>"));
    let realPrice = article.substring(article.indexOf(">")+1);
    return {realPrice: realPrice, discountPrice: discountPrice}
}
class Product{
    constructor(title, url, realPrice, discountPrice, img){
        this.title = title;
        this.url = "http://www2.hm.com"+url;
        this.realPrice = realPrice;
        this.dealPrice = discountPrice;
        this.img = "http:"+img;
        this.translatePrices();
    }
    toString(){
        console.log("Title: " + this.title, " Url: " + this.url + " Real Price: "
            + this.realPrice + " discPrice: " + this.dealPrice+ " Img: " + this.img + " Deal percentage: " + this.dealPercentage);
    }
    translatePrices(){
        this.realPrice = Math.round(Number.parseFloat(this.realPrice.substring(1))*5);
        this.dealPrice = Math.round(Number.parseFloat(this.dealPrice.substring(1))*5);
        this.dealPercentage = Math.round(this.calcDealPercentage(this.realPrice, this.dealPrice));
    }
    calcDealPercentage(realPrice, dealPrice){
        return 100 - (dealPrice/realPrice) * 100;
    }
}
function parseData(data, cb){
    let imgSrc, title, url, realPrice, discountPrice;
    while (data.indexOf("<!-- Product item -->" )> -1){
        data = data.substring(data.indexOf("<!-- Product item -->" ));
        imgSrc = parseImg(data.substring(0, data.indexOf("<!-- /Product item -->")));
        let titleUrlObj = parseTitleAndUrl(data.substring(0, data.indexOf("<!-- /Product item -->")));
        title = titleUrlObj.title;
        url = titleUrlObj.url;
        let priceObj = parsePrice(data.substring(0, data.indexOf("<!-- /Product item -->")));
        realPrice = priceObj.realPrice;
        discountPrice = priceObj.discountPrice;
        let product = new Product(title, url, realPrice, discountPrice, imgSrc);
        products.push(product);
        data = data.substring(data.indexOf("<!-- /Product item -->"));
    }
    console.log(products);
    console.log(products.length);
    cb(null, products);

}
exports.getItems = (cb)=> {
    http.get({
        hostname: 'www2.hm.com',
        path: '/en_gb/sale/ladies/viewall.html?product-type=ladies_all&sort=stock&offset=0&page-size=300',
        port: 80
    }, (res)=> {
        res.setEncoding('utf8');
        res.on('data', (chunk)=> {
            data += chunk;
        });
        res.on('end', ()=> {
            parseData(data.toString(), cb);
        });
    });
};

