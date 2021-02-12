<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [配列](#%E9%85%8D%E5%88%97)
- [class](#class)
  - [abstract 継承(extends)](#abstract-%E7%B6%99%E6%89%BFextends)
  - [interface 実装(implements)](#interface-%E5%AE%9F%E8%A3%85implements)
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
**override**   
```java
class Main {
  public static void main(String[] args) {
    // 普通にPerson型のインスタンスを作成する
    Person person1 = new Person();
    person1.hello("John"); // こんにちは！John
    person1.helloWorld();  // Sub やっはろ～！

    // 普通にAnimal型のインスタンスを作成する
    Animal animal2 = new Animal();
    animal2.helloWorld();  // Super Hello!
    
    // Person型のインスタンスをAnimal型の変数に代入してもメソッドはSubが使われる
    Animal animal1 = person1;
    animal1.helloWorld();  // Sub やっはろ～！
    
    // アップキャスト (Super = new Sub()). Superの型だけどSubメソッドが使用される
    Animal animal3 = new Person();
    animal3.helloWorld();  // Sub やっはろ～！
    
    // ダウンキャスト (Sub = (Sub)Super). アップキャストしたものならダウンキャストできる？？
    Person person3 = (Person)animal3;
    person3.helloWorld();  // Sub やっはろ～！
  }
}

class Animal{
  public void helloWorld(){
    System.out.println("Super Hello!");
  }
}

class Person extends Animal{
  public void hello(String name){
    System.out.println("こんにちは！" + name);
  }
  @Override
  public void helloWorld(){
      //super.helloWorld();  Super Hello!   super.でSuperクラスのメソッドを使用できる
      System.out.println("Sub やっはろ～！");
  }
}
```
## abstract 継承(extends) 
```java
class Main {
  public static void main(String[] args) {
    // interfaceを実装したクラスのインスタンスを普通に作成
    Person person1 = new Person();
    person1.helloWorld();  // Hello world!!
    person1.hello("John"); // こんにちは！John
  }
}
// 抽象クラスでは実装されてないabstractメソッドを一つ以上持つ
abstract class Animal{
  // こっちは実装されてる
  public void helloWorld(){
    System.out.println("Hello world!!");
  }
  // abstractキーワードで実装せずに継承先でオーバーライドして実装する
  abstract public void hello(String name);
}

// extendsで継承する。
class Person extends Animal{
  // @Overrideで以下のhelloメソッドがオーバーライドだと明言
  @Override
  public void hello(String name){
    System.out.println("こんにちは！" + name);
  }
}
```
## interface 実装(implements)
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
  @Override
  public void hello(String name){
    System.out.println("こんにちは！" + name);
  }
}

class Dog implements Animal{
  @Override
  public void hello(String name){
    System.out.println("わんわん！" + name);
  }
}
```
# geostore
https://github.com/geosolutions-it/geostore  
setupしてるけど`mvn clean install`でビルドはできるっぽいけどそのあとのWebサーバー実行の段階で以下のerrorが出てて解決しない…  
`maven-jetty-plugin:6.1.26:run`のビルドがうまく行ってないっぽいけど解決策がよくわからん…  
```txt
takabayashi@takabayashi-VirtualBox:~/AWAE/geostore/src/web/app$ mvn jetty:run 
WARNING: An illegal reflective access operation has occurred
WARNING: Illegal reflective access by com.google.inject.internal.cglib.core.$ReflectUtils$1 (file:/usr/share/maven/lib/guice.jar) to method java.lang.ClassLoader.defineClass(java.lang.String,byte[],int,int,java.security.ProtectionDomain)
WARNING: Please consider reporting this to the maintainers of com.google.inject.internal.cglib.core.$ReflectUtils$1
WARNING: Use --illegal-access=warn to enable warnings of further illegal reflective access operations
WARNING: All illegal access operations will be denied in a future release
[INFO] Scanning for projects...
[INFO] 
[INFO] --------------< it.geosolutions.geostore:geostore-webapp >--------------
[INFO] Building GeoStore - Webapp 1.7-SNAPSHOT
[INFO] --------------------------------[ war ]---------------------------------
[INFO] 
[INFO] >>> maven-jetty-plugin:6.1.26:run (default-cli) > test-compile @ geostore-webapp >>>
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  4.123 s
[INFO] Finished at: 2021-02-13T02:00:50+09:00
[INFO] ------------------------------------------------------------------------
[ERROR] Failed to execute goal on project geostore-webapp: Could not resolve dependencies for project it.geosolutions.geostore:geostore-webapp:war:1.7-SNAPSHOT: Failed to collect dependencies at it.geosolutions.geostore:geostore-persistence:jar:1.7-SNAPSHOT: Failed to read artifact descriptor for it.geosolutions.geostore:geostore-persistence:jar:1.7-SNAPSHOT: Failure to find it.geosolutions:geostore:pom:1.7-SNAPSHOT in http://maven.geo-solutions.it was cached in the local repository, resolution will not be reattempted until the update interval of geosolutions has elapsed or updates are forced -> [Help 1]
[ERROR] 
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR] 
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/DependencyResolutionException
```

# メモ
# 参考
https://paiza.io/projects/11jytFgPbDyTvWeETVlJ3A?language=java    
ここでWeb上でJavaを実行できる。   
