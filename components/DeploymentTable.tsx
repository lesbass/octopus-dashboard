import type { DeploymentInfo } from '@/lib/types/octopus';

interface DeploymentTableProps {
  deployments: DeploymentInfo[];
}

export function DeploymentTable({ deployments }: DeploymentTableProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  if (deployments.length === 0) {
    return (
      <div className="table-container">
        <div className="no-data">
          No deployments found with the selected filters.
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="deployments-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Environment</th>
            <th>Tenant</th>
            <th>Version</th>
            <th>Deploy Date</th>
          </tr>
        </thead>
        <tbody>
          {deployments.map((deployment, index) => (
            <tr key={`${deployment.projectId}-${deployment.environmentId}-${deployment.tenantId}-${index}`}>
              <td>{deployment.projectName}</td>
              <td>{deployment.environmentName}</td>
              <td>{deployment.tenantName}</td>
              <td>
                <span className="version-badge">{deployment.version}</span>
              </td>
              <td className="date-time">{formatDate(deployment.deployedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
