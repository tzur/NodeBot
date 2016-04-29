'use strict';
const http = require('http');
const _ = require('underscore');
const Bot = require('messenger-bot');
const Messages = require('./api/messages');
const constants = require('./constants').constants;
const db = require('./db/server');
const ItemFactory = Messages.ItemFactory;
const exampleItem = new ItemFactory({title: "Example", url: "www.google.com", img:"http://img.wcdn.co.il/w/w-635/901148-5.jpg"});
let welcomeMsgId = null;
let msgArray = [];
let bot = new Bot({
    token: 'CAAG75iLWOrEBADT8JcrFrzjYTyMxzR2bgdVEgy9LXMWGnyMo9yJ7r9hOKjWkbXO9dqf3Sfwg0ZAgqPzrLHoGGW04mSti9hhqWuWbLSDgfejtvWh4AZAwwbyD9PL8CiMbOtgJQcCQH2BqqbSYMdY1V8NDa1rN0VQ2wvTPZAgSPw1r53j9AaGrSR11dRAufvrnbDeZBgZBO1wZDZD',
    verify: 'VERIFY_TOKEN'
});
bot.on('error', (err) => {
    console.log(err.message)
});

bot.on('message', (payload, reply) => {
    let text = payload.message.text;
    let msg = "Ella is amazing!";
    bot.getProfile(payload.sender.id, (err, profile) => {
        if (err) throw err;
        reply({ text:" Hey " + profile.first_name + ", Welcome to Zara Bot!"}, (err,response) => {
            if (err){
                console.log(err);
            }
            welcomeMsgId = response.message_id;
            console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
        })
    })
});
bot.on('delivery', (payload, reply)=>{
    bot.getProfile(payload.sender.id ,(err, profile)=>{
        if (payload.delivery.mids.indexOf(welcomeMsgId) > -1) {
            reply({attachment: Messages.welcome(profile)})
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
function handleAction(customPostback){
    if (customPostback.category === constants.CHEAP){
        if (customPostback.action === constants.LIKE){

        }
    }
}
bot.on('postback', (payload, reply)=>{
    bot.getProfile(payload.sender.id, (err, profile)=>{
        if (payload.postback.payload === constants.FASHION){
            db.getFashion(profile,(err, result)=>{
                if (err){
                    console.log(err)

                }else{
                    let genericTemplate = new Messages.TemplateFactory();
                    result.forEach((item)=>{
                        let itemMsg = Messages.ItemFactory(item, item._id, item.itemCategory);
                        genericTemplate.payload.elements.push(itemMsg);
                        let itemObj = _.clone(itemMsg);
                        itemObj._id = item._id;
                        msgArray.push(itemObj);
                    });
                    reply({attachment: genericTemplate}, (err, response)=>{
                        if (err) {
                            console.log(err)
                        }
                    });
                    console.log("sdfd");
                }
            })
        }else if(payload.postback.payload === constants.SPORTS){
            reply({text: "get sport"})
        }else if(payload.postback.payload === constants.BOTS){
            reply({text: "What is so interesting about bots?"})
        }else if(payload.postback.payload === constants.LIKE){

        }else if (isJson(payload.postback.payload)){
            let customPostback = JSON.parse(payload.postback.payload);
            handleAction(customPostback);
        }
    })
});
//db.addItems(
    //[
    //    {
    //        realPrice: 100,
    //        dealPrice: 50,
    //        title: "Dress1",
    //        url: 'http://img1.promgirl.com/_img/PGPRODUCTS/1401138/1000/burgundy-dress-DQ-8997-a.jpg',
    //        img: 'http://img1.promgirl.com/_img/PGPRODUCTS/1401138/1000/burgundy-dress-DQ-8997-a.jpg'
    //    },
    //    {
    //        realPrice: 200,
    //        dealPrice: 50,
    //        title: "Dress Sale",
    //        url: 'http://img1.promgirl.com/_img/PGPRODUCTS/1401138/1000/burgundy-dress-DQ-8997-a.jpg',
    //        img: 'http://img1.promgirl.com/_img/PGPRODUCTS/1401138/1000/burgundy-dress-DQ-8997-a.jpg'
    //    },
    //    {
    //        realPrice: 100,
    //        dealPrice: 50,
    //        title: "Dress2",
    //        url: 'http://img1.promgirl.com/_img/PGPRODUCTS/1401138/1000/burgundy-dress-DQ-8997-a.jpg',
    //        img: 'http://img1.promgirl.com/_img/PGPRODUCTS/1401138/1000/burgundy-dress-DQ-8997-a.jpg'
    //    },
    //    {
    //        realPrice: 100,
    //        dealPrice: 50,
    //        title: "Dress3",
    //        url: 'http://img1.promgirl.com/_img/PGPRODUCTS/1401138/1000/burgundy-dress-DQ-8997-a.jpg',
    //        img: 'http://img1.promgirl.com/_img/PGPRODUCTS/1401138/1000/burgundy-dress-DQ-8997-a.jpg'
    //    }
    //]);
http.createServer(bot.middleware()).listen(3000);