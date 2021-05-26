// Module dependencies.
var express = require('express');
var path = require('path');

var app = express();

var mqtt = require('mqtt')
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
const cors = require("cors");
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');

// Controllers
var releves_controller = require('./controllers/releves_controller');
var auth_controller = require('./controllers/authentification_controller')

// MongoClient
const MongoClient = require('mongodb').MongoClient;
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
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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

// set up cors
var corsOptions = {
    origin: '*'
};

app.use(cors(corsOptions));

app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorHandler());

// Mqtt connection
let clientMqtt = mqtt.connect('mqtt://broker.hivemq.com', {  clientId: 'antoinelebg' });

clientMqtt.on('connect', function() {
    console.log('Connected to mqtt broker !');
});

clientMqtt.on("error",function(error) {
    console.log("Can't connect to mqtt broker : " + error);
});

// Mqtt Subscriptions5485
clientMqtt.subscribe('EPSI/DHT11/zebi/temperature');
clientMqtt.subscribe('EPSI/DHT11/zebi/humidity');
clientMqtt.subscribe('EPSI/GL5516/zebi/brightness');

// Manage recieved messages
let releve = {};

clientMqtt.on('message', (topic, message) => {
    console.log(`****  MQTT payload recieved at ${(new Date().toLocaleTimeString())} Topic : ${topic}  *****`);

    let payload = JSON.parse(message.toString('binary'));

    if (topic.includes('temperature')) {
        releve.temperature = payload;
    } else if (topic.includes('humidity')) {
        releve.humidity = payload;

    } else if (topic.includes('brightness')) {
        releve.brightness = payload;
    }

    if ('temperature' in releve && 'humidity' in releve && 'brightness' in releve) {
        releves_controller.addReleve(releve, db.collection('releves'));
        releve = {};
    }
});

// ---------------- Routes --------------------

// Authentification
app.get('/login', auth_controller.login);

// Releves
app.get('/lastReleve', releves_controller.getLastReleve);
app.get('/allReleves', releves_controller.getAllReleve);
app.get('/addReleve', releves_controller.addReleve);



app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
