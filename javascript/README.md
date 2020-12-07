# 文法
# a
## 配列
配列は`[]`で囲まれたやつ。   
Array, Set, Mapがある。   
配列には`push`メソッドで値を追加できる。   
```js
const array = [1,2,3,4];
array.push(5);
console.log(array);  // [ 1, 2, 3, 4, 5 ]
```
## オブジェクト(連想配列)
`{}`で囲まれているのはオブジェクト。   
key,valueを持ち、keyは重複できない。(配列のMapのkeyは重複できる)。   
Objectは配列ではないので、.map()とか　forEach()とか使えない。   
```js
obj={}
obj = {
   "key1":"val1",
   "key2":"val2"
}
```
# 関数
## コンストラクタ
```js
// 関数オブジェクト
function Hello(word) {
    this.name = word;
    // funcメソッドを定義
    this.func = function() {
        console.log(this.name);
    }
}
// newでHelloオブジェクトのインスタンスを生成
var aisatsu = new Hello("hello");
aisatsu.func();  // -> "hello"

// newなしだと関数実行となる。このとき、this.nameはnameというグローバル変数となってします！
// つまり、new有りならコンストラクタ、new無しなら関数としてふるまう
var aisatsu_2 = Hello("hello");

console.log(aisatu_2); // undefined
console.log(aisatsu);  // Hello { name: 'hello', func: [Function] }
```
関数オブジェクトの定義は以下はすべて同じこと。   
```js
// 関数オブジェクト
function Hello(word) {
    this.name = word;
    // funcメソッドを定義
    this.func = function() {
        console.log(this.name);
    }
}

// 関数オブジェクトを変数に
var Hello = function(word){
    this.name = word;
    // funcメソッドを定義
    this.func = function() {
        console.log(this.name);
    }
}

// 関数オブジェクトを直接
var Hello = new function(word) {
    this.name = word;
    this.func = function() {
        console.log(this.name);
    }
}("じゃんぼ");

```
## プロトタイプチェーン
プロトタイプにインスタンス間で共通に使用するメソッドを書いておくことでメモリを節約できる。   
`this.func`と書くとインスタンスごとに同じ`func`メソッドが作成されて、メモリ効率が悪い。   
```js
// Helloコンストラクタ. メソッドは持たない
function Hello(word) {
    this.name = word;
}

// Helloコンストラクタのプロトタイプにfuncメソッドを定義しておく
Hello.prototype.func = function() {
    console.log(this.name);
}

var aisatsu = new Hello("hello, world");
// aisatsuインスタンスにはfuncメソッドは存在しない
// そのため、記憶しているHelloコンストラクタのプロトタイプにメソッドがないか調べる
aisatsu.func();  // -> "hello, world"

console.log(aisatsu); // Hello { name: 'hello, world' }
var aisatsu_2 = new Hello_2("hello, world");
console.log(aisatsu_2); // Hello_2 { name: 'hello, world', func: [Function] }
```
## クロージャ
func()関数の中のinnerFunc()関数内で、func()内で定義したvalueにアクセスできる。値のコピーではなく参照できる。   
```js
function func() {
  var value = 1;

  function innerFunc() {
    console.log(value);
  }
  innerFunc();
}
func(); // 1
```
## アロー関数
以下はすべて同じこと。関数の作りかた。   
```js
// 普通の関数定義
function getTriangle(base,height){
 return base * height / 2;
};

// 関数リテラル
let getTriangle = function(base,height){
 return base * height / 2;
};

// アロー関数
let getTriangle = (base, height) => {
  return base * height / 2;
};

// 本文が一文の場合
let getTriangle = (base, height) => base * height / 2;

// 引数が1つの場合
let getCircle = radius =>radius * radius * Math.PI;

// 引数を持たない場合
let show =()=> console.log('Hello, world!'); 
```
## コールバック関数
```js
const printHitsuji = () => {
  console.log("ひつじ仙人");
};

const call = (callback) => {
  console.log("コールバック関数を呼び出します。");
  callback();
};

call(printHitsuji);

// コールバック関数を呼びだします。
// ひつじ仙人
```
# クラス
## class
```js
// ES6以降からはクラス機能が追加された
class Animal {
  // 以下でコンストラクタを作成。一番初めに実行される
  constructor(name, age) {
    // this.nameはinstance名.nameと同じこと。つまりインスタンス変数
    this.name = name;
    this.age = age;
  }
  // クラスのメソッド
  greet() {
    console.log("こんにちは");
  }
  
  info() {
    // 同じクラス内のメソッドを呼び出すにはthisが必要！！！C#では不要だった気がする
    this.greet();
    // `${インスタンス変数}`の方法で文字列に変数を埋め込む方法をテンプレートリテラルという
    console.log(`名前は${this.name}です`);
    console.log(`${this.age}歳です`);
  }
}
// newでAnimalクラスのインスタンスanimalを作成。クラス名は大文字、インスタンスは小文字で書くらしい
const animal = new Animal();
animal.info(); 

// Consoleの出力
// こんにちは
// 名前はdogです
// 1歳です
```
## extends(継承),super(オーバーライド)
```js
// このAnimalクラスは上記と同じ
class Animal {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    console.log("こんにちは");
  }
  
  info() {
    this.greet();
    console.log(`名前は${this.name}です`);
    console.log(`${this.age}歳です`);
  }
}

// 親のAnimalクラスを継承した子クラスDogを作成
class Dog extends Animal {
  // 新しくbreedという引数を使用したいのでDogクラスのコンストラクタを作成
  constructor(name, age, breed) {
    // super()で親クラスのコンストラクタを呼び出す。
    // 子クラスのコンストラクタ内ではsuper()の形でthisを使う前に書かないとだめっぽい
    super(name, age);
    this.breed = breed;
  }
  
  // 親クラスのinfoメソッドを上書きする
  info() {
    super.info();  // 親クラスのinfoメソッドを実行する
    this.greet();  // 親クラスのgreetメソッドを実行する
    super.greet(); // 親クラスのgreetメソッドを実行する。this.greet()と同じ動作
    console.log(`名前は${this.name}です`);
    console.log(`犬種は${this.breed}です`);
    
    console.log(`${this.age}歳です`);
    const humanAge = this.getHumanAge();
    console.log(`人間年齢で${humanAge}歳です`);
  }
  
  getHumanAge() {
    return this.age * 7;
  }
}
const dog = new Dog("レオ", 4, "チワワ");
dog.info();

// Consoleの出力結果
// こんにちは       super.info()
// 名前はレオです   
// 4歳です    
// こんにちは       this.greet()
// こんにちは       super.greet()
// 名前はレオです    this.info
// 犬種はチワワです
// 4歳です
// 人間年齢で28歳です
```
## file分割
上記のextendsの章のファイルを三つに分割することができる。   
animal.js   
```js
class Animal {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log("こんにちは");
  }

  info() {
    this.greet();
    console.log(`名前は${this.name}です`);
    console.log(`${this.age}歳です`);
  }
}

export default Animal;
```
dog.js   
```js
import Animal from "./animal";

class Dog extends Animal {
  constructor(name, age, breed) {
    super(name, age);
    this.breed = breed;
  }

  info() {
    this.greet();
    console.log(`名前は${this.name}です`);
    console.log(`犬種は${this.breed}です`);
    console.log(`${this.age}歳です`);
    const humanAge = this.getHumanAge();
    console.log(`人間年齢で${humanAge}歳です`);
  }

  getHumanAge() {
    return this.age * 7;
  }
}

export default Dog;
```
script.js   
```js
import Dog from "./dog";

const dog = new Dog("レオ", 4, "チワワ");
dog.info();
```
# デバッグ
# メモ
やるべき勉強がよくわからん…
# 勉強リンク
https://paiza.io/ja/projects/new?language=javascript   
ここで実行できる。   
https://edabit.com/challenges   
ここでJavascriptのコーディングの練習ができる。
https://prog-8.com/languages?register=true   
progate.無料の部分はあんまりない   
