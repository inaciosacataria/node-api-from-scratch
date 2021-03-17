/**
 * Helpers for varios tasks.
 */

 //dependencies
 var crypto = require('crypto');
 var config = require('./config')
 //Contairner for all the helpers
var helpers = {};

//Create a sha356 hash
helpers.hash = function (str) {
  
    if (typeof (str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret)
            .update(str).digest('hex');
        return hash;
    } else {
        return false;
    }

};

//Parse a Json string to an object
helpers.parseJsonToObject = function (str) {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (error) {
        return {};
    }
};

helpers.createRandomString = function (strLength) {
    strLength = typeof (strLength) == 'number' &&
        strLength > 0 ? strLength : false;
    
    if (strLength) {
      // define all the possible caracteres that could go into string
        var possibleCharacters = 'abcdefghijklmnopqestuvwxyz012345689'
         //form the final string 
        var str = '';
        for (let i = 1; i <= possibleCharacters.length; i++) {
            // all possible caracteres string is
            var randomCaracter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            )
                //apend to the final string
                str += randomCaracter;
        }

        return str;
    } else {
        return false;
    }
       
};

//exports
module.exports = helpers;