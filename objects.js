'use strict';
const constants = require('./constants').constants;
class Percentage{
    constructor(cheapGrade, standardGrade, dealGrade){
        this.cheapGrade = cheapGrade;
        this.standardGrade = standardGrade;
        this.dealGrade = dealGrade;
        this.playCheap = 0;
        this.playStandard = 0;
        this.playDeal = 0;
        this.finalCheap = 0;
        this.finalStandard = 0;
        this.finalDeal = 0;
        this.computedGrades = false;
    }
    getCheapGrade(){
        return this.cheapGrade;
    }
    getStandardGrade(){
        return this.standardGrade;
    }
    getDealGrade(){
        return this.dealGrade;
    }
    cutPercentage(){
        this.cheapGrade = this.cheapGrade - this.playCheap;
        this.standardGrade = this.standardGrade - this.playStandard;
        this.dealGrade = this.dealGrade - this.playDeal;
        this.computedGrades = true;
    }
    calcNewGrades(){
        //Check if we already calculated
        if (this.computedGrades){
            this.cheapGrade = this.cheapGrade + this.finalCheap;
            this.standardGrade = this.standardGrade + this.finalStandard;
            this.dealGrade = this.dealGrade + this.finalDeal;
        }
    }
}
class LikePercentage extends Percentage{
    constructor(cheapGrade, standardGrade, dealGrade, category){
        super(cheapGrade, standardGrade, dealGrade);
        this.category = category;
    }
    cutPercentage(){
        this.playCheap = constants.LIKE_FACTOR * this.cheapGrade;
        this.playDeal = constants.LIKE_FACTOR * this.dealGrade;
        this.playStandard = constants.LIKE_FACTOR * this.standardGrade;
        if (this.category.indexOf(constants.CHEAP) > -1){
            if (this.category.indexOf(constants.DEAL) > -1){
                let standardPart = this.playStandard;
                this.finalCheap = this.playCheap +(standardPart/2);
                this.finalDeal = this.playDeal + (standardPart/2);
                this.finalStandard = this.playStandard - standardPart;
            }else{
                let dealPart = (this.playDeal * constants.LIKE_MOVE_PERCENTAGE);
                let standardPart = this.playStandard * constants.LIKE_MOVE_PERCENTAGE;
                this.finalCheap = this.playCheap + dealPart + standardPart;
                this.finalDeal = this.playDeal - dealPart;
                this.finalStandard = this.playStandard - standardPart;
            }
        } else if(this.category.indexOf(constants.DEAL) > -1){
            let standardPart = (this.playStandard * constants.LIKE_MOVE_PERCENTAGE);
            let cheapPart = this.playCheap * constants.LIKE_MOVE_PERCENTAGE;
            this.finalDeal = this.playDeal + cheapPart + standardPart;
            this.finalStandard = this.playStandard - standardPart;
            this.finalCheap = this.playCheap - cheapPart;
        }else if(this.category.indexOf(constants.STANDARD) > -1){
            let dealPart = (this.playDeal * constants.LIKE_MOVE_PERCENTAGE);
            let cheapPart = this.playCheap * constants.LIKE_MOVE_PERCENTAGE;
            this.finalStandard = this.playCheap + dealPart + cheapPart;
            this.finalDeal = this.playDeal - dealPart;
            this.finalCheap = this.playCheap - cheapPart;
        }

        Percentage.prototype.cutPercentage.call(this); //Call the parent method.
        Percentage.prototype.calcNewGrades.call(this); //Calc the new grades on the parent method.
    }
}
class UnLikePercentage extends Percentage{
    constructor(cheapGrade, standardGrade, dealGrade, category){
        super(cheapGrade, standardGrade, dealGrade);
        this.category = category;
    }
    cutPercentage(){
        this.playCheap = constants.UN_LIKE_FACTOR * this.cheapGrade;
        this.playDeal = constants.UN_LIKE_FACTOR * this.dealGrade;
        this.playStandard = constants.UN_LIKE_FACTOR * this.standardGrade;
        if (this.category.indexOf(constants.CHEAP) > -1){
            let cheapPart = (this.playCheap * constants.UN_LIKE_MOVE_PERCENTAGE);
            this.finalCheap = this.playCheap - cheapPart;
            this.finalDeal = this.playDeal + (cheapPart / 2);
            this.finalStandard = this.playStandard + (cheapPart / 2);
        }else if(this.category.indexOf(constants.STANDARD) > -1){
            let standardPart = (this.playStandard * constants.UN_LIKE_MOVE_PERCENTAGE);
            this.finalStandard = this.playCheap - standardPart;
            this.finalDeal = this.playDeal + (standardPart / 2);
            this.finalCheap = this.playCheap + (standardPart / 2);
        }else if(this.category.indexOf(constants.DEAL) > -1){
            let dealPart = (this.playDeal * constants.UN_LIKE_MOVE_PERCENTAGE);
            this.finalDeal = this.playDeal - dealPart;
            this.finalStandard = this.playCheap + (dealPart / 2);
            this.finalCheap = this.playCheap + (dealPart / 2);
        }
        Percentage.prototype.cutPercentage.call(this); //Call the parent method.
        Percentage.prototype.calcNewGrades.call(this); //Calc the new grades on the parent method.
    }
}
exports.LikePercentage = LikePercentage;
exports.UnLikePercentage = UnLikePercentage;