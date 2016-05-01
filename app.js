'use strict';
const http = require('http');
const _ = require('underscore');
const Bot = require('messenger-bot');
const Messages = require('./api/messages');
const constants = require('./constants').constants;
const serverHandleAction = require('./db/server').handleAction;
const db = require('./db/server');
const ItemFactory = Messages.ItemFactory;
const exampleItem = new ItemFactory({title: "Example", url: "www.google.com", img:"http://img.wcdn.co.il/w/w-635/901148-5.jpg"});
let welcomeMsgId = null;
let genericTemplateId = null;
let msgArray = [];
let bot = new Bot({
    token: 'EAAG75iLWOrEBAN9EuPZACyJank8NNfZAFA0WJ21A52KrgEqQIE6jrXZB4vJXri6LjBZB1YZCNaSuOwUcmgLZBvLKZA1JYBxl4fb6lFZA0cLbZB34h30ESSZBsWOML74OwLE0F5CHOJPzrFZCrhZAZAIYcI66e3MPQZCv93Dmc3uQQmwhXZCeAZDZD',
    verify: 'VERIFY_TOKEN'
});
bot.on('error', (err) => {
    console.log(err.message)
});

bot.on('message', (payload, reply) => {
    bot.getProfile(payload.sender.id, (err, profile) => {
        if (err){
            console.log(err);
        }else{
            if (payload.message.text.trim().indexOf("reset crayze") > -1){
                db.resetUserDeals(profile, (err)=>{
                    if (err){
                        console.log(err)
                    }else{
                        sendFashion(profile, payload, reply);
                    }
                })
            }else if(payload.message.text.trim().indexOf("crayze") > -1){
                db.getUserLastChoice(profile, (err,lastChoice)=> {
                    if (lastChoice === constants.FASHION) {
                        sendFashion(profile, payload, reply);
                    } else {
                        console.log("wierd.");
                    }
                })
            } else{
                reply({ text:" Hey " + profile.first_name + ", Welcome to Crayze!!"}, (err,response) => {
                    if (err){
                        console.log(err);
                    }
                    welcomeMsgId = response.message_id;
                    console.log(`Echoed back to ${profile.first_name} ${profile.last_name} ${profile.gender}`)
                })
            }
        }
    })
});
bot.on('delivery', (payload, reply)=>{
    bot.getProfile(payload.sender.id ,(err, profile)=>{
        if (payload.delivery.mids.indexOf(welcomeMsgId) > -1) {
            reply({attachment: Messages.welcome(profile)})
        }else if(payload.delivery.mids.indexOf(genericTemplateId) > -1){
            reply({text: "Hit crayze for more!"})
        }
    });
});
function isJson(string){
    try{
        JSON.parse(string);
    }catch(e){
        return false;
    }
    return true;
}
function sendFashion(profile, payload, reply){
    db.getFashion(profile,(err, result)=>{
        if (err){
            console.log(err)

        }else{
            if (result.length === 0){
                reply({text: "Oops looks like we ran out of deal at this moment, type reset crayze to check if you missed something!"})
            }else{
                let genericTemplate = new Messages.TemplateFactory();
                result.forEach((item)=>{
                    let itemMsg = Messages.ItemFactory(item.deal, item.deal._id, item.deal.itemCategory);
                    genericTemplate.payload.elements.push(itemMsg);
                    let itemObj = _.clone(itemMsg);
                    itemObj._id = item.deal._id;
                    msgArray.push(itemObj);
                });
                reply({attachment: genericTemplate}, (err, response)=>{
                    if (err) {
                        console.log(err)
                    }else{
                        genericTemplateId = response.message_id;
                    }
                });
                db.setUserLastChoice(constants.FASHION, profile, (err)=>{
                    if (err){
                        console.log(err);
                    }
                });
            }
        }
    })
}
bot.on('postback', (payload, reply)=>{
    bot.getProfile(payload.sender.id, (err, profile)=>{
        if (payload.postback.payload === constants.FASHION){
            if (err){
                console.log(err)
            }else{
                sendFashion(profile, payload, reply);
            }
        }else if(payload.postback.payload === constants.SPORTS){
            reply({text: "get sport"})
        }else if(payload.postback.payload === constants.BOTS){
            reply({text: "What is so interesting about bots?"})
        }else if(payload.postback.payload === constants.LIKE){

        }else if (isJson(payload.postback.payload)){
            let customPostback = JSON.parse(payload.postback.payload);
            serverHandleAction(customPostback, profile, (err,result)=>{
                if (err){
                    console.log("im here");
                    console.log(err)
                }else{

                    reply({text:"We will adapt our deals to your taste!"+  "(DEBUG) result: " + result.cheapGrade  + " " +result.standardGrade +" " + result.dealGrade })
                }
            });

        }
    })
});
//db.addItems(
//    [
//        {
//            realPrice: 75,
//            dealPrice: 35,
//            title: "Chiffon Dress",
//            url: 'http://www2.hm.com/en_gb/productpage.0367721004.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2016/6CT_0038_010R.jpg],width[4147],height[4849],x[650],y[166],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 150,
//            dealPrice: 105,
//            title: "Jacket in a textured weave",
//            url: 'http://www2.hm.com/en_gb/productpage.0333898005.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2016/6IT_0320_002R.jpg],width[3773],height[4412],x[804],y[351],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 100,
//            dealPrice: 50,
//            title: "Wool hat",
//            url: 'http://www2.hm.com/en_gb/productpage.0344365002.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/model/2015/C00%200344365%20002%2070%200527.jpg],type[STILLLIFE_FRONT]&hmver=3&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 65,
//            dealPrice: 25,
//            title: "Jersey top with lace",
//            url: 'http://www2.hm.com/en_gb/productpage.0357997001.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2015/6AU_0145_007R.jpg],width[3828],height[4477],x[770],y[177],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 40,
//            dealPrice: 20,
//            title: "Rib-knit hat",
//            url: 'http://www2.hm.com/en_gb/productpage.0348681001.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/model/2015/B00%200348681%20001%2067%200097.jpg],type[STILLLIFE_FRONT]&hmver=2&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 50,
//            dealPrice: 20,
//            title: "Jersey crop top",
//            url: 'http://www2.hm.com/en_gb/productpage.0365627003.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2015/6AY_0433_019R.jpg],width[3605],height[4215],x[845],y[247],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 200,
//            dealPrice: 100,
//            title: "Shaping Skinny Regular Jeans",
//            url: 'http://www2.hm.com/en_gb/productpage.0301703017.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/model/2015/B00%200301703%20017%2067%202136.jpg],type[STILLLIFE_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 200,
//            dealPrice: 120,
//            title: "Imitation suede coat",
//            url: 'http://www2.hm.com/en_gb/productpage.0368140001.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2016/6DT_0089_009R.jpg],width[3859],height[4513],x[767],y[100],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 40,
//            dealPrice: 20,
//            title: "Jersey top with slits",
//            url: 'http://www2.hm.com/en_gb/productpage.0320476001.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2016/6MT_0285_001R.jpg],width[3605],height[4215],x[791],y[507],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 150,
//            dealPrice: 75,
//            title: "Satin maxi dress",
//            url: 'http://www2.hm.com/en_gb/productpage.0342701003.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2015/5TT_0261_016R.jpg],width[3869],height[4524],x[803],y[601],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 200,
//            dealPrice: 125,
//            title: "Parka",
//            url: 'http://www2.hm.com/en_gb/productpage.0345129003.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2016/6FT_0010_016R.jpg],width[3969],height[4641],x[738],y[363],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 100,
//            dealPrice: 50,
//            title: "Tuxedo trousers",
//            url: 'http://www2.hm.com/en_gb/productpage.0348214003.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2015/5TT_0249_015R.jpg],width[3838],height[4488],x[711],y[592],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 40,
//            dealPrice: 20,
//            title: "Jersey crop top",
//            url: 'http://www2.hm.com/en_gb/productpage.0315076037.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2015/6AY_0078_010R.jpg],width[3507],height[4101],x[856],y[240],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 750,
//            dealPrice: 415,
//            title: "Suede dress",
//            url: 'http://www2.hm.com/en_gb/productpage.0381485001.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2016/6DT_0170_016R.jpg],width[4263],height[4985],x[584],y[97],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 600,
//            dealPrice: 225,
//            title: "Leather and suede boots",
//            url: 'http://www2.hm.com/en_gb/productpage.0345942001.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/model/2015/B00%200345942%20001%2000%200000.jpg],type[STILLLIFE_FRONT]&hmver=0&call=url[file:/product/main]'
//        },
//        {
//            realPrice: 200,
//            dealPrice: 120,
//            title: "Trousers with lacing",
//            url: 'http://www2.hm.com/en_gb/productpage.0359656002.html',
//            img: 'http://lp2.hm.com/hmprod?set=source[/environment/2016/6GT_0342_001R.jpg],width[3806],height[4450],x[642],y[460],type[FASHION_FRONT]&hmver=0&call=url[file:/product/main]'
//        }
//    ]);
http.createServer(bot.middleware()).listen(3000);

//TODO: move all global variables to user object.