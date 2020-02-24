var express = require('express');
var app = express()
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs");
var mysql = require("mysql");

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(80, function() {
    console.log("Express server has started on port 80")
});

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: '@#@MYSIGN#@$#$',
    resave: false,
    saveUninitialized: true
}))

var router = require('./router/main')(app, fs);