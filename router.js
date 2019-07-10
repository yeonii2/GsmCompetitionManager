var express = require('express');
var router = express.Router();
var app = express();
var fs = require('fs');

var userModel;
var mongoose = require('mongoose');
var database;
var userSchema = null;

var Team_Cnt = [0, 0];
var UserName = null;
var r = 0;
if(!database)
    connectDB();

// mongodb 연결
function connectDB() {
    //localhost 로컬 호스트
    //:27017  몽고디비 포트
    //local db 생성시 만든 폴더 명
    var databaseURL = 'mongodb://localhost:27017/test';

    mongoose.Promise = global.Promise;
    mongoose.connect(databaseURL, { useNewUrlParser: true });

    database = mongoose.connection;     //db와 연결 시도

    database.on('open',         //db 연결 될때의 이벤트
        function ()
        {
            console.log('data base 연결됨 ' + databaseURL);


            //몽구스는 스키마를 정의하고 해당 스키마에 해당 하는 데이터를 집어넣는 방식으로 테이블과 유사
            userSchema = mongoose.Schema({
                id: String,
                passwords: String,
                name: String,

            });
            console.log('userSchema 정의함');

            //컬렏션과 스키마를 연결시킴
            userModel = mongoose.model('users', userSchema);
            console.log('userModel 정의함');
        }
    );

    database.on('disconnected',         //db 연결 끊길떄
        function () {
            console.log('data base 연결 끊어짐');
        }
    );

    database.on('error',         //에러 발생하는 경우
        console.error.bind(console, 'mongoose 연결 에러')
    );

}

function cnt(){
    userModel.find({"contest": "goldenbell"}, function(err, docs){
        if(err)
            console.log(err.message);
        if(docs)
            Team_Cnt[0] = docs.length;
    });
    userModel.find({"contest": "gsmfestival"}, function(err, docs){
        if(err)
            console.log(err.message);
        if(docs)
            Team_Cnt[1] = docs.length;
    });
}

// router.post()
{
    router.route('/mypage1.ejs').post(
        function (req, res) {
            userModel.deleteOne({"contest":"goldenbell", "name": UserName},function(err, docs){
                if(err) {
                    res.render('mypage', {
                        contest:r,
                        log:UserName
                        // resol:0,
                        // TN:0,
                        // id:[0, 0],
                        // mean:0
                    });
                }
                if(docs){
                    r-=1;
                    res.render('mypage', {
                        contest:r,
                        log:UserName
                        // resol:0,
                        // TN:0,
                        // id:[0, 0],
                        // mean:0
                    });
                }
            });
        }
    );

    router.route('/mypage2.ejs').post(
        function (req, res) {
            userModel.deleteOne({"contest":"gsmfestival", "$or":[{id:UserName},{name:UserName}]},function(err, docs){
                if(err) {
                    res.render('mypage', {
                        contest:r,
                        log:UserName
                        // resol:0,
                        // TN:0,
                        // id:[0, 0],
                        // mean:0
                    });
                }
                if(docs){
                    r-=2;
                    res.render('mypage', {
                        contest:r,
                        log:UserName
                        // resol:0,
                        // TN:0,
                        // id:[0, 0],
                        // mean:0
                    });
                }
            });
        }
    );

    router.route('/goldenbell.ejs').post(
        function (req, res) {
            console.log('/goldenbell 호출됨');
            var paramResolution = req.body.message || req.query.message;
            console.log('paramName : '+UserName+' paramResolution : '+paramResolution);

            if(UserName === null)
            {
                //res.writeHead(200, { "Content-Type": "text/ejs;characterset=utf8" });
                //res.write('<script type="text/javascript">alert("로그인 후 이용하십시오!");</script>');
                //res.sendFile(__dirname+'/participation.ejs');
                console.log('로그인 안됨');
                res.render('participation', {log:UserName, Teamcnt:Team_Cnt, alert1:"로그인 후 이용하십시오!"});
            }
            else if (database) {
                authResolution(database, UserName, paramResolution,function(err,result){
                    if (database) {
                        if (err) {
                            console.log('Error!!!');
                            // res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                            // res.write('<h1>에러발생</h1>');
                            res.end();
                        }
                        if (result) {
                            res.render('participation', {log:UserName, Teamcnt:Team_Cnt, alert1:UserName+'학생님께서는 이미 신청되셨습니다!'});
                        }
                        else{
                            addResolution(database, UserName, paramResolution,
                                function (err, docs) {
                                    if (database) {
                                        if (err) {
                                            console.log('Error!!!');
                                            res.end();
                                        }
                                        if (docs) {
                                            //res.write('<script type="text/javascript">alert("'+UserName+'학생님 신청되셨습니다! 좋은 성적 거두시길!");</script>');
                                            cnt();
                                            res.render('participation', {log:UserName, Teamcnt:Team_Cnt, alert1:UserName+'님 영어 골든벨에 신청되셨습니다! 좋은 성적 거두시길!'});
                                        }
                                        else {
                                            res.render('participation', {log:UserName, Teamcnt:Team_Cnt, alert1:0});
                                        }
                                    }
                                    else {
                                        console.log('DB 연결 안됨');
                                        // res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                                        // res.write('<h1>databasae 연결 안됨</h1>');
                                    res.end();
                                    }
                                }
                            );
                        }
                    }
                    else {
                        console.log('DB 연결 안됨');
                        // res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                        // res.write('<h1>databasae 연결 안됨</h1>');
                    res.end();
                    }
                });
            }
        }
    );

    router.route('/gsmfestival.ejs').post(
        function (req, res) {
            console.log('/gsmfestival 호출됨');
            var paramTeam = req.body.Tname || req.query.Tname;
            var paramMean = req.body.mean || req.query.mean;
            var paramID = [req.body.CstudentID || req.query.CstudentID , req.body.studentID || req.query.studentID];
            var paramName = [req.body.Cname || req.query.Cname, req.body.name || req.query.name];
            console.log('paramTeam : '+paramTeam);

            if(UserName === null)
            {
                //res.write('<script type="text/javascript">alert("로그인 후 이용하십시오!");</script>');
                //res.sendFile(__dirname+'/participation.ejs');
                res.render('participation', {log:UserName, Teamcnt:Team_Cnt, alert1:"로그인 후 이용하십시오!"});
            }
            else if (database) {
                authFestival(database, paramTeam, paramMean, paramID, paramName, function(err,result){
                    if (database) {
                        if (err) {
                            console.log('Error!!!');
                            res.end();
                        }
                        if (result) {
                            // res.write('<script type="text/javascript">alert("이미 신청된 팀이름입니다!");</script>');
                            res.render('participation', {log:UserName, Teamcnt:Team_Cnt, alert1:'이미 신청된 팀이름입니다!'});
                        }
                        else{
                            addFestival(database, paramTeam, paramMean, paramID, paramName,
                                function (err, docs) {
                                    if (database) {
                                        if (err) {
                                            console.log('Error!!!');
                                            // res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                                            // res.write('<h1>에러발생</h1>');
                                            res.end();
                                        }
                                        if (docs) {
                                            //res.write('<script type="text/javascript">alert("'+docs.ops[0].team+'팀이 신청되었습니다! 좋은 성적 거두시길!");</script>');
                                            cnt();
                                            res.render('participation', {log:UserName, Teamcnt:Team_Cnt, alert1:UserName+'님 GSMFESTIVAL에 신청되셨습니다! 좋은 성적 거두시길!'});
                                        }
                                        else {
                                            res.render('participation', {log:UserName, Teamcnt:Team_Cnt, alert1:0});
                                        }

                
                                    }
                                    else {
                                        console.log('DB 연결 안됨');
                                        // res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                                        // res.write('<h1>databasae 연결 안됨</h1>');
                                    res.end();
                                    }
                                }
                            );
                        }
                    }
                    else {
                        console.log('DB 연결 안됨');
                        // res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                        // res.write('<h1>databasae 연결 안됨</h1>');
                    res.end();
                    }
                });
            }
        }
    );

    router.route('/login.html').post(
        function (req, res) {
            console.log('/login 호출됨');
            var paramID = req.body.id || req.query.id;
            var paramPW = req.body.passwords || req.query.passwords;
            console.log('paramID : ' + paramID + ', paramPW : ' + paramPW);
            if (database) {
                authUser(database, paramID, paramPW, 0,
                    function (err, docs) {
                        if (database) {
                            if (err) {
                                console.log('Error!!!');
                                // res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                                // res.write('<h1>에러발생</h1>');
                                res.end();
                                return;
                            }
                            if (docs) {
                                UserName = docs[0].name;
                                res.render('index', {log:UserName});
                            }
                            else {
                                console.log('empty Error!!!');
                                res.write('<script type="text/javascript">alert("아이디 또는 비밀번호가 틀립니다.");</script>');
                                // res.write(`<li class="login"style="float:right; list-style-type:none"><a href="/login.html">${docs[0].name}</a></li>`);
                                fs.readFile(__dirname+'/login.html', function(err, data){
                                    if(err)
                                        console.log(err.message);
                                    else
                                        res.end(data);
                                });
                            }
                        }
                        else {
                            console.log('DB 연결 안됨');
                            // res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                            // res.write('<h1>databasae 연결 안됨</h1>');
                        res.end();
                        }



                    }
                );
            }
        }
    );

    router.route('/addUser.html').post(
        function (req, res) {
            console.log('/addUser 호출됨');
            var paramID = req.body.id || req.query.id;
            var paramPW = req.body.passwords || req.query.passwords;
            var paramName = req.body.name || req.query.name;
            console.log('paramID : ' + paramID + ', paramPW : ' + paramPW);
            if (database) {
                if (database) {
                    authUser(database, paramID, paramPW, paramName,
                        function (err, docs) {
                            if (database) {
                                if (err) {
                                    console.log('Error!!!');
                                    // res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                                    // res.write('<h1>에러발생</h1>');
                                    res.end();
                                    return;
                                }
                                if (docs) {
                                    res.write('<script type="text/javascript">alert("이미 존재하는 회원입니다!");</script>');
                                    fs.readFile(__dirname+'/login.html', function(err, data){
                                        if(err)
                                            console.log(err.message);
                                        else
                                            res.end(data);
                                    });
                                }
                                else {
                                    addUser(database, paramID, paramPW, paramName,
                                        function (err, result) {
                                            if (err) {
                                                console.log('Error!!!');
                                                res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                                                res.write('<h1>에러발생</h1>');
                                                res.end();
                                                return;
                                            }
                                            if (result) {
                                                res.write('<script type="text/javascript">alert("회원가입 성공!");</script>');
                                                fs.readFile(__dirname+'/login.html', function(err, data){
                                                    if(err)
                                                        console.log(err.message);
                                                    else
                                                        res.end(data);
                                                });
                                            }
                                            else {
                                                res.write('<script type="text/javascript">alert("회원가입 오류");</script>');
                                                fs.readFile(__dirname+'/login.html', function(err, data){
                                                    if(err)
                                                        console.log(err.message);
                                                    else
                                                        res.end(data);
                                                });
                                            }
                                        }
                                    );
                                }
                            }
                            else {
                                console.log('DB 연결 안됨');
                                // res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                                // res.write('<h1>databasae 연결 안됨</h1>');
                            res.end();
                            }



                        }
                    );
                }

            }
            else {
                console.log('DB 연결 안됨');
                // res.writeHead(200, { "Content-Type": "text/html;characterset=utf8" });
                // res.write('<h1>databasae 연결 안됨</h1>');
            res.end();
            }
        }
    );
}

//router.get()
{
    router.get('/', function(req, res){
        res.render('index' ,{log:UserName});
    });

    router.get('/index.ejs', function(req, res){
        res.render('index' ,{log:UserName});
    });

    router.get('/mypage.ejs', function(req, res){
        r=0;
        authResolution(database, UserName, 0,function(err, docs){
            if (err) {
                console.log(err.message);
                return;
            }
            if (docs) {
                r+=1;
                // res.render('mypage' ,{
                //     contest:1,
                //     log:UserName
                //     // resol:0,
                //     // TN:0,
                //     // id:[0, 0],
                //     // mean:0
                // });console.log('보내짐');
            }
            else {
                // res.render('mypage' ,{
                //     contest:0,
                //     log:UserName
                //     // resol:0,//result[0].resol,
                //     // TN:0,
                //     // id:[0, 0],
                //     // mean:0
                // });
            }
        });

        searchFestival(database, 0, 0, UserName, UserName, function(err,docs){
            if (err) {
                console.log(err.message);
                return;
            }
            if (docs) {
                r+=2;
            }
            else {
                // res.render('mypage' ,{
                //     contest:0,
                //     log:UserName
                //     // resol:0,//result[0].resol,
                //     // TN:0,
                //     // id:[0, 0],
                //     // mean:0
                // });
            }
        });

        setTimeout(function(){
            res.render('mypage' ,{
                contest:r,
                log:UserName
                // resol:0,
                // TN:0,
                // id:[0, 0],
                // mean:0
            });console.log('보내짐');
        }, 500);
    });

    router.get('/match.ejs', function(req, res){
        res.render('match' ,{log:UserName});
    });
    router.get('/participation.ejs', function(req, res){
        cnt();
        res.render('participation', {log:UserName, Teamcnt:Team_Cnt,alert1:""});
    });
    router.get('/schedule.ejs', function(req, res){
        res.render('schedule' ,{log:UserName});
    });

    router.get('/goldenbell.ejs', function(req, res){
        res.render('goldenbell' ,{log:UserName});
    });

    router.get('/gsmfestival.ejs', function(req, res){
        res.render('gsmfestival' ,{log:UserName});
    });

    router.get('/login.html', function(req, res){
        res.sendFile(__dirname + '/login.html');
    });

    router.get('/logout', function(req, res){
        UserName = null;
        res.render('index', {log:UserName});
    });

    router.get('/addUser.html', function(req, res){
        res.sendFile(__dirname + '/addUser.html');
    });

    router.get('/matchpng', function(req, res){
        fs.readFile(__dirname + '/img/대진표.PNG', function(err, data){
            res.writeHead(200, {'Content-Type':'text/html'});
            res.end(data);
        })
    });
    router.get('/GCMLOGO', function(req, res){
        fs.readFile(__dirname + '/img/GCM_logo.png', function(err, data){
            res.writeHead(200, {'Content-Type':'text/html'});
            res.end(data);
        })
    });

}

//login
{

    var authUser = function (db, id, password, name, callback) {
        console.log('input id :' + id.toString() + '  :  pw : ' + password);

        //cmd 에서 db.users  로 썻던 부분이 있는데 이때 이 컬럼(테이블)에 접근은 다음처럼 한다
        /*
        var users = database.collection("users");
        var result = users.find({ "id": id, "passwords": password });
        */
        userModel.find({ "$or":[{"id": id}, {"passwords": password}, {"name":name}] },
            function (err, docs)
            {
                if (err) {
                    callback(err, null);
                    return;
                }

                if (docs.length > 0) {
                    console.log('find user [ ' + docs + ' ]');
                    callback(null, docs);
                }
                else {
                    console.log('can not find user [ ' + docs + ' ]');
                    callback(null, null);
                }
            }
        );

    };

    var addUser = function (db, id, passwords, name, callback) {
        console.log('add User 호출됨' + id + '  , ' + passwords);


        var user = new userModel({ "id": id, "passwords": passwords, "name": name });

        //user 정보를 저장하겠다는 함수
        user.save
        (
            function (err)
            {
                if (err)
                {
                    callback(err, null);
                    return;
                }

                //데이터가 추가됐다면 insertedCount 카운트가 0 보다 큰값이 된다
                console.log('사용자 추가 됨');
                callback(null, user);
            }
        );

    };

    var addUser = function (db, id, passwords, name, callback) {
        console.log('add User 호출됨' + id + '  , ' + passwords);
        var users = db.collection('users');

        //컬렉션에 데이터 추가할때는 배열 형태로 집어 넣는다
        users.insertMany([{ "id": id, "passwords": passwords, "name": name }],
            function (err, result) {
                if (err) {
                    callback(err, null);
                    return;
                }

                //데이터가 추가됐다면 insertedCount 카운트가 0 보다 큰값이 된다
                if (result.insertedCount > 0) {
                    console.log('사용자 추가 됨' + result.insertedCount);
                    callback(null, result);
                }
                else {
                    console.log('사용자 추가 안됨' + result.insertedCount);
                    callback(null, null);

                }

            }
        );

    };
}

//goldenbell
{
    var authResolution = function (db, name, resol,callback) {
    userModel.find({ "contest":"goldenbell", "name": name},
        function (err, docs)
        {
            if (err) {
                callback(err, null);
                return;
            }

            if (docs.length > 0) {
                console.log('find user [ ' + docs + ' ]');
                callback(null, docs);
            }
            else {
                console.log('can not find user [ ' + docs + ' ]');
                callback(null, null);
            }
        }
    );

    };

    var addResolution = function (db, name, resol,callback) {
    console.log('addResolution 호출됨 name : ' + name + ' resol : ' + resol);


    var user = new userModel({ "contest":"goldenbell", "name": name, "resol": resol });

    //user 정보를 저장하겠다는 함수
    user.save
    (
        function (err)
        {
            if (err)
            {
                callback(err, null);
                return;
            }

            //데이터가 추가됐다면 insertedCount 카운트가 0 보다 큰값이 된다
            console.log('각오 추가 됨');
            callback(null, user);
        }
    );

    };

    var addResolution = function (db, name, resol, callback) {
    console.log('addResolution 호출됨 name : ' + name + ' resol : ' + resol);
    var users = db.collection('users');

    //컬렉션에 데이터 추가할때는 배열 형태로 집어 넣는다
    users.insertMany([{ "contest":"goldenbell", "name": name, "resol": resol }],
        function (err, result) {
            if (err) {
                callback(err, null);
                return;
            }

            //데이터가 추가됐다면 insertedCount 카운트가 0 보다 큰값이 된다
            if (result.insertedCount > 0) {
                console.log('각오 추가 됨' + result.insertedCount);
                callback(null, result);
            }
            else {
                console.log('각오 추가 안됨' + result.insertedCount);
                callback(null, null);

            }

        }
    );

    };

}

//gsmfestival
{

    var searchFestival = function (db, team, mean, id, name ,callback) {
        userModel.find({"contest":"gsmfestival", "$or":[{id:name},{name:name}]},
            function (err, docs)
            {
                if (err) {
                    callback(err, null);
                    return;
                }

                if (docs.length > 0) {
                    console.log('find gsmfestival');
                    callback(null, docs);
                }
                else {
                    console.log('can not find gsmfestival');
                    callback(null, null);
                }
            }
        );

    };

    var authFestival = function (db, team, mean, id, name ,callback) {
        userModel.find({
            "contest":"gsmfestival",
            "team": team
        },
            function (err, docs)
            {
                if (err) {
                    callback(err, null);
                    return;
                }

                if (docs.length > 0) {
                    console.log('find team [ ' + docs + ' ]');
                    callback(null, docs);
                }
                else {
                    console.log('can not find team [ ' + docs + ' ]');
                    callback(null, null);
                }
            }
        );

    };

    var addFestival = function (db, team, mean, id, name ,callback) {
        console.log('addFestival 호출됨 team : ' + team);


        var user = new userModel({
            "contest":"gsmfestival",
            "team": team,
            "mean": mean,
            "id": id,
            "name": name
        });

        //user 정보를 저장하겠다는 함수
        user.save
        (
            function (err)
            {
                if (err)
                {
                    callback(err, null);
                    return;
                }

                //데이터가 추가됐다면 insertedCount 카운트가 0 보다 큰값이 된다
                console.log('팀 추가 됨');
                callback(null, user);
            }
        );

    };

    var addFestival = function (db, team, mean, id, name ,callback) {
        console.log('addFestival 호출됨 team : ' + team);
        var users = db.collection('users');

        //컬렉션에 데이터 추가할때는 배열 형태로 집어 넣는다
        users.insertMany([{
            "contest":"gsmfestival",
            "team": team,
            "mean": mean,
            "id": id,
            "name": name
        }],
            function (err, result) {
                if (err) {
                    callback(err, null);
                    return;
                }

                //데이터가 추가됐다면 insertedCount 카운트가 0 보다 큰값이 된다
                if (result.insertedCount > 0) {
                    console.log('팀 추가 됨' + result.insertedCount);
                    callback(null, result);
                }
                else {
                    console.log('팀 추가 안됨' + result.insertedCount);
                    callback(null, null);

                }

            }
        );

    };

}

app.use('/', router);       //라우트 미들웨어를 등록한다

module.exports = router;
