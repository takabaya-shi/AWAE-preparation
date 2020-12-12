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
## override

# メモ
# 参考
