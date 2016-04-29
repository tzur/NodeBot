'use strict';
let _ = require('underscore');
let mongoose = require('mongoose');
let constants  = require('../constants').constants;
let Schema = require('./models');
mongoose.connect('mongodb://localhost:27017/Shopping');
let User  = mongoose.model('User', Schema.userSchema);
let Company = mongoose.model('Company', Schema.company );


exports.handleAction = (actionObj)=>{

};
function init(){
    Company.findOne({name: "FOX1"}, (err, doc)=>{
        if (err){
            console.log(err)
        }else{
            if (doc === null){
                console.log("Adding FOX1 company");
                let fox = new Company({name: "FOX1", fashion: []});
                fox.save((err)=>{
                    if (err){
                        console.log(err);
                    }else{
                        console.log("Added FOX1");
                    }
                })
            }else{
                console.log("FOX1 already here")
            }
        }
    })
}

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
    return (dealPrice/realPrice) * 100;
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
    //item.toString = function(){
    //  return ("Item Category: " + this.itemCategory + " percentage: " + this.dealPercentage + " dealPrice: " + this.dealPrice);
    //};
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
                        console.log("Item saved succesfully " + item)
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
            const numberOfCheap = user.cheapGrade/100 *6;
            const numberOfDeal = user.dealGrade/100 * 6;
            const numberOfStandard = 6 - numberOfCheap - numberOfDeal;

            Company.findOne({name: "FOX1"}, (err,doc)=>{
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
                                userDeals.push(doc.type.fashion[j]);
                                i++;
                            }
                            j++;

                        }
                        i=0;
                        j=0;
                        while (i<numberOfDeal && j < doc.type.fashion.length){
                            if (doc.type.fashion[j].itemCategory.indexOf(constants.DEAL) > -1){
                                userDeals.push(doc.type.fashion[j]);
                                i++;
                            }
                            j++;

                        }
                        i=0;
                        j=0;
                        while(i<numberOfStandard && j < doc.type.fashion.length){
                            if (doc.type.fashion[j].itemCategory.indexOf(constants.DEAL)  == -1 &&
                                        doc.type.fashion[j].itemCategory.indexOf(constants.CHEAP) == -1){
                                userDeals.push(doc.type.fashion[j]);
                                i++;
                            }
                         j++;
                        }
                        callback(null, userDeals);
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
      return (calcDealPercentage(a.realPrice,a.dealPrice) - calcDealPercentage(b.realPrice,b.dealPrice))
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
      if (items[i].category === []){
          items[i].category.push(constants.STANDARD);
      }
  }
  for (let i=0;i<items.length;i++){
      handleFashionItem(items[i], "FOX1");
  }
};
init();