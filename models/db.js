var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/blog');

var db = mongoose.connection;
db.on('connected',function(){
	console.log('已经连接上数据库了');
})

module.exports = mongoose;