/**
 * lib for storing data and editing data
 * 
 */

 //dependences
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers')

//Container for the module(to be exported)
var lib = {};

//Base director of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');
//write data to a file
lib.create = function(dir,file, data, callback){
    
    //open file to write
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            
            //Convert data to a String
            var stringData = JSON.stringify(data);

            //write to file and close it
            fs.write(fileDescriptor, stringData, function (err) {
                if (!err) {
                    //close
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false);
                        } else {
                           callback('error closing new file') 
                        }
                    })
                } else {
                    callback('Error writing to new file');
                }
            });

        } else {
            callback('Could not create new file, it may already exists');
        }
    });
    ;}

    //Read data from file
lib.read = function (dir, file, callback) {
        
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function (err, data) {
        if (!err && data) {
            var paserdData = helpers.parseJsonToObject(data);
            callback(false, paserdData);  
        } else {
            callback(err, paserdData);  
        }
        
    });
}
    

lib.update = function (dir, file, data, callback) {
    
    //open file
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function (err,fileDescriptor) {
        if (!err && fileDescriptor) {
           
            //Convert data to String
            var stringData = JSON.stringify(data);

            //
            fs.ftruncate(fileDescriptor, function (err) {
                if (!err) {
                    
                    //writ to th file or close it
                    fs.writeFile(fileDescriptor,stringData, function (err) {
                        if (!err) {
                          
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Coudnt close the file may not exist');
                                }
                            });
                        } else {
                            callback('Error writing to existing file');  
                        }
                    });

                } else {
                    callback('Error truncating file');
                }
            });

        } else {
            callback('Could not open the file to updating, it may does not exist');
       }
    });
}

//delete file
lib.delete = function (dir,file,callback) {
    
    //unlink the file
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', function (err) {
        if (!err) {
            callback(false);  
            callback('deleted');
        } else {
            callback('error to delete the file');
       }
    });
};
//Export the module
module.exports = lib;