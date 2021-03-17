/**
 * Create and export configurations variables
 */


//container for all enviroments
var enviroments = {};

//Staging(default) enviroment
enviroments.staging = {
    'httpPort': 3000,
    'httpsPort':3001,
    'envName': 'staging',
    'hashingSecret' : 'thisIsASecret'
};
//Prodution enviroment
enviroments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsAlsoSecret'
};

//Determine wich enviroment was passed as a comand-line arguments
var currentEnviroment =
    typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check taht the current env is one of env above, if not, default to staging
var enviromentToExport = typeof (enviroments[currentEnviroment]) == 'object' ?
    enviroments[currentEnviroment] : enviroments.staging;

// Export the module
module.exports = enviromentToExport;