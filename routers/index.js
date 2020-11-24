var articleModel = require('../models/articleModel')
var userModel = require('../models/userModel')
var crypto = require('crypto');

var api = require('./api/')

module.exports = function(app){
	app.get('/',function(req,res){

		var page = req.query.page?parseInt(req.query.page):1;
		articleModel.find({}).populate('user','username avatar userage usersex').skip((page-1)*10).limit(10).exec(function(err,us){
			articleModel.find({},function(err2,us2){
				res.render('index',{us:us,count:us2.length})
			})
		})
	})

	app.get('/search',function(req,res){
		//req.query.keyword
		var page = req.query.page?parseInt(req.query.page):1;  //当前的页数
		articleModel.find({title: new RegExp(req.query.keyword,'ig') }).populate('user','username avatar age sex').skip((page-1)*10).limit(10).exec(function(err,us){
			// console.log(as) 
			articleModel.find({title: new RegExp(req.query.keyword,'ig')},function(err2,as2){
				console.log(us)
				res.render('index2',{us:us,count:as2.length})
			})		
		})
	})

	app.get('/myblog/:uid',function(req,res){
		var uid = req.params.uid;
		articleModel.find({user:uid}).populate('user','username avatar userage usersex').exec(function(err,as){	
			res.render('personblog',{as:as,info:as[0].user})
		})
	})

	app.get('/edit/:uid',function(req,res){
		var uid = req.params.uid;
		userModel.findById(uid).exec(function(err,us){
			res.render('personedit',{us:us})
		})
	})

	app.post('/editsave',function(req,res){
		var uid = req.body.uid;
		console.log(uid)
		var sex = req.body.sex;
		var age = req.body.age;
		var oldpwd = req.body.oldpwd;
		var newpwd = req.body.newpwd;
		if(oldpwd){
			var secret = crypto.createHmac('sha256','aze').update(oldpwd).digest('hex');

			userModel.findById(uid,function(err,user){
				if(user.userpassword == secret){
					var rewpwd = crypto.createHmac('sha256','aze').update(newpwd).digest('hex');
					userModel.findByIdAndUpdate(uid,{$set:{usersex:sex,userage:age,userpassword:rewpwd}},{new:true},function(err,uu){
						res.send('修改成功！')
					})
				}else{
					res.send('初始密码不正确！')
				}
			})
		}else{
			userModel.findByIdAndUpdate(uid,{$set:{usersex:sex,userage:age}},{new:true},function(err,uu){
				// console.log(uu)
				res.send('修改成功！')
			})
		}
	})

	app.get('/articlescore',function(req,res){
		var list = [];
		articleModel.find({}).populate('user','username avatar userage usersex').exec(function(err,as){
			for(var i=0;i<as.length;i++){
				list.push(as[i])
			}
			function compare(property){
			    return function(a,b){
			        var value1 = a[property];
			        var value2 = b[property];
			        return value2 - value1;
			    }
			}
			list.sort(compare('count'))
			res.render('articlelist',{as:list})
		})
	})

	app.get('/personscore',function(req,res){
		var list = [];
		userModel.find().exec(function(err,us){
			for(var i=0;i<us.length;i++){
				articleModel.find({user:us[i]._id}).exec(function(err2,as){
					for(var j=0;j<as.length;j++){
						us[i].count+=as[j].count;
					}
				})
			}
			res.send("ok")
		})

		// articleModel.find({}).populate('user','username avatar userage usersex').exec(function(err,as){
		// 	for(var i=0;i<as.length;i++){
		// 		list.push(as[i])
		// 	}
		// 	function compare(property){
		// 	    return function(a,b){
		// 	        var value1 = a[property];
		// 	        var value2 = b[property];
		// 	        return value2 - value1;
		// 	    }
		// 	}
		// 	list.sort(compare('count'))
		// 	res.render('personlist',{as:list})
		// })
	})

	app.use('/register',require('./register'))
	app.use('/login',require('./login'))
	app.use('/article',require('./article'))

	app.use('/api',api)
}