'use strict';
const constants = require("../constants").constants;
exports.secondChoiceSCreen = ()=>{
    let btnTemplate = new ButtonTemplate("Let's be more specific..");
    btnTemplate.addButton(ButtonFactory("Accessories", constants.ACCESSORIES, constants.SECOND_CHOICE));
    btnTemplate.addButton(ButtonFactory("Dresses", constants.DRESSES, constants.SECOND_CHOICE));
    btnTemplate.addButton(ButtonFactory("Tops", constants.TOPS, constants.SECOND_CHOICE));
    return btnTemplate;
};
exports.firstChoiceScreen = ()=>{
    let btnTemplate = new ButtonTemplate("Having fun?");
    btnTemplate.addButton(ButtonFactory("Hit me more!", constants.HIT_ME_MORE, constants.FIRST_CHOICE));
    btnTemplate.addButton(ButtonFactory("Choose a Category!", constants.CATEGORY, constants.FIRST_CHOICE));
    return btnTemplate;
};
exports.finishedCrayze = (first_name)=>{
    let btnTemplate = new ButtonTemplate(first_name + ", It looks like you scrolled all of our deals!");
    btnTemplate.addButton(ButtonFactory("Well, Again!", constants.RESET_CRAYZE, constants.FINISHED_CRAYZE));
    btnTemplate.addButton(ButtonFactory("What else can you do?", constants.SUPER_POWER, constants.FINISHED_CRAYZE));
    return btnTemplate;
};
exports.crayze = (user) =>{
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
class GenericTemplate{
    constructor(){
        this.type = 'template';
        this.payload = {
            template_type: 'generic',
            elements: [
            ]
        }
    }
    addElement(elementObj){
        this.payload.elements.push(elementObj);
    }
}
exports.TemplateFactory = GenericTemplate;

class ButtonTemplate{
    constructor(mainText){
        this.type = 'template';
        this.payload = {
            template_type: 'button',
            text: mainText,
            buttons: [
            ]
        }
    }
    addButton(buttonObj){
        this.payload.buttons.push(buttonObj);
    }
}
let ButtonFactory = (btnTitle, btnPayload, btnScreen)=>{
    let payloadCreator = (btnPayload)=>{
        return JSON.stringify({
            type: btnScreen,
            pressed: btnPayload
        })
    };
    return {
        type: "postback",
        title: btnTitle,
        payload: payloadCreator(btnPayload)
    }
};


exports.ItemFactory = function(item, mid, itemCategory){
    let payloadCreator = (action)=>{
        return JSON.stringify({
            type: constants.ITEM,
            mid: mid,
            action: action,
            title: item.title,
            category: itemCategory
        })
    };
    return    {
        title: item.title +" " + " - " + item.dealPrice + "$ ",
        subtitle:  + item.dealPercentage + "%" + " discount!",
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
                title: 'More of those!',
                payload: payloadCreator(constants.LIKE)
            },
            {
                type: "postback",
                title: "Nah...",
                payload: payloadCreator(constants.UN_LIKE)
            }
        ]
    }


};