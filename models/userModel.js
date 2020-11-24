var mongoose = require('./db.js');


//建立Schema,不能操作数据库
var userSchema = mongoose.Schema({
	username:{type:'String',unique:true},
	userpassword:String,
	usersex:String,
	userage:Number,
	avatar:{type:String,default:'default.jpg'},
	ctime:{type:Date,default:Date.now},
	count:{type:Number,default:0}
},{collection:'user'})

//author: { type: Schema.Types.ObjectId, ref: 'Person' },

//建立 model ,可以操作数据库
var userModel = mongoose.model('user',userSchema);

module.exports = userModel;