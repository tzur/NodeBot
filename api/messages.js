'use strict';
const constants = require("../constants").constants;
exports.welcome = function(user) {
    return {
        type:'template',
        payload: {
        template_type: 'generic',
            elements: [
            {
                title: user.first_name + ', Please select a category:',
                buttons: [
                    {
                        type: "postback",
                        title: 'Fashion',
                        payload: constants.FASHION
                    },
                    {
                        type: "postback",
                        title: 'Sports',
                        payload: constants.SPORTS
                    },
                    {
                        type: "postback",
                        title: "Bots",
                        payload: constants.BOTS
                    }
                ]
            }
        ]}
    }
};
exports.TemplateFactory = function(){
    this.type = 'template';
    this.payload = {
        template_type: 'generic',
        elements: [
        ]
    }
};
exports.ItemFactory = function(item, mid, itemCategory){
    let payloadCreator = (action)=>{
        return JSON.stringify({
            mid: mid,
            action: action,
            title: item.title,
            category: itemCategory
        })
    };
    return    {
        title: item.title,
        subtitle: "--" + item.realPrice + " "+ item.dealPrice + " " + item.dealPercentage,
        item_url: item.url,
        image_url: item.img,
        buttons: [
            {
                type: "web_url",
                title: 'Buy Now',
                url: item.url
            },
            {
                type: "postback",
                title: 'Like that deal!',
                payload: payloadCreator(constants.LIKE)
            },
            {
                type: "postback",
                title: "Not my type of deal",
                payload: payloadCreator(constants.UN_LIKE)
            }
        ]
    }


};