
import React from 'react';
import { Step } from 'react-joyride';

// Tour per la Dashboard principale (admin/socio)
export const dashboardSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Benvenuto in TaxiTime!</h3>
        <p>Questo tour ti guiderà attraverso le funzionalità principali della piattaforma.</p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: '[data-tour="sidebar"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Menu di Navigazione</h3>
        <p>Usa la sidebar per navigare tra le diverse sezioni: Servizi, Utenti, Aziende, Turni e Spese.</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="users-card"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Gestione Utenti</h3>
        <p>Da qui puoi gestire tutti gli utenti del sistema: amministratori, soci, dipendenti e clienti.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="companies-card"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Gestione Aziende</h3>
        <p>Gestisci le aziende clienti e i loro referenti per organizzare i servizi.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="shifts-card"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Organizzazione Turni</h3>
        <p>Pianifica e gestisci i turni di lavoro del personale con il calendario integrato.</p>
      </div>
    ),
    placement: 'bottom',
  },
];

// Tour per la pagina Utenti
export const usersPageSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Gestione Utenti</h3>
        <p>In questa pagina puoi visualizzare, creare e gestire tutti gli utenti del sistema.</p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: '[data-tour="add-user-btn"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Aggiungi Nuovo Utente</h3>
        <p>Clicca qui per creare un nuovo utente. Potrai scegliere il ruolo (admin, socio, dipendente, cliente) e assegnarlo a un'azienda se necessario.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="users-table"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Lista Utenti</h3>
        <p>Qui vedi tutti gli utenti registrati. Puoi modificare i loro dati, resettare le password o eliminarli.</p>
      </div>
    ),
    placement: 'top',
  },
];

// Tour per la Dashboard Cliente
export const clientDashboardSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Benvenuto nella Dashboard Cliente!</h3>
        <p>Da qui puoi gestire i tuoi servizi e accedere ai report.</p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: '[data-tour="new-service-card"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Richiedi Servizio</h3>
        <p>Clicca qui per richiedere un nuovo servizio taxi specificando data, orario e dettagli del trasporto.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="my-services-card"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">I Miei Servizi</h3>
        <p>Visualizza lo storico di tutti i servizi richiesti e il loro stato attuale.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="reports-card"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Report Mensili</h3>
        <p>Accedi ai report mensili dei servizi utilizzati e ai relativi costi.</p>
      </div>
    ),
    placement: 'bottom',
  },
];

// Tour per la pagina Veicoli
export const veicoliPageSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Gestione Flotta Veicoli</h3>
        <p>In questa sezione puoi gestire tutti i veicoli della tua flotta taxi.</p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: '[data-tour="add-vehicle-btn"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Aggiungi Veicolo</h3>
        <p>Clicca qui per aggiungere un nuovo veicolo alla flotta. Dovrai inserire targa, modello e altre informazioni tecniche.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="vehicles-list"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Lista Veicoli</h3>
        <p>Qui vedi tutti i veicoli registrati. Puoi modificarne i dati o rimuoverli dalla flotta.</p>
      </div>
    ),
    placement: 'top',
  },
];
