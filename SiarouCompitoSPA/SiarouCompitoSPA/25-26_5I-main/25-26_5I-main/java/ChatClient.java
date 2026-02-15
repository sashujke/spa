import java.io.*;
import java.net.*;
import java.util.*;

public class ChatClient {

    public static void main(String[] args) {
        try (
            Socket sock = new Socket("127.0.0.1", ChatServer.PORT);
            BufferedReader in = new BufferedReader(
                new InputStreamReader(sock.getInputStream())
            );
            BufferedWriter out = new BufferedWriter(
                new OutputStreamWriter(sock.getOutputStream())
            );
            BufferedReader tastiera = new BufferedReader(
                new InputStreamReader(System.in)
            );
        ) {
            // stampa i messaggi in arrivo dal server
            new Thread(() -> {
                while (true) {
                    try {
                        String msg = in.readLine();
                        if (msg == null) break;
                        System.out.println(msg);
                    } catch (IOException | NoSuchElementException e) {
                        System.out.println(e.getMessage());
                        break;
                    }
                }
            }).start();

            // manda al server i messaggi inseriti da tastiera
            String msgToServer = tastiera.readLine();
            while (!msgToServer.equals("/exit")) {
                out.write(msgToServer + "\n"); out.flush();
                msgToServer = tastiera.readLine();
            }
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
    }
}