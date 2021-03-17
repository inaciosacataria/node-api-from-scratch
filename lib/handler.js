/**
 * request handlers
 */

//dependencies
_data = require('./data');
var helpers = require('./helpers');
//our handlers
var handlers = {};

//sample handler
handlers.sample = function (data, callback) {
    //callback a http status code, and payload object
    callback(406, { 'name': 'sample handler' });
};

handlers.ping = function (data, callback) {
    //calback a http status code, and payload object
    callback(200);
};

handlers.users = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

//containers
handlers._users = {};
//Users POST
//require data:firstName, lastName, phone, password, tosAgreement
//optional data: none
handlers._users.post = function (data, callback) {
    //check that all request field are filled out
    var firstName = typeof (data.payload.firstName) == 'string'
        && data.payload.firstName.trim().length > 0 ?
        data.payload.firstName.trim() : false;

    var lastName = typeof (data.payload.lastName) == 'string'
        && data.payload.lastName.trim().length > 0 ?
        data.payload.lastName.trim() : false;

    var phone = typeof (data.payload.phone) == 'string'
        && data.payload.phone.trim().length == 10 ?
        data.payload.phone.trim() : false;

    var password = typeof (data.payload.password) == 'string'
        && data.payload.password.trim().length > 0 ?
        data.payload.password.trim() : false;

    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean'
        && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        //make sure that user doesnt already exists
        _data.read('users', phone, function (error, data) {
            if (error) {
                //Hash the password
                var hashedPassword = helpers.hash(password);

                //Create the users
                if (hashedPassword) {
                    //Create the new user object
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'password': hashedPassword,
                        'tosAgreement': tosAgreement

                    };
                    //Store the user object
                    _data.create('users', phone, userObject, function (err) {
                        if (!err) {
                            callback(200);
                            console.log(userObject);
                        } else {
                            console.log(err);
                            callback(500, { 'error': 'Could not create the new user' })
                        }
                    });

                } else {
                    callback(500, { 'error': 'Could not hash the new user\'s password' })
                }


            } else {
                //Users already exist
                callback(400, { 'error': 'User already exists' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing require fields' })
    }

};
//users get
//require data : phone 
//optional data :nona
//@TODO only let an authentited user access their own obect
handlers._users.get = function (data, callback) {
    //check that the fone number is valid
    var phone = typeof (data.queryStringObject.phone) == 'string'
        && data.queryStringObject.phone.trim().length == 10 ?
        data.queryStringObject.phone.trim() : false;

    if (phone) {
        _data.read('users', phone, function (err, data) {
            if (!err) {
                // remove the hash password from the user before retorning
                delete data.password;
                callback(200, data);
            } else {
                callback(404);
            }
        });

    } else {
        callback(400, { 'error': 'Phone isnt correctly formatted' })
    }
}
//users put
// required data phone to update
//optional data : firstnam, lastname,password
//@TODO only let authetited users update their own data
handlers._users.put = function (data, callback) {

    //check for the required fields
    var phone = typeof (data.payload.phone) == 'string'
        && data.payload.phone.trim().length == 10 ?
        data.payload.phone.trim() : false;


    //check that all request fielsa are filled out
    var firstName = typeof (data.payload.firstName) == 'string'
        && data.payload.firstName.trim().length > 0 ?
        data.payload.firstName.trim() : false;

    var lastName = typeof (data.payload.lastName) == 'string'
        && data.payload.lastName.trim().length > 0 ?
        data.payload.lastName.trim() : false;

    var password = typeof (data.payload.password) == 'string'
        && data.payload.password.trim().length > 0 ?
        data.payload.password.trim() : false;

    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean'
        && data.payload.tosAgreement == true ? true : false;

    if (phone) {

        //erro if nothing is sent to update
        if (firstName || lastName || password) {
            //loojup the user 
            _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                    //update the field necessary 
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.password = helpers.hash(password);
                    }

                    // Store the user
                    _data.update('users', phone, userData, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'error': 'Could not update the user' });
                        }
                    });
                } else {
                    callback(400, { 'error': 'the specified user does not exist' });
                }
            });
        } else {
            callback(400, { 'error': 'Missing fields to update' });
        }
    } else {
        callback(400, { 'error': 'Missing required flield' });
    }
};
//user delete
// required field phone number
//@TODO only let the user delete their own data 
//@TODO clean up any other associated with this user
handlers._users.delete = function (data, callback) {
    //check that the fone number is valid
    var phone = typeof (data.queryStringObject.phone) == 'string'
        && data.queryStringObject.phone.trim().length == 10 ?
        data.queryStringObject.phone.trim() : false;

    if (phone) {
        _data.read('users', phone, function (err, data) {
            if (!err && data) {

                _data.delete('users', phone, function (err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(400, { 'error': 'Could not find specified user' });
                    }

                });

            } else {
                callback(400, { 'error': ' err Could not find specified user' });
            }
        });

    } else {
        callback(400, { 'error': 'Phone isnt correctly formatted' })
    }
};



//not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};


//tokens
handlers.tokens = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

//Container to the tokens
handlers._tokens = {};

//Tokens post
//required data: phone and password
//optional data :none
handlers._tokens.post = function (data, callback) {

    var phone = typeof (data.payload.phone) == 'string'
        && data.payload.phone.trim().length == 10 ?
        data.payload.phone.trim() : false;

    var password = typeof (data.payload.password) == 'string'
        && data.payload.password.trim().length > 0 ?
        data.payload.password.trim() : false;

    if (phone && password) {
        //lookup the users who matches that phone nmber
        _data.read('users', phone, function (err, userData) {
            if (!err && userData) {
                //hash the sent password, and compare it to the password store inthe used obj
                var hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.password) {
                    //valid , create a new token with a random na,e, set expiration date 1hour in the future
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;

                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    _data.create('tokens', tokenId, tokenObject, function (err) {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(200, { 'error': 'Could not create a token' });
                        }
                    });


                } else {
                    callback(400, { 'error': 'Password did not macth specified user' });

                }
            } else {
                callback(400, { 'error': 'Could not find specified user' })
            }
        });
    } else {
        callback(400, { 'error': 'Missing required fields' });
    }
}

//Tokens get
//require data ID
handlers._tokens.get = function (data, callback) {

    //get query string tokenObject
    var phone = typeof (data.queryStringObject.phone) == 'string'
        && data.queryStringObject.phone.trim().length == 10 ?
        data.queryStringObject.phone.trim() : false;
}

//Tokens put
handlers._tokens.put = function (data, callback) {

}

//Tokens delete
handlers._tokens.delete = function (data, callback) {

}

module.exports = handlers;

