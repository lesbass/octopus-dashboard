import type { DeploymentInfo } from '@/lib/types/octopus';

interface StatsProps {
  deployments: DeploymentInfo[];
  filteredDeployments: DeploymentInfo[];
}

export function Stats({ deployments, filteredDeployments }: StatsProps) {
  const totalProjects = new Set(deployments.map(d => d.projectId)).size;
  const totalEnvironments = new Set(deployments.map(d => d.environmentId)).size;
  const totalTenants = new Set(deployments.map(d => d.tenantId)).size;

  return (
    <div className="stats">
      <div className="stat-card">
        <h4>Displayed Deployments</h4>
        <p className="stat-value">{filteredDeployments.length}</p>
      </div>
      <div className="stat-card">
        <h4>Total Projects</h4>
        <p className="stat-value">{totalProjects}</p>
      </div>
      <div className="stat-card">
        <h4>Total Environments</h4>
        <p className="stat-value">{totalEnvironments}</p>
      </div>
      <div className="stat-card">
        <h4>Total Tenants</h4>
        <p className="stat-value">{totalTenants}</p>
      </div>
    </div>
  );
}
