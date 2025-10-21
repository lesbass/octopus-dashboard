# Octopus Deploy Dashboard - Guida Rapida

## Avvio con Docker (Consigliato)

1. **Configura le variabili d'ambiente**
   ```bash
   cp .env.docker .env
   nano .env  # Modifica con le tue credenziali Octopus
   ```

2. **Avvia l'applicazione**
   ```bash
   docker-compose up -d
   ```

3. **Accedi alla dashboard**
   - Apri il browser su: http://localhost:3000

## Avvio in Sviluppo

1. **Installa le dipendenze**
   ```bash
   npm install
   ```

2. **Configura le variabili d'ambiente**
   ```bash
   cp .env.example .env
   nano .env  # Modifica con le tue credenziali Octopus
   ```

3. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

## Variabili d'Ambiente Richieste

- `OCTOPUS_SERVER_URL`: URL del tuo server Octopus Deploy
- `OCTOPUS_API_KEY`: La tua API Key di Octopus
- `OCTOPUS_SPACE_ID`: L'ID dello Space (es. Spaces-1)

## Comandi Utili

```bash
# Build per produzione
npm run build

# Preview build di produzione
npm run preview

# Logs del container Docker
docker-compose logs -f

# Ferma il container
docker-compose down

# Ricostruisci il container dopo modifiche
docker-compose up -d --build
```

## Supporto

Per maggiori dettagli, consulta il file README.md completo.
