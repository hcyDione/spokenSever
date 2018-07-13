var tokener = require('./token'); //验证token
var wxDataCrypt = require('./wxDataCrypt'); //微信用户数据解密
var contactDb = require('./contactDb'); //链接mysql数据库

var express = require('express'); 
var app = express();
var http = require("http");

var path = require('path');
var request = require('request');
var bodyParser = require('body-parser');

var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: './tmp/' });


app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json())

app.post('/gettoken', function (req, res){
	console.log('获取token')
	var name = req.body.name 
	var psd = req.body.psd 
	if (name == 'Dione' && psd == 'admin'){
		const payload = {
			name: 'Dione',
			admin: true
		}
		const timeout = '1530844708'
        var token = tokener.createToken(payload,timeout)
        var data = {
        	code: '0',
        	token: token
        }
	} else{
		var data = {
        	code: '-1',
        	message: '数据错误'
        }
	}
	res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
	res.write(JSON.stringify(data));
	res.end();
})
app.post('/code2session',function (req,res){
	console.log('获取sessionkey')
	var author = req.headers.authorization
    var isuser = tokener.checkToken(author)
    if (isuser == false){
    	var data = {
        	code: '-1',
        	message: 'token验证失败'
        }
        res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
		res.write(JSON.stringify(data));
		res.end();
    } else {
    	var code = req.query.code
	    var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=wxa6bc09066f9bbd18&secret=aaa0097a4094b0a377998cfebcb2fa99&js_code='+code+'&grant_type=authorization_code'
	    request.get(url,function (error, response, body){
	    	console.log('微信请求成功')
	    	var sessionkey = JSON.parse(body).session_key
	    	var data = {
	        	code: '0',
	        	data: {
	        		"sessionkey": sessionkey
	        	}
            } 
	    	res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
		    res.write(JSON.stringify(data));
		    res.end();
	    })
    }
})

app.post('/decryption',function (req,res){
	console.log('解密微信数据')
	var author = req.headers.authorization
    var isuser = tokener.checkToken(author)
    if (isuser == false){
    	var data = {
        	code: '-1',
        	message: 'token验证失败'
        }
    } else {
    	var sessionkey = req.body.sessionkey 
		var encrypteddata = req.body.encrypteddata 
		var iv = req.body.iv 
		var appid = 'wxa6bc09066f9bbd18'
		var pc = new wxDataCrypt(appid,sessionkey)
		var data = pc.decryptData(encrypteddata , iv)
		if (data == false){
			var data = {
		        code: '-1',
		        message: '数据解析错误'
	        }    
		} else {
			var data = {
		        code: '0',
		        data: data
	        } 
		}
    }
    res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
	res.write(JSON.stringify(data));
    res.end();
})

app.post('/loginwx',function (req,res){
	console.log('绑定微信用户到自己数据库')
	var name = req.body.name 
	var psd = req.body.psd 
	var val = {
		'openId' : req.body.openId,
		'nickName' : req.body.nickName,
		'city': req.body.country + req.body.province,
		'avatar' :  req.body.avatarUrl,
		'cardbkImg': req.body.avatarUrl,
	}
    var id = contactDb.custInsert(val)
    if (id == false){
    	var data = {
        	code: '-1',
        	message: '数据库操作失败'
        }
        res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
		res.write(JSON.stringify(data));
		res.end();
    } else {
    	var data = {
        	code: '0',
        	data: id
        }
        res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
		res.write(JSON.stringify(data));
		res.end();
    }
})

app.post('/upload', upload.single('file'),function (req, res, next){
	console.log(req.file)
   	var filepath = req.file.path
   	var filetype = req.file.mimetype
   	
})

var server = app.listen(8080, function () {
   console.log('端口8080已经启动')
})

server.on('request',(req,res)=>{
	console.log('做请求了')
})

server.on('connection',()=>{
	console.log('正在握手')
})

server.on('close',()=>{
	console.log('server close')
})
