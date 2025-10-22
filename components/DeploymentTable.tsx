import { useState, useMemo } from 'react';
import type { DeploymentInfo } from '@/lib/types/octopus';

interface DeploymentTableProps {
  deployments: DeploymentInfo[];
}

type SortColumn = 'projectName' | 'environmentName' | 'tenantName' | 'version' | 'deployedAt';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  column: SortColumn;
  direction: SortDirection;
}

export function DeploymentTable({ deployments }: DeploymentTableProps) {
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  const handleSort = (column: SortColumn, shiftKey: boolean) => {
    if (shiftKey) {
      // Multi-sort: add or update sort for this column
      const existingIndex = sortConfigs.findIndex(config => config.column === column);
      
      if (existingIndex !== -1) {
        // Column already in sort list - toggle direction or remove
        const newConfigs = [...sortConfigs];
        if (newConfigs[existingIndex].direction === 'asc') {
          newConfigs[existingIndex].direction = 'desc';
        } else {
          // Remove from sort list
          newConfigs.splice(existingIndex, 1);
        }
        setSortConfigs(newConfigs);
      } else {
        // Add to sort list
        setSortConfigs([...sortConfigs, { column, direction: 'asc' }]);
      }
    } else {
      // Single sort: replace all sorts with this one
      const existingConfig = sortConfigs.find(config => config.column === column);
      if (existingConfig && sortConfigs.length === 1) {
        // Toggle direction if it's the only sort
        setSortConfigs([{ column, direction: existingConfig.direction === 'asc' ? 'desc' : 'asc' }]);
      } else {
        // New single sort
        setSortConfigs([{ column, direction: 'asc' }]);
      }
    }
  };

  const sortedDeployments = useMemo(() => {
    if (sortConfigs.length === 0) {
      return deployments;
    }

    return [...deployments].sort((a, b) => {
      for (const { column, direction } of sortConfigs) {
        let aValue = a[column];
        let bValue = b[column];

        // Handle date comparison
        if (column === 'deployedAt') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }

        let comparison = 0;
        if (aValue < bValue) {
          comparison = -1;
        } else if (aValue > bValue) {
          comparison = 1;
        }

        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [deployments, sortConfigs]);

  const getSortIndicator = (column: SortColumn) => {
    const configIndex = sortConfigs.findIndex(config => config.column === column);
    if (configIndex === -1) return null;

    const config = sortConfigs[configIndex];
    const arrow = config.direction === 'asc' ? '↑' : '↓';
    const order = sortConfigs.length > 1 ? ` ${configIndex + 1}` : '';
    
    return <span className="sort-indicator">{arrow}{order}</span>;
  };

  if (sortedDeployments.length === 0) {
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
      <div className="sort-hint">
        Click on column headers to sort. Hold Shift to sort by multiple columns.
      </div>
      <table className="deployments-table">
        <thead>
          <tr>
            <th onClick={(e) => handleSort('projectName', e.shiftKey)} className="sortable">
              Project {getSortIndicator('projectName')}
            </th>
            <th onClick={(e) => handleSort('environmentName', e.shiftKey)} className="sortable">
              Environment {getSortIndicator('environmentName')}
            </th>
            <th onClick={(e) => handleSort('tenantName', e.shiftKey)} className="sortable">
              Tenant {getSortIndicator('tenantName')}
            </th>
            <th>
              Version
            </th>
            <th>
              Deploy Date
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedDeployments.map((deployment, index) => (
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
