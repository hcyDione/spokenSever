var tokener = require('./token'); //验证token
var wxDataCrypt = require('./wxDataCrypt'); //微信用户数据解密
var contactDb = require('./custDb'); //链接mysql数据库增删改查用户信息
var contentDb = require('./contentDb'); //链接mysql数据库增删改查内容

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

//中间件来设置静态文件路径
app.use(express.static('public'));

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
	try {
		var id = contactDb.custInsert(val)
	} catch (err) {
		var data = {
	        code: '-1',
	        message: err.message
	    }
	    res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
		res.write(JSON.stringify(data));
		res.end();
	}
    id.then(function (val) {
	    var data = {
	        code: '0',
	        data: val
	    }
	    res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
		res.write(JSON.stringify(data));
		res.end();
    })
})

app.post('/upload',upload.single('file'),function (req, res, next){
	var desFile = req.file.path;
	var fileName = req.file.filename.substr(0,8);
	var type = req.file.mimetype.split('/')[1];
	var data = null
	//var imgPath = './public/images/5.jpeg'
	fs.readFile(desFile,function(err,filedata)  { //异步执行  'binary' 二进制流的文件
        //var base64Img = filedata.toString("base64");
        //var decodeImg = new Buffer(base64Img,"base64")         
        //console.log(Buffer.compare(filedata,decodeImg));
        //imgPath = './public/images/6.jpeg'
        //filedata 可以换成decodeImg
        desFile = './public/images/'+fileName+'.'+type
	    fs.writeFile(desFile,filedata,function(errWrite){      //生成图片2(把buffer写入到图片文件)
	        if (errWrite) {
	            data = {
					code: '-1',
				    data: err
			    }
	        } else {
	        	response = {
				    code: '0',
					data: '/public/images/'+ fileName+'.'+type
				}			
	        }
	        res.writeHead(200,{'Content-Type': 'multipart/form-data'});
			res.write(JSON.stringify(response));
			res.end(); 
        });
    }); 	
})
app.post('/upload/video',upload.single('file'),function (req, res, next){
	var desFile = req.file.path;
	var fileName = req.file.filename.substr(0,8);
	var type = req.file.mimetype.split('/')[1];
	var data = null
	//var imgPath = './public/images/5.jpeg'
	fs.readFile(desFile,function(err,filedata)  { //异步执行  'binary' 二进制流的文件
        //var base64Img = filedata.toString("base64");
        //var decodeImg = new Buffer(base64Img,"base64")         
        //console.log(Buffer.compare(filedata,decodeImg));
        //imgPath = './public/images/6.jpeg'
        //filedata 可以换成decodeImg
        desFile = './public/video/'+fileName+'.'+type
	    fs.writeFile(desFile,filedata,function(errWrite){      //生成图片2(把buffer写入到图片文件)
	        if (errWrite) {
	            data = {
					code: '-1',
				    data: err
			    }
	        } else {
	        	response = {
				    code: '0',
					data: '/public/video/'+ fileName+'.'+type
				}			
	        }
	        res.writeHead(200,{'Content-Type': 'multipart/form-data'});
			res.write(JSON.stringify(response));
			res.end(); 
        });
    });	
})

app.post('/content/add', function (req,res){
	console.log('给内容库新加数据')
	var val = {
		'authorId' : req.body.authorId,
		'title' : req.body.title,
		'logo': req.body.logo,
		'detail' :  req.body.detail
	}
	try {
		var id = contentDb.custInsert(val)
	} catch (err) {
		var data = {
	        code: '-1',
	        message: err.message
	    }
	    res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
		res.write(JSON.stringify(data));
		res.end();
	}
    id.then(function (val) {
	    var data = {
	        code: '0',
	        data: val
	    }
	    res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
		res.write(JSON.stringify(data));
		res.end();
    })
})

app.get('/content/get', function (req,res){
	console.log('获取所有内容数据')
	try {
		var findid = ""
		var id = contentDb.custFind(findid)
	} catch (err) {
		var data = {
	        code: '-1',
	        message: err.message
	    }
	    res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
		res.write(JSON.stringify(data));
		res.end();
	}
    id.then(function (val) {
	    var data = {
	        code: '0',
	        data: val
	    }
	    res.writeHead(200,{'Content-Type': 'application/x-www-form-urlencoded'});
		res.write(JSON.stringify(data));
		res.end();
    })
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
