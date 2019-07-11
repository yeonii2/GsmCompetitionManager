var express = require('express');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');

var path = require('path');
var serveStatic = require('serve-static');
var favicon = require('serve-favicon');

var cookieParser = require('cookie-parser');

var dbrouter = require('./router');

//express 서버 객체
var app = express(); 

//post 방식 파서
var bodyParser_post = require('body-parser');       

// post 방식 세팅
app.use(bodyParser_post.urlencoded({ extended: false }));            

// css 파일 접근가능
app.use(express.static(__dirname + '/public')); 
app.use(serveStatic(path.join(__dirname, 'public')));
 
// ejs view 처리
app.set("view engine","ejs");
app.set("views","views");

//쿠키와 세션을 미들웨어로 등록한다
app.use(cookieParser());

// favicon
app.use(favicon(__dirname + '/img/favicon.ico'));

app.use(expressSession({
    secret: 'my key',           //이때의 옵션은 세션에 세이브 정보를 저장할때 할때 파일을 만들꺼냐 , 아니면 미리 만들어 놓을꺼냐 등에 대한 옵션들임
    resave: true,
    saveUninitialized: true
}));
 
// 라우터 미들웨어 등록
app.use('/', dbrouter);
 
// 404 에러처리
var errorHandler = expressErrorHandler(
    { static: { '404': '/html/404.html' } } 
); 

app.listen(8080,
    function () {
        console.log('8080포트에서 대기중');
                
    }
);