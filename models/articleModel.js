var mongoose = require('./db.js');


//建立Schema,不能操作数据库
var articleSchema = mongoose.Schema({
	title:String,
	context:String,
	view:Number,
	user:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
	ctime:{type:Date,default:Date.now, get:function(v){
		return v.getFullYear() + '-' + (v.getMonth()+1);
	}},
	count:{type:Number,default:0}
},{collection:'article'})

//author: { type: Schema.Types.ObjectId, ref: 'Person' },

//建立 model ,可以操作数据库
var articleModel = mongoose.model('article',articleSchema);

module.exports = articleModel;