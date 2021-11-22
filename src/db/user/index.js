const jwt = require('jsonwebtoken');
const userModel = require('../schema/user');
const {logger} = require('../../utils/logger');
const path = require('path');
const filepath = `${path.dirname(__filename)}\ ${path.basename(__filename)}`;

async function loginUser(user){
    const { email, password } = user;
    try{
        result = await userModel.findOne({email, password});
        return result;
    } catch(err){
        throw err;
    }  
}

async function registerUser(user){
    console.log(user);
    const { email, password, displayName } = user;
    try{
        var result = await userModel.create({email, password, displayName, grous: []});
        return result;
    } catch(err){
        throw err;
    }
}

module.exports = { registerUser, loginUser};