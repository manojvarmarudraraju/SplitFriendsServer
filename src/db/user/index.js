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
        var result = await userModel.create({email, password, displayName, groups: []});
        return result;
    } catch(err){
        throw err;
    }
}


async function addGroupUser(group, members){
    try{
        await userModel.updateMany({ "_id": { "$in": members }}, {groups: group});
    } catch(err){
        throw err
    }
}
async function userGroups(user){
    try{
        var val = userModel.findById(user, {groups: 1});
        return val;
    } catch(err){
        throw err;
    }
}

async function removeUserFromGroup(user,group){
    try{
        var val =await userModel.findById(user, {groups: 1});
        val = val.filter((item) => item !== group);
        await userModel.findByIdAndUpdate(user, { groups: val});
    } catch(err){
        throw err;
    }
}

module.exports = { registerUser, loginUser, addGroupUser, userGroups, removeUserFromGroup };