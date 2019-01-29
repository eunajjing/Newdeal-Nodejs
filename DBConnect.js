var mysql = require('mysql');
var dbConfig = {
   host : 'localhost',
   user : 'root',
   password : '1111',
   port : 3305,
   multipleStatements : true,
   database : 'newdeal'
};

var pool = mysql.createPool(dbConfig);
module.exports = pool;