var mysql = require('mysql');

var config = {
	host: 'localhost',
	user: 'root',
	password: 'dione',
	database: 'miniprogram'
}

var exeSql = {
	custFind: function (id) {
		var connection = mysql.createConnection(config);
		connection.connect();
		var sql = ''
		if (id == ""){
			//select nr.*, yh.nickName, yh.avatar from content nr, customer yh where nr.authorid = yh.userid
			sql = "select * from content";
		} else {
			sql = "select * from content where workid = " +'"'+ id +'"';
		    console.log(sql)
		}
		return new Promise ((resolve, reject) => {
			connection.query(sql,function (errfind,resfind){
				if (errfind){
					reject(new Error(errfind))
				}
			    resolve(resfind)
            })
            connection.end();
		})
	},
	custUpdate: function (val,id){
		var name = val.name
		var avatar = val.avatar
		var connection = mysql.createConnection(config);
		connection.connect();
		var sql = "update customer set  nickName =" + name + ", avatar = " + avatar + "where userid = " + id;
		connection.query(sql,function (err,res){
			if (err){
				console.log(err.message);
				return false;
			}
			console.log(res)
		})
		connection.end();
	},
	custInsert: function (val){
		var authorId = val.authorId
		var title = val.title
		var logo = val.logo
		var detail = val.detail
		var date = new Date();
		var dateTime = date.getFullYear() +'-'+ date.getMonth() +'-'+ date.getDay() + '" "' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
		var connection = mysql.createConnection(config);
		connection.connect();
		var sqlinsert = "insert into content values(0,'"+ authorId + "','" + detail + "','" + logo + "','" + title + "','" + dateTime + "','0','0','0')";
		var sqlfind = "select * from content where authorId = '" + authorId + "'";
		console.log(sqlinsert)
		return new Promise((resolve, reject) => {
			connection.query(sqlinsert,function (err,res){
				if (err){
				   reject(new Error(err))
				} 
				resolve('success')
			})
			connection.end();
		})
	},
	custDelete: function (id){
		var connection = mysql.createConnection(config);
		connection.connect();
        var sql = "delete from customer where userid = " + id;
        connection.query(sql,function (err,res){
			if (err){
				console.log(err.message);
				return false;
			}
			console.log(res)
		})
		connection.end();
	}
}


module.exports = exeSql
