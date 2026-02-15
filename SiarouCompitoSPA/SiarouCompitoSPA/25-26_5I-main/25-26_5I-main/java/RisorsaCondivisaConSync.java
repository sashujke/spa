import java.util.*;

/*
 * Semplice programma in cui due Thread che accedono ad una
 * risorsa condivisa in modo concorrente.
 * Si utilizza la parola "synchronized" per definire dei blocchi
 * di codice in cui la risorsa condivisa non puo' essere usata
 * da altri thread.
 */

public class RisorsaCondivisaConSync {

    public static void main(String[] args) {
        // risorsa condivisa dai due thread
        List<String> l = new ArrayList<>();
        
        // thread che modifica la risorsa
        new Thread(() -> {
            try {
                while (true) {
                    synchronized (l)  { l.add("Arance"); }
                    Thread.sleep(200);
                }
            } catch (InterruptedException e) {
                System.out.println(e.getMessage());
            }
        }).start();
        
        // thread che legge la risorsa
        new Thread(() -> {
            try {
                while (true) {
                    synchronized (l) {
                        for (String s : l) {
                            System.out.println(s);
                        }    
                    }
                    Thread.sleep(2000); 
                }  
            } catch (InterruptedException e) {
                System.out.println(e.getMessage());
            }
        }).start();
    }
}