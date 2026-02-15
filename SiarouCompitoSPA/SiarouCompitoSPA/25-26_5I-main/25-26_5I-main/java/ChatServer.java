
import java.io.*;
import java.net.*;
import java.util.*;

public class ChatServer {

    public final static int PORT = 1337;

    public static void main(String[] args) throws IOException {
        List<Socket> clients = new ArrayList<>();

        ServerSocket server = new ServerSocket(PORT);
        System.out.println("In ascolto sulla porta " + PORT);

        // thread principale (main thread)
        // accetta nuove connessioni TCP e fa partire
        // un thread per ogni client che si collega
        while (true) {
            try {
                Socket sock = server.accept();
                synchronized (clients) { clients.add(sock); }
                // per ogni client che si connette faccio partire un thread
                startClientThread(sock, clients);
                System.out.println("Nuovo client: " + sock.getRemoteSocketAddress());
            } catch (IOException e) {
                System.out.println("Errore accept: " + e.getMessage());
                break;
            }
        }

        server.close();
    }

    private static void startClientThread(Socket sock, List<Socket> clients) {
        new Thread(() -> {
            try (
                    BufferedReader in = new BufferedReader(
                        new InputStreamReader(sock.getInputStream()));
                    BufferedWriter out = new BufferedWriter(
                        new OutputStreamWriter(sock.getOutputStream()));
            ) {
                // chiedo al client il suo nome
                out.write("Come ti chiami?\n"); out.flush();
                // out.flush() serve per garantire che i dati passati alla write
                // vengano mandati immediatamente sul socket (normalmente BufferedWriter
                // aspetta che il buffer sia pieno prima di mandare i dati)

                String name = in.readLine();
                out.write("Ciao " + name + ", benvenuto nella chat!\n"); out.flush();

                // ogni volta che ricevo un messaggio da un client
                // lo inoltro a tutti gli altri client
                while (true) {
                    String msg = in.readLine();
                    if (msg == null) break; // connessione chiusa dal client
                    broadcastMessage(name + "> " + msg, sock, clients);
                }
            } catch (IOException | NoSuchElementException e) {
                System.out.println("Errore client: " + e.getMessage());
            } finally {
                System.out.println("Client uscito: " + sock.getRemoteSocketAddress());
                synchronized (clients) { clients.remove(sock); }
            }
        }).start();
    }

    private static void broadcastMessage(String msg, Socket sender, List<Socket> clients) throws IOException {
        synchronized (clients) {
            for (Socket receiver : clients) {
                if (!receiver.equals(sender)) {
                    BufferedWriter out = new BufferedWriter(
                        new OutputStreamWriter(receiver.getOutputStream()));
                    out.write(msg + "\n"); out.flush();
                }
            }
        }
    }
}
