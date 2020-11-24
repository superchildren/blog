

var express = require('express');
var crypto = require('crypto');

var userModel = require('../models/userModel')


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

var router = express.Router();






router.get('/',function(req,res){
	res.render('register')
})

router.post('/',function(req,res){
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

			user.save(function(err){
				if(err){
					console.log(err)
					res.send('注册失败 <a href="/register">返回</a>')
				}else{
					res.render('login');
				}
			})
		}else{
			res.send('注册失败 缺少字段 <a href="/register">返回</a>')
		}
	}catch(err){
		res.send('注册失败!!')
	}
})


router.post('/reimg',upload.single('avatar'), function(req,res){
	var uid = req.body.uid;
	userModel.findByIdAndUpdate(uid,{$set:{avatar:req.file.filename}},{new:true},function(err,user){
		res.send('ok')
	})
})


router.post('/reimg2',upload.single('avatar'), function(req,res){
	var uid = req.body.uid;
	userModel.findByIdAndUpdate(uid,{$set:{avatar:req.file.filename}},{new:true},function(err,user){
		if(err){
			res.json({
				status:'fail',
				msg:err,
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


module.exports = router;