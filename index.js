/** 
*
*Primeiro ficheiro da nossa api
*
**/


//Dependencias
const http = require('http');
const https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var handlers = require('./lib/handler');
var helpers = require('./lib/helpers');

//Instantiate the HTTP server
var httpServer = http.createServer(function (req, res) {

    unifiedServer(req, res);

});

//Start the HTTP server
httpServer.listen(config.httpPort, function () {
    console.log("The server is listenign on port " + config.httpPort);
});

//Instantiate the HTTPs server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {

    unifiedServer(req, res);

});
//Start the HTTPs server
httpsServer.listen(config.httpsPort, function () {
    console.log("The server is listenign on port " + config.httpsPort);
});

// All the servers logic for http and https server
var unifiedServer = function (req, res) {
    //Get the URL form browser and parse it
    var parsedUrl = url.parse(req.url, true);

    //Get the path
    var path = parsedUrl.pathname;

    //dividir o path e tirar tudo que vem depois de  /&^+|\/+&
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //get query string (parameters) as an object
    var queryStringObject = parsedUrl.query;

    //get http method
    var method = req.method.toLowerCase();

    //Get headers as an object
    var header = req.headers;

    //Get payload
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });

    req.on('end', function () {
        buffer += decoder.end();

        //choose the handler this resquest go to, if one is not Found , use the nostFound handler
        var choseHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //contract the data obj to sendo to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'header': header,
            'payload': helpers.parseJsonToObject(buffer)
        };

        //Route the resquest to the handler specified on the router
        choseHandler(data, function (statusCode, payload) {
            // Use the statusCode called back by the handler or default to 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            //Use the payload called back by the handler or use default empty obj
            payload = typeof (payload) == 'object' ? payload : {};

            //Convert the payload to a String
            var payloadString = JSON.stringify(payload);

            //retur the response
            res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            res.end(payloadString);
            console.log('Returning this response: ', statusCode, payloadString);
        });
        // whats the brower going to show
        //res.end('Hello world\n');

        //**  */
        //  console.log("request received on path " + trimmedPath + " with method " +
        //      method + " and with queries ", queryStringObject);
        // console.log('Request received with these headers ', header);
        // console.log('Request received with these payload ', buffer);
    });

    //Convert a content type as html
    // res.writeHead(200, { 'Content-Type': 'text/html' });

};

//define a resquest router
var router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens
}