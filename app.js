'use strict';
const http = require('http');
const _ = require('underscore');
const resize = require('./api/resizeImg').getUrl;
const Bot = require('messenger-bot');
const Messages = require('./api/messages');
const constants = require('./constants').constants;
const serverHandleAction = require('./db/server').handleAction;
const db = require('./db/server');
const ItemFactory = Messages.ItemFactory;
const exampleItem = new ItemFactory({title: "Example", url: "www.google.com", img:"http://img.wcdn.co.il/w/w-635/901148-5.jpg"});
//let welcomeMsgId = null;
//let genericTemplateId = null;
let msgArray = [];
let bot = new Bot({
    token: 'EAAG75iLWOrEBANZB0t5qtJFOOQ1bXPcZC8UCBbEdeZAGZAplrPrTxRFRZCf9CdJZBKRElm5tbMMu7H94sn9Tju5iwPKSFJ4fyknaH4p3RfLBZCKZCgpWolgFix2k03Mocole3jRZBZBPZAYkJoYo9stXIPE2pzsBHK7Ty2sz5ZATh7mFNgZDZD',
    verify: 'VERIFY_TOKEN'
});
bot.on('error', (err) => {
    console.log(err.message)
});

function resetCrayze(profile, reply){
    db.resetUserDeals(profile, (err)=>{
        if (err){
            console.log(err)
        }else{
            sendFashion(profile, reply)
        }
    })
}
bot.on('message', (payload, reply) => {
    bot.getProfile(payload.sender.id, (err, profile) => {
        if (err){
            console.log(err);
        }else{
            reply({ text:" Hey " + profile.first_name + ", Welcome to Crayze, i'm super excited to " +
                                    "show you the best deals online"}, (err,response) => {
                if (err){
                    console.log(err);
                }else{

                    console.log(`Echoed back to ${profile.first_name} ${profile.last_name} ${profile.gender}`);
                    reply({text: "Ready? Here it comes!"}, (err, response)=>{
                        if (err){
                            console.log(err)
                        }else{
                            sendFashion(profile, reply);
                        }
                    })
                }
            })
        }
    })
});
function isJson(string){
    try{
        JSON.parse(string);
    }catch(e){
        return false;
    }
    return true;
}

function sendFashion(profile, reply){
    db.getFashion(profile,(err, result)=>{
        if (err){
            console.log(err)

        }else{
            if (result.length === 0){

                reply({attachment: Messages.finishedCrayze(profile.first_name)})
            }else{
                let genericTemplate = new Messages.TemplateFactory();
                result.forEach((item)=>{
                    let itemMsg = Messages.ItemFactory(item.deal, item.deal._id, item.deal.itemCategory);
                    genericTemplate.addElement(itemMsg);
                });
                reply({attachment: genericTemplate}, (err, response)=>{
                    if (err) {
                        console.log(err)
                    }else{
                        setTimeout(()=>{
                            reply({attachment: Messages.firstChoiceScreen()})
                        }, 2000)
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
                sendFashion(profile, reply);
            }
        }else if(payload.postback.payload === constants.SPORTS){
            reply({text: "get sport"})
        }else if(payload.postback.payload === constants.BOTS){
            reply({text: "What is so interesting about bots?"})
        }else if(payload.postback.payload === constants.LIKE){

        }else if (isJson(payload.postback.payload)){
            let customPostback = JSON.parse(payload.postback.payload);
            if (customPostback.type === constants.ITEM){
                serverHandleAction(customPostback, profile, (err,result)=>{
                    if (err){
                        console.log(err)
                    }else{
                        reply({text:"We will adapt our deals to your taste!"+  "(DEBUG) result: " + result.cheapGrade
                                    + " " +result.standardGrade +" " + result.dealGrade })
                    }
                });
            } else{
                //First Multiple choice screen handle.
                if (customPostback.type === constants.FIRST_CHOICE){
                    if (customPostback.pressed === constants.HIT_ME_MORE){
                        sendFashion(profile, reply);
                    }else if (customPostback.pressed === constants.CATEGORY){
                        reply({attachment: Messages.secondChoiceSCreen()})
                    }
                }else if (customPostback.type === constants.FINISHED_CRAYZE){ //Second Multiple choice screen handle.
                    if (customPostback.pressed === constants.RESET_CRAYZE){
                        resetCrayze(profile, reply);
                    }
                }
            }


        }
    })
});
http.createServer(bot.middleware()).listen(3000);


