
# TaxiTime - Manuale Utente

## Panoramica

TaxiTime è un sistema completo per la gestione di servizi taxi aziendali. Questo manuale spiega come utilizzare tutte le funzionalità del sistema in base al ruolo utente.

## Indice

- [Accesso al Sistema](#accesso-al-sistema)
- [Dashboard Principale](#dashboard-principale)
- [Ruoli e Permessi](#ruoli-e-permessi)
- [Gestione Servizi](#gestione-servizi)
- [Gestione Aziende](#gestione-aziende)
- [Report e PDF](#report-e-pdf)
- [Gestione Utenti](#gestione-utenti)
- [Impostazioni](#impostazioni)
- [FAQ e Troubleshooting](#faq-e-troubleshooting)

## Accesso al Sistema

### Login

1. Vai alla pagina di login
2. Inserisci email e password fornite dall'amministratore
3. Clicca "Accedi"

### Primo Accesso

Al primo accesso ti verrà chiesto di:
- Confermare la password
- Completare il profilo se necessario

### Password Dimenticata

1. Clicca "Password dimenticata" nella pagina di login
2. Inserisci la tua email
3. Controlla la tua casella email per il link di reset
4. Segui le istruzioni per creare una nuova password

## Dashboard Principale

La dashboard mostra informazioni diverse in base al tuo ruolo:

### Dashboard Amministratore/Socio
- Riepilogo servizi del giorno
- Statistiche mensili
- Servizi in attesa di assegnazione
- Report recenti
- Collegamenti rapidi alle funzioni principali

### Dashboard Cliente
- I tuoi servizi del mese
- Servizi in corso
- Report mensili disponibili
- Contatti di supporto

### Dashboard Dipendente
- Servizi assegnati oggi
- Servizi da completare
- Storico dei tuoi servizi

## Ruoli e Permessi

### Amministratore
- **Accesso completo** a tutte le funzioni
- Gestione utenti e aziende
- Configurazione sistema
- Creazione e assegnazione servizi
- Generazione report

### Socio
- Gestione servizi e aziende
- Assegnazione autisti
- Generazione report
- Visualizzazione statistiche

### Cliente
- Visualizzazione propri servizi
- Download report mensili
- Richiesta nuovi servizi (se abilitato)

### Dipendente
- Visualizzazione servizi assegnati
- Completamento servizi
- Raccolta firme digitali

## Gestione Servizi

### Visualizzazione Servizi

#### Lista Servizi
1. Vai su **Servizi** nel menu principale
2. Usa i filtri per trovare servizi specifici:
   - **Azienda**: Filtra per azienda cliente
   - **Stato**: Da assegnare, Assegnato, In corso, Completato, Consuntivato
   - **Data**: Range di date
   - **Autista**: Servizi assegnati a specifico autista

#### Dettaglio Servizio
Clicca su un servizio per vedere:
- **Info Generali**: Indirizzi, orari, importi
- **Passeggeri**: Lista passeggeri con contatti
- **Firma Digitale**: Firma raccolta (se presente)

### Creazione Nuovo Servizio

1. Clicca **"Nuovo Servizio"**
2. Compila i campi obbligatori:
   - **Azienda Cliente**
   - **Referente Azienda**
   - **Data e Ora Servizio**
   - **Indirizzo di Partenza**
   - **Indirizzo di Destinazione**
   - **Metodo di Pagamento**
   - **Importo Previsto**

3. Aggiungi passeggeri:
   - Nome e cognome
   - Telefono
   - Email (opzionale)
   - Indirizzo personalizzato (se diverso dal servizio)

4. Aggiungi note se necessarie
5. Clicca **"Crea Servizio"**

### Assegnazione Servizio

1. Trova il servizio da assegnare
2. Clicca **"Assegna"**
3. Scegli tra:
   - **Dipendente Interno**: Seleziona dalla lista
   - **Conducente Esterno**: Inserisci nome e contatti
4. Clicca **"Assegna Servizio"**

### Completamento Servizio

#### Per Autisti Dipendenti:
1. Vai ai tuoi servizi assegnati
2. Clicca **"Completa"** sul servizio
3. Compila:
   - **Orario effettivo di inizio/fine**
   - **Chilometri percorsi** (se richiesti)
   - **Note aggiuntive**
4. Raccogli **firma digitale** del cliente (se richiesta)
5. Clicca **"Completa Servizio"**

#### Raccolta Firma Digitale:
1. Abilita la modalità firma
2. Fai firmare il cliente sullo schermo
3. Clicca **"Salva Firma"**
4. La firma viene automaticamente associata al servizio

### Consuntivazione Servizio

#### Solo per Admin/Socio:
1. Trova servizio completato
2. Clicca **"Consuntiva"**
3. Verifica/modifica:
   - **Incasso effettivo**
   - **Ore lavorate**
   - **Metodo di pagamento finale**
   - **Note amministrative**
4. Clicca **"Consuntiva Servizio"**

Il servizio passa allo stato "Consuntivato" e può essere incluso nei report.

## Gestione Aziende

### Lista Aziende

1. Vai su **Aziende** nel menu
2. Visualizza tutte le aziende clienti con:
   - Nome e Partita IVA
   - Contatti
   - Numero servizi del mese
   - Stato firma digitale

### Creazione Nuova Azienda

1. Clicca **"Nuova Azienda"**
2. Compila:
   - **Nome Azienda** (obbligatorio)
   - **Partita IVA** (obbligatorio)
   - **Email** e **Telefono**
   - **Indirizzo**
3. Configura:
   - **Firma Digitale Attiva**: Se abilitare raccolta firme
4. Clicca **"Crea Azienda"**

### Gestione Referenti

1. Entra nel dettaglio azienda
2. Vai al tab **"Referenti"**
3. Per aggiungere referente:
   - Clicca **"Aggiungi Referente"**
   - Cerca utente esistente o crea nuovo
   - Assegna ruolo "Cliente"
4. Per rimuovere: clicca icona cestino

## Report e PDF

### Generazione Report Mensile

#### Solo per Admin/Socio:
1. Vai su **Report** nel menu
2. Clicca **"Genera Report"**
3. Seleziona:
   - **Azienda**
   - **Referente**
   - **Mese** e **Anno**
4. Il sistema mostra automaticamente i servizi consuntivati
5. Clicca **"Genera Report PDF"**

Il report viene generato in background e salvato automaticamente.

### Download Report

1. Nella lista report, clicca icona **download**
2. Il file PDF viene scaricato automaticamente
3. Il report include:
   - Intestazione azienda
   - Tabella dettagliata servizi
   - Firme digitali (se presenti)
   - Totali e riepiloghi

### Eliminazione Report

#### Solo per Admin:
1. Clicca icona **cestino** sul report
2. Conferma eliminazione
3. Il file viene rimosso definitivamente

## Gestione Utenti

### Solo per Amministratori

#### Creazione Nuovo Utente

1. Vai su **Utenti** nel menu
2. Clicca **"Nuovo Utente"**
3. Compila:
   - **Nome** e **Cognome**
   - **Email** (deve essere unica)
   - **Password** temporanea
   - **Ruolo**: Admin, Socio, Cliente, Dipendente
   - **Azienda** (per clienti)
4. Clicca **"Crea Utente"**

#### Modifica Utente

1. Trova utente nella lista
2. Clicca **"Modifica"**
3. Aggiorna informazioni necessarie
4. Clicca **"Salva Modifiche"**

#### Eliminazione Utente

1. Clicca icona **cestino**
2. Conferma eliminazione
3. ⚠️ **Attenzione**: L'eliminazione è permanente

## Impostazioni

### Solo per Amministratori

#### Informazioni Azienda

1. Vai su **Impostazioni**
2. Tab **"Info Azienda"**
3. Configura:
   - Nome azienda
   - Partita IVA
   - Indirizzo sede
   - Contatti

#### Metodi di Pagamento

1. Tab **"Metodi di Pagamento"**
2. Aggiungi/rimuovi metodi:
   - Contanti
   - Bonifico
   - Carta di credito
   - Fatturazione

#### Aliquote IVA

1. Tab **"Aliquote IVA"**
2. Configura percentuali IVA:
   - Standard (22%)
   - Ridotta (10%)
   - Altre aliquote personalizzate

## FAQ e Troubleshooting

### Domande Frequenti

#### Q: Non riesco ad accedere al sistema
**A:** 
- Verifica email e password
- Controlla che l'account sia attivo
- Prova il reset password
- Contatta l'amministratore

#### Q: Non vedo alcuni servizi
**A:**
- Verifica i filtri applicati
- Controlla i permessi del tuo ruolo
- Assicurati di essere nella data corretta

#### Q: La firma digitale non funziona
**A:**
- Verifica che sia abilitata per l'azienda
- Controlla che il browser supporti il touch
- Prova a ricaricare la pagina
- Usa un dispositivo diverso

#### Q: Il report non si genera
**A:**
- Verifica che ci siano servizi consuntivati nel periodo
- Controlla la connessione internet
- Riprova dopo alcuni minuti
- Contatta il supporto se persiste

#### Q: Non riesco a modificare un servizio
**A:**
- Verifica lo stato del servizio
- Controlla i tuoi permessi
- Alcuni campi non sono modificabili dopo la consuntivazione

### Problemi Tecnici Comuni

#### Browser Non Supportato
- **Chrome**: Versione 90+
- **Firefox**: Versione 88+
- **Safari**: Versione 14+
- **Edge**: Versione 90+

#### Connessione Lenta
- Controlla la connessione internet
- Prova a ricaricare la pagina
- Chiudi altri tab del browser

#### Errori di Salvataggio
- Verifica tutti i campi obbligatori
- Controlla formati date/orari
- Riprova dopo aver ricaricato

### Contatti Supporto

#### Supporto Tecnico
- **Email**: support@taxitime.com
- **Telefono**: +39 XXX XXX XXXX
- **Orari**: Lun-Ven 9:00-18:00

#### Supporto Utenti
- **Email**: help@taxitime.com
- **Chat**: Disponibile in app (icona in basso a destra)

### Best Practices

#### Sicurezza
- Cambia password regolarmente
- Non condividere credenziali
- Esci sempre al termine della sessione
- Non lasciare il sistema incustodito

#### Efficienza
- Usa i filtri per trovare rapidamente i servizi
- Completa i servizi subito dopo l'esecuzione
- Controlla i report mensili regolarmente
- Mantieni aggiornati i contatti clienti

#### Qualità Dati
- Inserisci sempre indirizzi completi
- Verifica numeri di telefono
- Aggiungi note utili per il servizio
- Mantieni aggiornate le informazioni aziende

---

## Appendici

### Glossario Termini

- **Servizio**: Corsa taxi con partenza, destinazione e passeggeri
- **Consuntivazione**: Processo di chiusura contabile del servizio
- **Referente**: Persona di contatto presso l'azienda cliente
- **Firma Digitale**: Firma raccolta su dispositivo touch
- **RLS**: Row Level Security - sistema di sicurezza database

### Codici Stato Servizio

- **Da Assegnare**: Servizio creato, in attesa di autista
- **Assegnato**: Autista assegnato, servizio programmato
- **In Corso**: Servizio in esecuzione
- **Completato**: Servizio terminato, in attesa consuntivazione
- **Consuntivato**: Servizio chiuso contabilmente

---

**Versione Manuale**: 1.0  
**Ultimo Aggiornamento**: Gennaio 2025  
**Compatibilità Sistema**: TaxiTime v1.0+
