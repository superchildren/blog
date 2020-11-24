var express = require('express');
var path = require('path');
var routers = require('./routers');
var session = require('express-session');


var app = express();


app.use(express.urlencoded({extened:true}));
app.use(express.static(path.join(__dirname,'public')));

app.use(session({secret:'aze',cookie:{maxAge:1000*60*60*24*7}}))

app.use(function(req,res,next){
	res.header('Access-Control-Allow-Origin','*')
	res.locals.user = req.session.user;	
	next();
})

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs')

routers(app)


app.listen(339,function(){
	console.log('博客端口正在等候...')
})