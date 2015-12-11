//GENERAL
var APP_NAME='Quartz';

//FIREBASE
var FBURL = 'https://quartz.firebaseio.com/',
    FIREBASE_SECRETE = 'XGasvxEnG2Dr9EmaR07aLmYisFMBqPJQSgyUam2I',
    ORDER_ROOT_PATH='/orders';

//PHP MODULES
var PHP_SERVER_PORT='3000',
    PHP_BIN_PATH='php/bin/php-cgi.exe';

//EMAIL
var SENDER_NAME = 'My Company Name',
    SENDER_ADDRESS = 'u910328@gmail.com',
    MY_ADDRESS = 'u910328@gmail.com',
    FROM = SENDER_NAME + '<' + SENDER_ADDRESS + '>',
    GMAIL_ACC = 'freecemailtest@gmail.com',
    GMAIL_PASS = 'u910328@gmail.com';


module.exports = {
    APP_NAME: APP_NAME,
    FBURL: FBURL,
    FIREBASE_SECRETE: FIREBASE_SECRETE,
    ORDER_ROOT_PATH: ORDER_ROOT_PATH,
    PHP_SERVER_PORT: PHP_SERVER_PORT,
    PHP_BIN_PATH:PHP_BIN_PATH
};