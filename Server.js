var express = require('express');
var serveStatic = require('serve-static');      //특정 폴더의 파일들을 특정 패스로 접근할 수 있도록 열어주는 역할
var path = require('path');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');
var favicon = require('serve-favicon');

var dbrouter = require('./router');

var app = express();      //express 서버 객체
app.use(serveStatic(path.join('public', __dirname, 'public')));
var bodyParser_post = require('body-parser');       //post 방식 파서
//post 방식 일경우 begin
//post 의 방식은 url 에 추가하는 방식이 아니고 body 라는 곳에 추가하여 전송하는 방식
app.use(bodyParser_post.urlencoded({ extended: false }));            // post 방식 세팅
app.use(bodyParser_post.json());                                     // json 사용 하는 경우의 세팅
//post 방식 일경우 end

app.use(express.static(__dirname + '/public'));
app.use(serveStatic(path.join(__dirname, 'public')));

app.set("view engine","ejs"); // 1
app.set("views","views"); // 1

//쿠키와 세션을 미들웨어로 등록한다
app.use(cookieParser());
app.use(favicon(__dirname + '/img/favicon.ico'));

//세션 환경 세팅
//세션은 서버쪽에 저장하는 것을 말하는데, 파일로 저장 할 수도 있고 레디스라고 하는 메모리DB등 다양한 저장소에 저장 할 수가 있는데
app.use(expressSession({
    secret: 'my key',           //이때의 옵션은 세션에 세이브 정보를 저장할때 할때 파일을 만들꺼냐 , 아니면 미리 만들어 놓을꺼냐 등에 대한 옵션들임
    resave: true,
    saveUninitialized: true
}));


//라우터 미들웨어 등록하는 구간에서는 라우터를 모두  등록한 이후에 다른 것을 세팅한다
//그렇지 않으면 순서상 라우터 이외에 다른것이 먼저 실행될 수 있다
app.use('/', dbrouter);       //라우트 미들웨어를 등록한다


var errorHandler = expressErrorHandler(
    { static: { '404': '/html/404.html' } }              //404 에러 코드가 발생하면 해당 페이지를 보여주는 예외 미들웨어
);
// app.use(expressErrorHandler.httpError(404));
// app.use(errorHandler );


app.listen(8080,
    function () {
        console.log('8080포트에서 대기중');

    }
);
