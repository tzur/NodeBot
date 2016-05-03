'use strict';
let mongoose = require('mongoose');
let userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    cheapGrade: Number,
    standardGrade: Number,
    dealGrade: Number,
    lastChoice: String,
    welcomeMsgId: String,
    itemsMsgId: String,
    deals: Array
});
let itemSchema = new mongoose.Schema({
    itemCategory: [String],
    realPrice: Number,
    dealPrice: Number,
    dealPercentage: Number,
    title: String,
    url: String,
    img: String
});
let company = new mongoose.Schema({
    name: String,
    type: {
        fashion: [itemSchema],
        sports: [itemSchema],
        bots: [itemSchema]
    }
});
exports.userSchema = userSchema;
exports.itemSchema = itemSchema;
exports.company = company;

