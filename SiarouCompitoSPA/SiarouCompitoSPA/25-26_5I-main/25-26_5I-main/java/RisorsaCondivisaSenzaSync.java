import java.util.*;

/*
 * Semplice programma in cui due Thread che accedono ad una
 * risorsa condivisa in modo concorrente.
 * Non utilizza synchronized quindi, prima o poi, i due Thread
 * cercheranno di accedere contemporaneamente alla risorsa 
 * condivisa ed il programma andra' in errore.
 */

public class RisorsaCondivisaSenzaSync {

    public static void main(String[] args) {
        // risorsa condivisa dai due thread
        List<String> l = new ArrayList<>();
        
        // thread che modifica la risorsa
        new Thread(() -> {
            try {
                while (true) {
                    // scrittura della risorsa condivisa
                    l.add("Arance");
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
                    // lettura della risorsa condivisa
                    for (String s : l) {
                        System.out.println(s);
                    }
                    Thread.sleep(2000); 
                }  
                
            } catch (InterruptedException e) {
                System.out.println(e.getMessage());
            }
        }).start();
    }
}