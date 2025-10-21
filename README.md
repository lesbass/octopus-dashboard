# Octopus Dashboard

Next.js dashboard for monitoring Octopus Deploy deployments.

## Running Locally

### With npm

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```env
   OCTOPUS_SERVER_URL=https://your-octopus-server.com
   OCTOPUS_API_KEY=API-XXXXXXXXXXXXXXXXXXXXXXXXXX
   OCTOPUS_SPACE_ID=Spaces-1
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

### With Docker Compose

1. Create a `.env` file:
   ```env
   OCTOPUS_SERVER_URL=https://your-octopus-server.com
   OCTOPUS_API_KEY=API-XXXXXXXXXXXXXXXXXXXXXXXXXX
   OCTOPUS_SPACE_ID=Spaces-1
   ```

2. Start the container:
   ```bash
   docker compose up
   ```

3. Open [http://localhost:3000](http://localhost:3000)
