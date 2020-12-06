# 文法
## 配列
## オブジェクト
# 関数
## コンストラクタ
## 静的関数
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
# 勉強リンク
https://paiza.io/ja/projects/new?language=javascript   
ここで実行できる。
