

var express = require('express');
var crypto = require('crypto');

var userModel = require('../models/userModel')


var router = express.Router();






router.get('/',function(req,res){
	res.render('login')
})

router.post('/',function(req,res){

	// console.log(req.body)
	try{
		if(req.body.username&&req.body.userpwd){
			var username = req.body.username;
			var userpwd = req.body.userpwd;
			var secret = crypto.createHmac('sha256','aze').update(userpwd).digest('hex');
			userModel.find({username:username,userpassword:secret},function(err,us){
				if (us.length!=0) {
					var uu = {
						_id: us[0]._id,
						username: us[0].username,
						usersex: us[0].usersex,
						userage: us[0].userage,
						avatar:us[0].avatar,
						ctime: us[0].ctime
					}
					req.session.user = uu;
					res.locals.user = req.session.user;
					res.redirect('/');
				}else{
					res.render('login');
				}
			})
		}else{
			res.send('账号或密码不正确 <a href="/login">返回</a>')
		}
	}catch(err){
		res.send('登录失败!!')
	}
})





module.exports = router;