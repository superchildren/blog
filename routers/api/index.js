var articleModel = require('../../models/articleModel')
var userModel = require('../../models/userModel')
var talkModel = require('../../models/talkModel')
var express = require('express');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var router = express.Router();

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
  	var hz = file.originalname.split('.')
    cb(null, Date.now()+'.'+hz[hz.length-1])
  }
})

var upload = multer({ storage: storage })


router.post('/register',function(req,res){
	// console.log(req.body)
	try{
		if(req.body.user&&req.body.pwd){
			var secret = crypto.createHmac('sha256','aze').update(req.body.pwd).digest('hex');
			var user = new userModel({
				username:req.body.user,
				userpassword:secret,
				usersex:req.body.sex?req.body.sex:'男',
				userage:req.body.age?req.body.age:0
			})

			user.save(function(err,user){
				if(err){
					res.json({
						status:'fail',
						msg:'保存失败',
						data:''
					})
				}else{
					res.json({
						status:'fail',
						msg:'注册成功',
						data:user
					})
				}
			})
		}else{
			res.json({
				status:'fail',
				msg:'缺少字段，注册失败',
				data:''
			})
		}
	}catch(err2){
		res.json({
			status:'fail',
			msg:'注册失败-程序错误',
			data: err2
		})
	}
})

router.post('/login',function(req,res){
	try{
		if(req.body.username&&req.body.userpwd){
			var username = req.body.username;
			var userpwd = req.body.userpwd;
			var secret = crypto.createHmac('sha256','aze').update(userpwd).digest('hex');
			userModel.find({username:username,userpassword:secret},function(err,us){
				if (us.length!=0) {
					jwt.sign({info:us[0]},'aze', {expiresIn: '36h'},function(err2,token){
						if(err2){
							res.json({
								status:'fail',
								msg:'登录失败',
								data: ''
							})
						}else{
							res.json({
								status:'success',
								msg:'登录成功',
								data: {
									user:us[0],
									token:token
								}
							})
						}
					})
				}else{
					res.json({
						status:'fail',
						msg:'登录失败',
						data: '用户名或者密码错误'
					})
				}
			})
		}else{
			res.json({
				status:'fail',
				msg:'登录失败',
				data: '用户名或者密码错误'
			})
		}
	}catch(err){
		res.send('登录失败!!')
	}
})

router.post('/checklogin',function(req,res){
	var token = req.body.token;
	console.log(token)
	// res.send('ok')
	jwt.verify(token,'aze',function(err,info){
		if(err){
			res.json({
				status:'fail',
				msg:'登录失效',
				data: ''
			})
		}else{
			res.json({
				status:'success',
				msg:'登录有效',
				data: info
			})
		}
	})
})

router.post('/index',function(req,res){
	var page = req.query.page?parseInt(req.query.page):1;
	articleModel.find({}).populate('user','username avatar userage usersex').skip((page-1)*10).limit(10).exec(function(err,us){
		articleModel.find({},function(err2,us2){
			if(err){
				res.json({
					status:'fail',
					msg:'查询失效',
					data: ''
				})
			}else{
				res.json({
					status:'success',
					msg:'查询有效',
					data: {us:us,count:us2.length}
				})
			}
		})
	})
})

router.post('/search',function(req,res){
	var page = req.query.page?parseInt(req.query.page):1;  //当前的页数
	articleModel.find({title: new RegExp(req.body.keyword,'ig') }).populate('user','username avatar age sex').skip((page-1)*10).limit(10).exec(function(err,us){
		articleModel.find({title: new RegExp(req.body.keyword,'ig')},function(err2,as2){
			if(err){
				res.json({
					status:'fail',
					msg:'查询失效',
					data: ''
				})
			}else{
				res.json({
					status:'success',
					msg:'查询有效',
					data: {us:us,count:as2.length}
				})
			}
		})		
	})
})

router.post('/info',function(req,res){
	var aid = req.body.aid;
	var page = req.query.page?parseInt(req.query.page):1;

	articleModel.findById(aid,function(err,info){
		articleModel.findByIdAndUpdate(aid,{$set:{count:info.count+1}},function(err,ok){
		})
	})

	articleModel.findById(aid).populate('user','username avatar userage usersex').exec(function(err,info){
		talkModel.find({article:aid}).populate('user','username avatar userage usersex').exec(function(err2,totaltalk){
			talkModel.find({article:aid}).populate('user','username avatar userage usersex').skip((page-1)*5).limit(5).exec(function(err2,talk){
				if(err){
					res.json({
						status:'fail',
						msg:'查询失效',
						data: ''
					})
				}else{
					res.json({
						status:'success',
						msg:'查询有效',
						data: {info:info,talk:talk,count:totaltalk.length}
					})
				}
			})
		})
	})
})

router.post('/publish',function(req,res){
	var article = new articleModel({
		title:req.body.title,
		context:req.body.context,
		user: req.body.aid
	})
	article.save(function(err,info){
		if(err){
			res.json({
				status:'fail',
				msg:'发布失败',
				data:err
			})
		}else{
			res.json({
				status:'success',
				msg:'发布成功',
				data:info
			})
		}
	})
})

router.post('/savetalk',function(req,res){
	var m = new talkModel({
		talkcontext: req.body.context,
		article: req.body.aid,
		user: req.body.uid
	})
	m.save(function(err,msg){
		if(err){
			res.json({
				status:'fail',
				msg:'评论失败',
				data:err
			})
		}else{
			res.json({
				status:'success',
				msg:'评论成功',
				data:msg
			})
		}
	})
})

router.post('/myblog',function(req,res){
	var uid = req.body.uid;
	articleModel.find({user:uid}).populate('user','username avatar userage usersex').exec(function(err,as){	
		if(err){
			res.json({
				status:'fail',
				msg:'获取失败',
				data: ''
			})
		}else{
			res.json({
				status:'success',
				msg:'获取成功',
				data: {as:as,info:as[0].user}
			})
		}
	})
})

router.post('/editsave',function(req,res){
	var uid = req.body.uid;
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
					if(err){
						res.json({
							status:'fail',
							msg:'修改失败',
							data:err
						})
					}else{
						res.json({
							status:'success',
							msg:'修改成功',
							data:uu
						})
					}
				})
			}else{
				res.json({
					status:'fail',
					msg:'初始密码不对',
					data:''
				})
			}
		})
	}else{
		userModel.findByIdAndUpdate(uid,{$set:{usersex:sex,userage:age}},{new:true},function(err,uu){
			res.json({
				status:'success',
				msg:'修改成功',
				data:uu
			})
		})
	}
})

router.post('/reimg2',upload.single('avatar'), function(req,res){
	var uid = req.body.uid;
	userModel.findByIdAndUpdate(uid,{$set:{avatar:req.file.filename}},{new:true},function(err,user){
		if(err){
			res.json({
				status:'fail',
				msg:'更新头像失败',
				data:''
			})
		}else{
			res.json({
				status:'success',
				msg:'更新成功',
				data:user
			})
		}
	})
})

router.post('/ranking',function(req,res){
	articleModel.find({}).limit(10).sort({count:-1}).exec(function(err,as){
		if(err){
			res.json({
				status:'fail',
				msg:'查询失败',
				data:err
			})
		}else{
			res.json({
				status:'succees',
				msg:'查询成功',
				data:as
			})
		}
	})
})

router.post('/contest',function(req,res){

	userModel.find({}).limit(10).sort({count:-1}).exec(function(err,us){
		if(err){
			res.json({
				status:'fail',
				msg:'查询失败',
				data:err
			})
		}else{
			res.json({
				status:'succees',
				msg:'查询成功',
				data:{us:us}
			})
		}

	})

})
module.exports = router;