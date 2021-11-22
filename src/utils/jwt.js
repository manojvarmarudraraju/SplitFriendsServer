const jwt = require('jsonwebtoken');

var SECRET_KEY = '8483A1CB5F6F9E137FD8186385D69';

function createJWT(user){
    try{
        var token = jwt.sign({user}, SECRET_KEY, { expiresIn: '200h'});
        return token;
    } catch(err) {
        throw err;
    }
}

const verifyJWT = (req,res) => {
    if(!req.headers.authorization) {
        throw new Error('No token included');
    }
    // var errFinal = null;
    // jwt.verify(token,SECRET_KEY,(err, data) => {
    //     if(err){
    //         errFinal = err;
    //     } else{
    //         req.body.user = data;
    //     }
    // });
    // if(errFinal){
    //     throw errFinal;
    // }

    try{
        var data = jwt.verify(token, SECRET_KEY);
        req.body.user = data;
    } catch(err){
        throw err;
    }
}

module.exports = { createJWT, verifyJWT};