// Module dependencies.
var express = require('express');
var path = require('path');

var app = express();

var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');

// Controllers
var controller = require('./controller');

// MongoClient
var MongoClient = require('mongodb').MongoClient;
// Database
var db;

// Mongo connection
MongoClient.connect('mongodb://127.0.0.1:27017/nostomates', function(err, database) {
    if (err) {
        throw err;
    }
    else {
        db = database;
        console.log("Connected to db!");
    }
});

app.use(function(req, res, next) {
    req.db = db;
    next();
});

app.set('port', process.env.PORT || 8080);
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'uwotm8'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorHandler());

// routes
app.get('/lastReleve', controller.getLastReleve);
app.get('/allReleves', controller.getAllReleve);
app.get('/addReleve', controller.addReleve);

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
