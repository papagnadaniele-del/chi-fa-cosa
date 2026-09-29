# Pannello Admin

## Obiettivo
Creare un’area amministrativa visibile esclusivamente agli amministratori e spostare al suo interno la gestione degli utenti.

## Modifiche
- Aggiungere la pagina `/admin` con intestazione dedicata e navigazione interna.
- Inserire la scheda **Utenti** nel pannello, mantenendo tutte le funzioni esistenti: creazione, modifica, ruoli, password ed eliminazione.
- Sostituire nel programma il collegamento **Utenti** con **Admin**.
- Rimuovere il vecchio accesso diretto `/utenti`, evitando due pagine duplicate.
- Proteggere la pagina anche nell’interfaccia: chi non è amministratore vede un avviso e può tornare al programma.
- Verificare apertura del pannello, gestione utenti e resa su schermi stretti.

## Dettagli tecnici
- La protezione dei dati resta invariata e continua a essere verificata dal server.
- La nuova pagina riutilizza le funzioni amministrative già presenti, senza modificare utenti o dati esistenti.
