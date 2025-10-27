'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { OctopusService } from '@/lib/services/octopusService';
import OctopusClient from '@/lib/services/octopusClient';
import { FilterBar } from '@/components/FilterBar';
import { DeploymentTable } from '@/components/DeploymentTable';
import { Stats } from '@/components/Stats';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { DeploymentInfo, Project, Environment, Tenant } from '@/lib/types/octopus';

// Dynamically import 3D view to avoid SSR issues with Three.js
const Deployment3DView = dynamic(
  () => import('@/components/Deployment3DView'),
  { 
    ssr: false,
    loading: () => (
      <div className="view-3d-container">
        <div className="loading">Loading 3D visualization...</div>
      </div>
    )
  }
);

const octopusClient = new OctopusClient();
const octopusService = new OctopusService(octopusClient);

type ViewMode = 'table' | '3d';

export default function Dashboard() {
  const [filteredDeployments, setFilteredDeployments] = useState<DeploymentInfo[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => octopusService.getCompleteDeploymentData(),
    refetchInterval: 60000, // Refresh every minute
    refetchOnWindowFocus: true,
  });

  const deployments = data?.deployments || [];
  const allProjects = data?.allProjects || [];
  const allEnvironments = data?.allEnvironments || [];
  const allTenants = data?.allTenants || [];
  const envOrder = data?.envOrder || '';
  const infeasibleCombinations = data?.infeasibleCombinations;

  // Check if any filters are active
  const hasActiveFilters = filteredDeployments.length !== deployments.length;

  // Auto-switch to table view when filters are applied
  const handleFilterChange = (filtered: DeploymentInfo[]) => {
    setFilteredDeployments(filtered);
    // If filters are active and user is on 3D view, switch to table view
    if (filtered.length !== deployments.length && viewMode === '3d') {
      setViewMode('table');
    }
  };

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">Loading deployments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h3>❌ Connection Error</h3>
          <p>
            Unable to connect to Octopus Deploy. 
            Please check your configuration and connectivity.
          </p>
          <p style={{ marginTop: '10px', fontSize: '13px' }}>
            <strong>Details:</strong> {(error as Error).message}
          </p>
          <button className="refresh-button" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>🐙 Octopus Deploy Dashboard</h1>
            <p>View deployed versions by project, environment and tenant</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <Stats deployments={deployments} filteredDeployments={filteredDeployments} />

      <FilterBar
        deployments={deployments}
        onFilterChange={handleFilterChange}
      />

      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="view-toggle">
          <button 
            className={`toggle-button ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📊 Table View
          </button>
          <button 
            className={`toggle-button ${viewMode === '3d' ? 'active' : ''}`}
            onClick={() => setViewMode('3d')}
            disabled={hasActiveFilters}
            title={hasActiveFilters ? '3D view is disabled when filters are active' : ''}
          >
            🎲 3D View
          </button>
        </div>
        <button 
          className="refresh-button" 
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? '🔄 Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      {viewMode === 'table' ? (
        <DeploymentTable deployments={filteredDeployments} />
      ) : (
        <Deployment3DView 
          deployments={filteredDeployments} 
          allProjects={allProjects}
          allEnvironments={allEnvironments}
          allTenants={allTenants}
          envOrder={envOrder}
          infeasibleCombinations={infeasibleCombinations}
        />
      )}
    </div>
  );
}
