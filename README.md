# 🐙 Octopus Deploy Dashboard

Dashboard web in **Next.js** per visualizzare le versioni deployate su Octopus Deploy per ogni combinazione di progetto, tenant e environment, con funzionalità di filtraggio avanzate.

## 📋 Caratteristiche

- **Visualizzazione completa** dei deployment per progetto, environment e tenant
- **Filtri multipli** per progetto, environment, tenant e ricerca testuale
- **Statistiche in tempo reale** sul numero di deployment e risorse
- **Aggiornamento automatico** ogni minuto
- **Design responsive** e moderno
- **API routes Next.js** che risolvono i problemi CORS
- **Container Docker** con configurazione tramite variabili d'ambiente
- **Build ottimizzato** con Next.js standalone output

## 🚀 Avvio Rapido con Docker

### Prerequisiti

- Docker e Docker Compose installati
- Accesso a un'istanza di Octopus Deploy
- API Key di Octopus Deploy con permessi di lettura

### Configurazione

1. Clona il repository:
```bash
git clone <repository-url>
cd octopus-dashboard
```

2. Crea un file `.env` nella root del progetto:
```bash
cp .env.docker .env
```

3. Modifica il file `.env` con i tuoi dati Octopus Deploy:
```env
OCTOPUS_SERVER_URL=https://your-octopus-server.com
OCTOPUS_API_KEY=API-XXXXXXXXXXXXXXXXXXXXXXXXXX
OCTOPUS_SPACE_ID=Spaces-1
```

### Avvio dell'applicazione

```bash
# Costruisci e avvia il container
docker-compose up -d

# Visualizza i log
docker-compose logs -f

# Ferma l'applicazione
docker-compose down
```

L'applicazione sarà disponibile su: **http://localhost:3000**

## 🛠️ Sviluppo Locale

### Prerequisiti

- Node.js 20 o superiore
- npm o yarn

### Installazione

```bash
# Installa le dipendenze
npm install

# Crea il file .env per lo sviluppo
cp .env.example .env
Modifica il file `.env` con le tue credenziali Octopus Deploy:
```env
OCTOPUS_SERVER_URL=https://your-octopus-server.com
OCTOPUS_API_KEY=API-XXXXXXXXXXXXXXXXXXXXXXXXXX
OCTOPUS_SPACE_ID=Spaces-1
```

> **Nota**: Con Next.js, le variabili d'ambiente NON hanno più il prefisso `VITE_`. Le API routes gestiscono le chiamate server-side, risolvendo automaticamente i problemi CORS.E_OCTOPUS_API_KEY=API-XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_OCTOPUS_SPACE_ID=Spaces-1
```

### Avvio in modalità sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile su: **http://localhost:3000**

### Build per produzione

```bash
npm run build
npm run preview
```

## 📖 Come ottenere l'API Key di Octopus Deploy

1. Accedi alla tua istanza di Octopus Deploy
2. Vai al tuo profilo utente (in alto a destra)
3. Seleziona "Profile"
4. Vai alla sezione "My API Keys"
5. Clicca su "New API Key"
6. Dai un nome alla chiave e salva
7. Copia la chiave generata (inizia con `API-`)

### Variabili d'ambiente

| Variabile | Descrizione | Richiesta |
|-----------|-------------|-----------|
| `OCTOPUS_SERVER_URL` | URL del server Octopus Deploy | Sì |
| `OCTOPUS_API_KEY` | API Key per l'autenticazione | Sì |
| `OCTOPUS_SPACE_ID` | ID dello Space Octopus (es. Spaces-1) | Sì |

> **Next.js gestisce CORS**: Le API routes (`/app/api/octopus/route.ts`) fungono da proxy server-side, eliminando i problemi CORS che si verificherebbero con chiamate dirette dal client.
| `OCTOPUS_API_KEY` (Docker)<br>`VITE_OCTOPUS_API_KEY` (Dev) | API Key per l'autenticazione | Sì |
| `OCTOPUS_SPACE_ID` (Docker)<br>`VITE_OCTOPUS_SPACE_ID` (Dev) | ID dello Space Octopus (es. Spaces-1) | Sì |

### Porta personalizzata

Per cambiare la porta dell'applicazione Docker, modifica il file `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Cambia 8080 con la porta desiderata
```
octopus-dashboard/
├── app/
│   ├── api/
│   │   └── octopus/
│   │       └── route.ts      # API route proxy (risolve CORS)
│   ├── globals.css           # Stili globali
│   ├── layout.tsx            # Layout root
│   └── page.tsx              # Home page
├── components/               # Componenti React
│   ├── Dashboard.tsx         # Componente principale
│   ├── FilterBar.tsx         # Barra dei filtri
│   ├── DeploymentTable.tsx   # Tabella deployment
│   └── Stats.tsx             # Statistiche
├── lib/
│   ├── services/             # Servizi API
│   │   ├── octopusClient.ts  # Client HTTP
│   │   └── octopusService.ts # Logica business
│   └── types/                # Definizioni TypeScript
│       └── octopus.ts        # Tipi Octopus
├── Dockerfile                # Build multi-stage Next.js
├── docker-compose.yml        # Orchestrazione container
├── next.config.js            # Configurazione Next.js
├── package.json              # Dipendenze
└── README.md                 # Documentazione
``` docker-compose.yml       # Orchestrazione container
├── docker-entrypoint.sh     # Script di avvio container
├── package.json             # Dipendenze
└── README.md               # Documentazione
```

## 🎨 Funzionalità della Dashboard

### Filtri disponibili

- **Progetto**: Filtra per progetto specifico
- **Environment**: Filtra per environment (Dev, Test, Prod, ecc.)
- **Tenant**: Filtra per tenant specifico
- **Ricerca**: Ricerca testuale su tutti i campi

### Statistiche visualizzate

- Numero di deployment visualizzati (dopo i filtri)
- Totale progetti
- Totale environment
- Totale tenant

### Aggiornamento dati

- Aggiornamento automatico ogni 60 secondi
- Pulsante manuale "Aggiorna Dati"
- Aggiornamento quando la finestra torna in focus

## 🔒 Sicurezza

⚠️ **IMPORTANTE**: Non committare mai il file `.env` con le credenziali reali nel repository!

- Il file `.env` è già incluso in `.gitignore`
- Usa sempre `.env.example` come template
- Per ambienti di produzione, considera l'uso di secrets management tools

## 🐛 Troubleshooting

### CORS Issues

✅ **Problema risolto con Next.js!** Le API routes fungono da proxy server-side, eliminando completamente i problemi CORS. Non è necessaria alcuna configurazione aggiuntiva.erver: {
    proxy: {
      '/api': {
        target: 'https://your-octopus-server.com',
        changeOrigin: true,
      }
    }
  }
})
```

## 📝 Licenza

Questo progetto è fornito "as-is" senza garanzie di alcun tipo.

## 🤝 Contributi

I contributi sono benvenuti! Sentiti libero di aprire issue o pull request.

## 📞 Supporto

Per domande o supporto, apri una issue nel repository.
