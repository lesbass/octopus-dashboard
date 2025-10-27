# Octopus Dashboard

Next.js dashboard for monitoring Octopus Deploy deployments with an interactive 3D visualization.

## Features

- 📊 **Table View**: Traditional table display of deployments
- 🎲 **3D Cube Visualization**: Interactive Three.js visualization showing the 3-dimensional relationship between Projects, Tenants, and Environments
- 🔍 **Filtering**: Filter deployments by project, environment, tenant, or version
- 📈 **Statistics**: Real-time stats on deployments and versions
- 🔄 **Auto-refresh**: Automatic data refresh every minute

### 3D Visualization

The 3D view represents your deployment data as a cube where:
- **X-axis (Blue)**: Projects
- **Y-axis (Green)**: Environments  
- **Z-axis (Orange)**: Tenants

Each intersection point shows:
- 🟢 **Green cube**: Deployment exists (hover for details)
- 🔴 **Red cube**: No deployment yet

**Controls**:
- **Rotate**: Click and drag
- **Zoom**: Scroll wheel
- **Pan**: Right-click and drag (or two-finger drag)
- **Hover**: View deployment details

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
   ENV_ORDER=Development,Staging,Production
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
   ENV_ORDER=Development,Staging,Production
   ```

2. Start the container:
   ```bash
   docker compose up
   ```

3. Open [http://localhost:3005](http://localhost:3005)
