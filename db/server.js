'use strict';
let _ = require('underscore');
let mongoose = require('mongoose');
let constants  = require('../constants').constants;
let Schema = require('./models');
const LikePercentage = require('../objects').LikePercentage;
const UnLikePercentage = require('../objects').UnLikePercentage;
mongoose.connect('mongodb://localhost:27017/Shopping');
let User  = mongoose.model('User', Schema.userSchema);
let Company = mongoose.model('Company', Schema.company );
const ITEMS_AMOUNT = 10;
function cutPercentage(actionType, cheapGrade, standardGrade, dealGrade, category) {
    let percentageObj;
    if (actionType === constants.LIKE) {
        percentageObj = new LikePercentage(cheapGrade, standardGrade, dealGrade, category);
        percentageObj.cutPercentage();
    } else if (actionType === constants.UN_LIKE) {
        percentageObj = new UnLikePercentage(cheapGrade, standardGrade, dealGrade, category);
        percentageObj.cutPercentage();
    } else if (actionType === constants.BUY_NOW) {

    }
    return percentageObj;
}

function getUser(user, callback) {
    User.findOne({first_name: user.first_name, last_name: user.last_name}, (err, doc)=> {
        if (err) {
            callback(err)
        } else {
            callback(null, doc)
        }
    });
}
function updatePercentage(user, percentageObj, callback){
    user.cheapGrade = percentageObj.getCheapGrade();
    console.log("im here");
    user.dealGrade = percentageObj.getDealGrade();
    user.standardGrade = percentageObj.getStandardGrade();

    user.save((err)=>{
        if (err){

            callback(err)
        }else{
            callback(null)
        }
    })
}
exports.handleAction = (actionObj, user, callback)=>{

    getUser(user, (err,user)=>{
        console.log(user.first_name + " "+ user.last_name);
        let percentageObj = cutPercentage(actionObj.action, user.cheapGrade, user.standardGrade, user.dealGrade, actionObj.category);
        updatePercentage(user, percentageObj, (err)=>{
            if (err){
                callback(err)
            }else{
                callback(null, {cheapGrade: user.cheapGrade, standardGrade: user.standardGrade, dealGrade: user.dealGrade})
            }
        })

    });

};
function init(){
    Company.findOne({name: "H&M3"}, (err, doc)=>{
        if (err){
            console.log(err)
        }else{
            if (doc === null){
                console.log("Adding H&M3 company");
                let fox = new Company({name: "H&M3", fashion: []});
                fox.save((err)=>{
                    if (err){
                        console.log(err);
                    }else{
                        console.log("Added H&M3");
                    }
                })
            }else{
                console.log("H&M3 already here")
            }
        }
    });
    //User.findOne({first_name: "Zur", last_name:"Tene"}, (err,doc)=>{
    //    if (doc != null){
    //        doc.cheapGrade = 33;
    //        doc.standardGrade = 33;
    //        doc.dealGrade = 33;
    //        doc.save((err)=>{
    //            if (err){
    //                console.log(err)
    //            }else{
    //                console.log("init user success");
    //            }
    //        })
    //    }
    //
    //})
}
exports.handleLike = (category)=>{
  if (category === constants.CHEAP){

  }
};
function handleUser(user,callback){
    User.findOne({first_name: user.first_name, last_name: user.last_name},(err, doc)=>{
        if (err){
            console.log(err)
        }else{
            if (doc === null){
                console.log("adding user");
                let newUser = new User({first_name: user.first_name, last_name: user.last_name,
                                                                    cheapGrade: 33, standardGrade: 33, dealGrade: 33});
                newUser.save((err)=>{
                    if (err){
                        callback(err)
                    }else{
                        callback(null, newUser)
                    }
                })
            }else{
                console.log("user exists.");
                callback(null, doc);
            }
        }
    });
}
function calcDealPercentage(realPrice, dealPrice){
    return 100 - (dealPrice/realPrice) * 100;
}
function handleFashionItem(givenItem, companyName){
    let item = {
        itemCategory: givenItem.category,
        realPrice: givenItem.realPrice,
        dealPrice: givenItem.dealPrice,
        dealPercentage: calcDealPercentage(givenItem.realPrice, givenItem.dealPrice),
        title: givenItem.title,
        url: givenItem.url,
        img: givenItem.img
    };
    Company.findOne({name: companyName}, (err,doc)=>{
        if (err){
            console.log(err);
        }else{
            if (doc === null){
                console.log("ERROR no such company")
            }else{
                if (doc.type.fashion){
                    doc.type.fashion.push(item)
                }else{
                    doc.type.fashion = [item]
                }
                doc.save((err)=>{
                    if (err){
                        console.log(err)
                    }else{
                        console.log("Item saved succesfully " + item.itemCategory +" "+ item.title)
                    }
                })
            }
        }
    })
}
exports.getFashion = function(user, callback){
    handleUser(user, (err, user)=>{
        if (err){
            console.log(err);
        }else{
            let userDeals = [];
            const numberOfCheap = Math.round(user.cheapGrade/ITEMS_AMOUNT) ;
            const numberOfDeal = Math.round(user.dealGrade/ITEMS_AMOUNT) ;
            const numberOfStandard = ITEMS_AMOUNT - numberOfCheap - numberOfDeal;
            console.log("number of deal:" +numberOfDeal);
            console.log("number of cheap:" +numberOfCheap);
            console.log("number of standard:" +numberOfStandard);
            Company.findOne({name: "H&M3"}, (err,doc)=>{
                if (err){
                    console.log(err)
                }else{
                    if (doc === null){
                        console.log("no such company  " + err );
                    }else{
                        let i =0;
                        let j=0;
                        while (i<numberOfCheap && j < doc.type.fashion.length){
                            if (doc.type.fashion[j].itemCategory.indexOf(constants.CHEAP) > -1){
                                userDeals.push({deal: doc.type.fashion[j], order: numberOfCheap});
                                i++;
                            }
                            j++;
                        }
                        i=0;
                        j=0;
                        while (i<numberOfDeal && j < doc.type.fashion.length){
                            if (doc.type.fashion[j].itemCategory.indexOf(constants.DEAL) > -1){
                                userDeals.push({deal: doc.type.fashion[j], order: numberOfDeal});
                                i++;
                            }
                            j++;

                        }
                        i=0;
                        j=0;
                        while(i<numberOfStandard && j < doc.type.fashion.length){
                            if (doc.type.fashion[j].itemCategory.indexOf(constants.DEAL)  == -1 &&
                                        doc.type.fashion[j].itemCategory.indexOf(constants.CHEAP) == -1){
                                userDeals.push({deal: doc.type.fashion[j], order: numberOfStandard});
                                i++;
                            }
                         j++;
                        }
                        userDeals.sort(function(a,b){
                            return (b.order - a.order)
                        });
                        callback(null, userDeals)
                    }
                }
            })
        }
    });
};

exports.addItems = function(items){
  let priceSortItems = items.slice();
  let dealSortItems = items.slice();
  const howMany = Math.floor(items.length * 0.3);

  priceSortItems.sort(function(a,b){
      return (a.dealPrice - b.dealPrice)
  }).splice(howMany);
  dealSortItems.sort(function(a,b){
      return (calcDealPercentage(b.realPrice,b.dealPrice) - calcDealPercentage(a.realPrice,a.dealPrice) )
  }).splice(howMany);
  console.log(priceSortItems);
  console.log(dealSortItems);
  for (let i=0;i<items.length;i++){
      items[i].category = [];
      if (priceSortItems.indexOf(items[i]) > -1){
          items[i].category.push(constants.CHEAP);
      }
      if (dealSortItems.indexOf(items[i]) > -1){
          items[i].category.push(constants.DEAL);
      }
      if (items[i].category.length === 0){
          items[i].category.push(constants.STANDARD);
      }
  }
  for (let i=0;i<items.length;i++){
      handleFashionItem(items[i], "H&M3");
  }
};
init();