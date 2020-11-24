
var express = require('express');
var articleModel = require('../models/articleModel');
var talkModel = require('../models/talkModel');
var router = express.Router();


router.post('/',function(req,res){
	var article = new articleModel({
		title:req.body.title,
		context:req.body.context,
		user: req.body.aid
	})
	article.save(function(err){
		if(err){
			res.send('发布失败！')
		}else{
			res.redirect('/')
		}
	})
})


router.get('/info/:aid',function(req,res){
	var aid = req.params.aid;
	var page = req.query.page?parseInt(req.query.page):1;

	articleModel.findById(aid,function(err,info){
		articleModel.findByIdAndUpdate(aid,{$set:{count:info.count+1}},function(err,ok){
		})
	})

	articleModel.findById(aid).populate('user','username avatar userage usersex').exec(function(err,info){
		// console.log(info)
		talkModel.find({article:aid}).populate('user','username avatar userage usersex').exec(function(err2,totaltalk){
			talkModel.find({article:aid}).populate('user','username avatar userage usersex').skip((page-1)*5).limit(5).exec(function(err2,talk){
				res.render('info',{info:info,talk:talk,count:totaltalk.length})
			})
		})
		
	})


})

router.post('/savetalk',function(req,res){

	var m = new talkModel({
		talkcontext: req.body.context,
		article: req.body.aid,
		user: req.body.uid
	})
	m.save(function(err){
		if(err){
			res.send('评论失败')
		}else{
			res.send('评论成功！')
		}
	})
})


router.get('/del/:id',function(req,res){
	var aid = req.params.id;
	articleModel.findByIdAndRemove(aid,function(err){
		talkModel.remove({article:aid},function(err2){
			res.send('del ok')
		})
	})
})

module.exports = router;