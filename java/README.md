<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [配列](#%E9%85%8D%E5%88%97)
- [class](#class)
  - [abstract 継承(extends)](#abstract-%E7%B6%99%E6%89%BFextends)
  - [interface 実装(implements)](#interface-%E5%AE%9F%E8%A3%85implements)
- [サーブレット](#%E3%82%B5%E3%83%BC%E3%83%96%E3%83%AC%E3%83%83%E3%83%88)
  - [フォルダ構成](#%E3%83%95%E3%82%A9%E3%83%AB%E3%83%80%E6%A7%8B%E6%88%90)
    - [WEB-INF](#web-inf)
    - [META-INF](#meta-inf)
    - [APP-INF](#app-inf)
    - [$CATALINA_HOME](#catalina_home)
  - [HttpServlet /  HttpServletRequest](#httpservlet---httpservletrequest)
  - [session](#session)
  - [routes](#routes)
  - [Filter](#filter)
  - [JMX](#jmx)
- [JavaWebApplicationStepByStep](#javawebapplicationstepbystep)
  - [実行](#%E5%AE%9F%E8%A1%8C)
  - [http](#http)
- [geostore](#geostore)
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
interfaceを実装したクラスの型(DogとかPerson)でinferfaceを実装したクラスのインスタンス(dog1とかperson1)を受け取ることもできるし、  
interfaceを定義したクラス(Animal)の型でinferfaceを実装したクラスのインスタンス(dog1とかperson1)を受け取ることもできる！！！！！！！！  
```java
class Main {
  public static void main(String[] args) {
    // interfaceを実装したクラスのインスタンスを普通に作成
    Person person1 = new Person();
    Dog dog1 = new Dog();
    
    person1.hello("John"); // こんにちは！John
    dog1.hello("犬");      // わんわん！犬

    Animal animal1 = new Dog();
    animal1.hello(""); // わんわん！
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
# サーブレット
https://www.fujitsu.com/jp/group/fap/services/java-education-kc/course/technology/web-apl/  
JSPのわかりやすい解説。  
https://www.javadrive.jp/servlet/  
JSPのわかりやすい解説。  
https://www.atmarkit.co.jp/ait/articles/1607/01/news163_3.html  
doGetとかのわかりやすい説明。  

## フォルダ構成
`jar`ファイルは複数の`.java`がコンパイルされた`.class`実行可能ファイルをまとめたもの。  
`war`ファイルはwebアプリケーション本体でサーバーサイドのクラスや静的コンテンツなどが含まれる。  
`ear`ファイルは`war`ファイルをまとめたもの。`application.xml`を含める。  
### WEB-INF
`WEB-INF`に`web.xml`がある。  
`war`ファイルの中でURLマッピングとか使用するクラス名とかが定義されてる？  

```xml
<web-app>

  <servlet>
    <servlet-name>サーブレットの命名</servlet-name>
    <servlet-class>パッケージ名.サーブレット名</servlet-class>
  </servlet>

  <servlet-mapping>
    <servlet-name>サーブレットの命名</servlet-name>
    <url-pattern>/URLのパターン名</url-pattern>
  </servlet-mapping>

</web-app>
```
https://qiita.com/takahirocook/items/d41a92bd36807d456f82  
### META-INF
実行可能jarファイルを作るには、jarファイル内のマニフェストファイル`MANIFEST.MF`に実行するクラス（メインクラス ：Main-Class）を指定する  
`ear`ファイルの`META-INF`に`application.xml`がある。  
```txt
<web-uri>使用するモジュール(warファイルの名前).war</web-uri>

<role-name>User</role-name>
<role-name>Administrator</role-name>

<library-directory>APP-INF/lib</library-directory>
```
https://docs.oracle.com/cd/F25597_01/document/products/wls61/programming/app_xml.html  

`war`ファイルの`META-INF`には`context.xml`がある。  
### APP-INF
使用するライブラリが`/lib`とかに複数存在するっぽい。  
外部ライブラリとは限らないっぽい？使うやつはとりあえず突っ込む？  

### $CATALINA_HOME
`/webapps`に１まとまりのアプリケーションの動作に必要なJSP、サーブレット、HTML、画像、jar、web.xmlなどが含まれる。  
CATALINAとはサーブレットコンテナ、JASPERとはJSPを処理するサーブレットで、`$CATALINA_HOME`は`/webapps`があるディレクトリ？TOMCATのインストールディレクトリでもある    
デフォルトのディレクトリ構成は以下で、`ROOT`がwebroot。  
つまり`/manager`とかにアクセスしてログインすればwarファイルをアップロードできる  
ログインできるユーザーは`conf/tomcat-users.xml`に書かれている。  
```txt
$ ls webapps/
docs  host-manager  manager  ROOT
```
https://www.bigbang.mydns.jp/tomcat-context.xml-x.htm  

## HttpServlet /  HttpServletRequest
以下みたいにしてHttpServletインターフェースを実装して使用する。  
`doGet`,`doPost`を使う。  
`request.getParameter("name")`のようにして送信されたパラメータ値を取り出す。  
`request.getCookies();`でクライアントから送信されてきたCookieを取得する。  
https://www.javadrive.jp/servlet/ini/index4.html  
https://qiita.com/freeworker1105/items/39eceec8d08e19f56d76  
リダイレクトは  
`((HttpServletResponse)response).sendRedirect("/Login");`とか  
`request.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(request, response);`  
  
`doGet(HttpServletRequest request,HttpServletResponse response)`とかの引数は`HttpServletRequest`インターフェースを実装したクラスのインスタンス`request`を親クラスの`HttpServletRequest`型で渡している。  
これでリクエストの内容を引数に渡してオーバーライドした`doGet`内でいろいろ処理できる。  
```java
@WebServlet(urlPatterns = "/login.do")
public class LoginServlet extends HttpServlet {

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		request.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(
				request, response);
	}

	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
        String name = request.getParameter("name");
	}

}
```
https://spring.pleiades.io/specifications/platform/8/apidocs/javax/servlet/http/httpservletrequest  
## session
```java
public class SessionTest7 extends HttpServlet {
  public void doGet(HttpServletRequest request, HttpServletResponse response)
    throws IOException, ServletException{
    HttpSession session = request.getSession(true);  // sessionをサーバー上に作成
    String session_id = session.getId();  // JSESSIONIDの値を取得

```
`request.getSession().setAttribute("name", name);`でセッションに値を保存できる。  
https://www.javadrive.jp/servlet/session/index7.html  
http://itdoc.hitachi.co.jp/manuals/3020/30203M0360/EM030096.HTM  
https://www.javadrive.jp/servlet/dispatch/index3.html  
## routes
Annotationかweb.xmlに書くかで実装するらしい。  
```java
@WebServlet("/url-pattern")
```
サーブレットでのマッピングは以下。  
https://eng-entrance.com/servlet-web-annotation  
## Filter
`Filter`インターフェースを実装して、`doFilter`メソッドを定義して使う。`doFilter`メソッドはFilterインターフェースを実装したフィルタクラスがフィルタとして呼び出された時に実行されるメソッド。  
`FilterChain`インターフェースは一つ目のフィルター処理を実行した後は次はどのフィルター処理を実行するのか、みたいなことを管理しているらしい。  
フィルター処理を実行した後にとりあえず`chain.doFilter`メソッドを呼び出せば次のフィルタ(もしあれば)を実行する処理に移る？  
```java
import java.io.*;
import javax.servlet.*;
import javax.servlet.Filter;
import javax.servlet.FilterChain;

public class FilterTest implements Filter{
  public void doFilter(ServletRequest request, ServletResponse response,
    FilterChain chain){

    try{
      /* フィルタで行う処理 */
      if (認証が行われている) then{
        // FilterChainインターフェースで定義されている"doFilter"メソッドを呼び出す
        chain.doFilter(request, response);
      }else{
        // 認証されてなければそもそも次のフィルタ処理に行かないでログイン画面にリダイレクト
        ((HttpServletResponse)response).sendRedirect("/Login");
      }
    }catch (ServletException se){
    }catch (IOException e){
    }
  }

  public void init(FilterConfig filterConfig) throws ServletException{
  }

  public void destroy(){
  }
}
```
https://www.javadrive.jp/servlet/filter/index3.html  

## JMX
`.jar`ファイルをJD-GUIでデコンパイルした結果に`META-INF`内に`com`,`jsp`,`jmx.class`の3つのデコンパイル結果がそれぞれ出てるけど多分`com`がサーブレット関連の主なやつで`jsp`がJSPで`jmx`がJavaプロセスにアクセスしてJavaVM内のMBeanサーバへ接続して情報を取得したりするやつ？？  
なんもわからん  
https://gihyo.jp/dev/serial/01/java-system-operation/0004  

# jd-gui
jarとかwar,earファイルのデコンパイルして出力するツール。  
jd-guiでメソッドをクリックしたときにリンクが出ないとそのWARファイル内では定義されてないことになるらしい  

# JavaWebApplicationStepByStep
ガチ基本で良さげなシンプルなサーブレット。  
https://github.com/in28minutes/JavaWebApplicationStepByStep  
## 実行
ソースをgithubからcloneして、`pom.xml`上で`mvn clean install`,`mvn tomcat7:run`  
Eclipse上で構築とかは以下に描いてる。  
https://github.com/in28minutes/SpringIn28Minutes/blob/master/InstallationGuide-JavaEclipseAndMaven_v2.pdf  
## http

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
ここら辺ちゃんとまとめたい。  
```txt
Generics  
Attribute  
クロージャ  
プリミティブ型  
コレクション  
```
# 参考
https://paiza.io/projects/11jytFgPbDyTvWeETVlJ3A?language=java    
ここでWeb上でJavaを実行できる。   
https://www.fujitsu.com/jp/group/fap/services/java-education-kc/course/technology/web-apl/  
JSPのわかりやすい解説。  
https://www.javadrive.jp/servlet/  
JSPのわかりやすい解説。  
http://www.tohoho-web.com/java/index.htm  
とほほのわかりやすいやつ。  
