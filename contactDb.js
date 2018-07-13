var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'dione',
	database: 'miniprogram'
});
connection.connect();

var exeSql = {
	custFind: function (id) {
		var sql = "select * from customer where userid = " + id;
		connection.query(sql,function (err,res){
			if (err){
				console.log(err.message);
				return false;
			}
			console.log(res)
        })
		connection.end();
	},
	custUpdate: function (val,id){
		var name = val.name
		var avatar = val.avatar
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
		var openId = val.openId
		var nickName = val.nickName
		var city = val.city
		var avatar = val.avatar
		var cardbkImg = "update"
		var sqlinsert = "insert into customer values(0,'"+ openId + "','" + nickName + "','" + "','" + "','" + city + "','" + avatar + "','" + cardbkImg + "')";
		var sqlfind = "select * from customer where openId = '" + openId + "'";
		connection.query(sqlfind,function (errfind,resfind){
			var id = 0
			if (errfind){
				console.log(errfind.message)
				connection.query(sqlinsert,function (err,res){
					if (err){
						console.log(err.message);
						return false;
					}
					id = res.insertId
					return id
		        })
			} 
			id = resfind[0].userid
			return id
		})
		connection.end();
	},
	custDelete: function (id){
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
