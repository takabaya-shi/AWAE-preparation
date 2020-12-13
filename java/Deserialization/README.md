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
```

