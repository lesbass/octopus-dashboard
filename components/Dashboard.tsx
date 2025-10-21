'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OctopusService } from '@/lib/services/octopusService';
import OctopusClient from '@/lib/services/octopusClient';
import { FilterBar } from '@/components/FilterBar';
import { DeploymentTable } from '@/components/DeploymentTable';
import { Stats } from '@/components/Stats';
import type { DeploymentInfo } from '@/lib/types/octopus';

const octopusClient = new OctopusClient();
const octopusService = new OctopusService(octopusClient);

export default function Dashboard() {
  const [filteredDeployments, setFilteredDeployments] = useState<DeploymentInfo[]>([]);

  const { data: deployments = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => octopusService.getDeploymentInfo(),
    refetchInterval: 60000, // Refresh ogni minuto
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">Caricamento dei deployment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h3>❌ Errore di Connessione</h3>
          <p>
            Impossibile connettersi a Octopus Deploy. 
            Verifica la configurazione e la connettività.
          </p>
          <p style={{ marginTop: '10px', fontSize: '13px' }}>
            <strong>Dettagli:</strong> {(error as Error).message}
          </p>
          <button className="refresh-button" onClick={() => refetch()}>
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🐙 Octopus Deploy Dashboard</h1>
        <p>Visualizza le versioni deployate per progetto, environment e tenant</p>
      </header>

      <Stats deployments={deployments} filteredDeployments={filteredDeployments} />

      <FilterBar
        deployments={deployments}
        onFilterChange={setFilteredDeployments}
      />

      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="refresh-button" 
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? '🔄 Aggiornamento...' : '🔄 Aggiorna Dati'}
        </button>
      </div>

      <DeploymentTable deployments={filteredDeployments} />
    </div>
  );
}
