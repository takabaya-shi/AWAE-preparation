# 文法
# 関数
# クラス
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
# デバッグ
# メモ
# 勉強リンク
https://paiza.io/ja/projects/new?language=javascript   
ここで実行できる。
