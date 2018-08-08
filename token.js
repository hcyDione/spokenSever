//封装了一系列密码学相关的功能
var crypto = require("crypto");
const payload = {
	name: 'Dione',
	admin: true
}
const timeout = '1530669600'
var token = {
	createToken: function(obj,timeout){
		console.log(parseInt(timeout) || 0);
		var obj2 = {
			data:obj, //payload
			created:parseInt(Date.now()/1000), //token生成的时间的单位秒
			exp:parseInt(timeout) || 10 //token有效期也就是截止使用日期
		}
		//payload 信息
		var base64Str = Buffer.from(JSON.stringify(obj2),"utf8").toString("base64");

		//添加签名,防篡改
		var secret = 'ILOVEMAOMAO';
		var hash = crypto.createHmac('sha256',secret);
		    hash.update(base64Str);
		var signature = hash.digest('base64');

		return base64Str+ "."+signature
    },
    decodeToken: function(token) {
    	var decArr = token.split(".");
    	if (decArr.length < 2){
    		console.log('不合法')
    		return false
    	}
    	var payload = {};
    	// 将payload json 字符串 解析为对象
    	try {
    		payload = JSON.parse(Buffer.from(decArr[0],'base64').toString('utf8'));
    	} catch (e) {
    		return false;
    	}
    	//验证签名 
    	var secret = 'ILOVEMAOMAO';
    	var hash = crypto.createHmac('sha256',secret);
    	    hash.update(decArr[0])
    	var checkSignture = hash.digest('base64');

    	return {
    		payload: payload,
    		signature: decArr[1],
    		checkSignture: checkSignture
    	}
    },
    checkToken: function (token) {
    	var resDecode = this.decodeToken(token);
    	if (!resDecode) {
    		console.log('解码失败')
    		return false;
    	}
    	//是否过期
    	console.log('时间'+parseInt(Date.now()/1000))
    	var expState = (parseInt(Date.now()/1000)-parseInt(resDecode.payload.created))>parseInt(resDecode.payload.exp)?false:true;
    	if (resDecode.signature == resDecode.checkSignture && expState){
    		console.log('验证成功')
    		return true
    	}
    	return false;
    }
}
//var str = token.createToken(payload,timeout)
//var obj = token.checkToken(str)

module.exports = exports = token
