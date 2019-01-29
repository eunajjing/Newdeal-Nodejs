var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var url = require('url');
var pool = require('./DBConnect');

var app = express();
var server = http.Server(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

server.listen(3000);

//로그인 아이디 매핑 (로그인 ID -> 소켓 ID)
var login_ids = {};
//socket.io 서버를 시작합니다.
var io = socketio(server);
console.log('socket.io 요청을 받아들일 준비가 되었습니다.');

//클라이언트가 연결했을 때의 이벤트 처리
io.on('connect', function(socket) {
	console.log(socket.id + "접속");
	
	socket.on('login', function(login) {

        // 기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        login_ids[login] = socket.id;
        socket.login_id = login;
        
        console.log("login_ids", login_ids);
        console.log("socket.login_id", socket.login_id);
        console.log('접속한 클라이언트 ID 갯수 : %d', Object.keys(login_ids).length);
        
        pool.getConnection(function(err, conn) {
    		if (err) {
    			err.code = 500;
    			return next(err);
    		}

    		var sql = 'select ano, alarmCode, bno, isFrom, DATE_FORMAT(alarmDate, "%Y-%m-%d") as alarmDate, readCheck from alarm where isFrom=? and readCheck=0 order by alarmDate desc';
    		conn.query(sql, socket.login_id, function(err, results) {
    			if (err) {
    				err.code = 500;
    				conn.release();
    				return next(err);
    			}
    			
    			var alarmList = {
    					count : results.length,
    					data : results
    			}
    			conn.release();
    			
    			io.sockets.emit('alarmList', alarmList);
    		});
    	});
    });
	
	socket.on('disconnect', function() {
	    console.log(socket.id + "접속 종료");
	  });
});

