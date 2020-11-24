var mongoose = require('./db.js');


//建立Schema,不能操作数据库
var talkSchema = mongoose.Schema({
	talkcontext:String,
	article:{type:mongoose.Schema.Types.ObjectId, ref:'article'},
	user:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
	ctime:{type: Date, default: Date.now}
},{collection:'talk'})

//author: { type: Schema.Types.ObjectId, ref: 'Person' },

//建立 model ,可以操作数据库
var storyModel = mongoose.model('talk',talkSchema);

module.exports = storyModel;