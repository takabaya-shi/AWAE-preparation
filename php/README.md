<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [配列](#%E9%85%8D%E5%88%97)
  - [配列](#%E9%85%8D%E5%88%97-1)
  - [連想配列](#%E9%80%A3%E6%83%B3%E9%85%8D%E5%88%97)
  - [foreach](#foreach)
- [オブジェクト指向](#%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E6%8C%87%E5%90%91)
  - [class](#class)
    - [基本](#%E5%9F%BA%E6%9C%AC)
    - [継承(extends) Override](#%E7%B6%99%E6%89%BFextends-override)
    - [スコープ定義(::)と$this](#%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%97%E5%AE%9A%E7%BE%A9%E3%81%A8this)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 配列
## 配列
```php
  <?php
   $colors = array("赤","青","黄");
    echo $colors[0];
    $colors[] = "白";
    echo $colors[3];
  ?>
```
## 連想配列
```php
 <?php
    $scores = array("数学" => 70,
                    "英語" => 90,
                    "国語" => 80);
    $scores["国語"] += 5;
    echo $scores["国語"];
  ?>
```
## foreach
```php
  <?php
    $scores = array('数学' => 70, '英語' => 90, '国語' => 80);
    foreach($scores as $key=>$value){
      echo $key."は".$value."点です。";
    }    
  ?>
```
# オブジェクト指向
## class
### 基本
```php
<?php
// インスタンスを作成
$parent1 = new ParentClass("John");  // $name: John
// アロー演算子でメソッドを呼び出す
$parent1->hello();  // parent class hello!

class ParentClass{
    // protectedはそのクラス自身と継承クラスからアクセス可能
    protected $name;
    // コンストラクタを定義
    function __construct($name){
        $this->name = $name;
        echo "\$name: ".$this->name."\n";
    }
    // メソッドを定義
    public function hello(){
        echo "parent class hello!";
    }
}

?>
```
### 継承(extends) Override
```php
<?php
$child1 = new ChildClass("John",20);
$child1->hello();

// 出力結果
// name: John
// $age: 20
// child class hello! John

class ParentClass{
    protected $name;
    function __construct($name){
        $this->name = $name;
        echo "\$name: ".$this->name."\n";
    }
    public function hello(){
        echo "parent class hello!";
    }
}

// ParentClassを継承する
class ChildClass extends ParentClass{
    protected $age;
    function __construct($name,$age){
        // parent::で親クラスのコンストラクタを呼び出す
        parent::__construct($name);
        $this->age = $age;
        echo "\$age: ".$this->age."\n";
    }
    // 親クラスのhello()をオーバーライドする
    public function hello(){
        // parent::で親クラスのコンストラクタを呼び出したので$this->nameに値がセットされている
        echo "child class hello! ".$this->name;
    } 
}
?>
```
### スコープ定義(::)と$this
```php
<?php
// Your code here!
$child1 = new ChildClass("John",20);
// infoメソッドを実行
$child1->info();

// 出力結果
// $name: John
// $age: 20
// human
// man
// child class hello! John
// child class hello! John
// parent class hello!
// こんにちは！
// こんにちは！

// 変更なし
class ParentClass{
    protected $name;
    function __construct($name){
        $this->name = $name;
        echo "\$name: ".$this->name."\n";
    }
    public function hello(){
        echo "parent class hello!\n";
    }
}

class ChildClass extends ParentClass{
    protected $age;
    // 定数ANIMALを追加
    const ANIMAL = "human";
    // staticな変数(インスタンスなしでもアクセス可能)を追加
    public static $sex = "man";
    
    function __construct($name,$age){
        parent::__construct($name);
        $this->age = $age;
        echo "\$age: ".$this->age."\n";
    }
    public function hello(){
        echo "child class hello! ".$this->name."\n";
    }
    // staticメソッドを追加
    public static function greet(){
        echo "こんにちは！\n";
    }
    // いろいろechoさせる
    public function info(){
        echo self::ANIMAL."\n";  // ANIMALは定数なのでself::じゃないとだめ
        // echo $this->ANIMAL;   // $this->だとerror
        echo self::$sex."\n";    // $sexはstaticなのでself::じゃないとだめ
        // echo $this->sex;      // $this->だとerror
        
        // $thisは自分自身のオブジェクトを指し、インスタンス化した際、クラス内のメンバ変数やメソッドにアクセスする際に使用
        $this->hello();     // child class hello! John
        // self::は自クラスを示す。定数やstaticに使うため子の使い方は良くない(でも実行できてしまう仕様)
        self::hello();      // child class hello! John
        // parent::は親クラスを示す。定数とかじゃなくても使える
        parent::hello();    // parent class hello!
        
        // こっちではgreet()はstaticなため、self::で呼び出すのがよさそう(でも両方実行できる)
        $this->greet();
        self::greet();
    }
}
?>
```
