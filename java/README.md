<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [配列](#%E9%85%8D%E5%88%97)
- [class](#class)
  - [abstract class](#abstract-class)
  - [override](#override)
- [メモ](#%E3%83%A1%E3%83%A2)
- [参考](#%E5%8F%82%E8%80%83)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 配列
# class
```java
class Main {
  public static void main(String[] args) {
    Person person1 = new Person("Kate Jones");
    person1.hello();      // こんにちは、私はKate Jonesです
    // staticメソッドはインスタンスを作成せずに呼び出し可能
    Person.helloworld();  // Hello world
    
    Person person2 = new Person("John Doe");
    // person2のanimal変数とperson1のanimal変数は共通
    System.out.println(person2.getter());  // human
    person1.setter("not human");
    System.out.println(person2.getter());  // not human
  }
}

class Person {
  // publicのnameフィールドを定義。Person.nameでクラス外からもアクセス可能
  // private String nameとすればクラス内からしかnameフィールドにはアクセスできない
  public String name;
  // staticフィールド。全てのインスタンス間で共通。
  private static String animal = "human";
  
  // コンストラクタ
  Person(String name) {
    // ローカル変数nameの値をインスタンスフィールドthis.nameに代入
    this.name = name;
  }
  // インスタンスメソッド
  public void hello() {
    System.out.println("こんにちは、私は" + this.name + "です");
  }
  // Staticメソッド　すべてのインスタンスで共通している処理を書く
  public static void helloWorld(){
    System.out.println("Hello world");
  }
  // getterメソッド。private,static変数animalの値を返す
  public String getter(){
    return this.animal;
  }
  // setterメソッド。private,static変数animalの値を上書き
  public void setter(String animalName){
    this.animal = animalName;
  }
}
```

## abstract class
## interface
```java
class Main {
  public static void main(String[] args) {
    // interfaceを実装したクラスのインスタンスを普通に作成
    Person person1 = new Person();
    Dog dog1 = new Dog();
    
    person1.hello("John"); // こんにちは！John
    dog1.hello("犬");      // わんわん！犬
  }
}

// interfaceを作成。継承させてから中身を実装する。具体的なことは書いてはいけない
interface Animal{
  // helloメソッドを使うことだけを決める
  void hello(String name);
}

// implementsで実装する。(継承はextends!!!!)
class Person implements Animal{
  // interfaceのhelloメソッドをオーバーライドして実装する
  public void hello(String name){
    System.out.println("こんにちは！" + name);
  }
}

class Dog implements Animal{
  public void hello(String name){
    System.out.println("わんわん！" + name);
  }
}
```
## override

# メモ
# 参考
