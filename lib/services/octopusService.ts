import OctopusClient from './octopusClient';
import type {
  Project,
  Environment,
  Tenant,
  DashboardResponse,
  DeploymentInfo,
} from '../types/octopus';

interface PaginatedResponse<T> {
  Items: T[];
  TotalResults: number;
}

export class OctopusService {
  private client: OctopusClient;
  private spaceId: string;

  constructor(client: OctopusClient) {
    this.client = client;
    // Lo spaceId viene passato nell'endpoint dall'API route
    this.spaceId = '{spaceId}';
  }

  async getProjects(): Promise<Project[]> {
    const response = await this.client.get<PaginatedResponse<Project>>(
      `/api/${this.spaceId}/projects`,
      { take: 1000 }
    );
    return response.Items;
  }

  async getEnvironments(): Promise<Environment[]> {
    const response = await this.client.get<PaginatedResponse<Environment>>(
      `/api/${this.spaceId}/environments`,
      { take: 1000 }
    );
    return response.Items;
  }

  async getTenants(): Promise<Tenant[]> {
    const response = await this.client.get<PaginatedResponse<Tenant>>(
      `/api/${this.spaceId}/tenants`,
      { take: 1000 }
    );
    return response.Items;
  }

  async getDashboard(): Promise<DashboardResponse> {
    const dashboard = await this.client.get<DashboardResponse>(
      `/api/${this.spaceId}/dashboard`
    );
    return dashboard;
  }

  async getDeploymentInfo(): Promise<DeploymentInfo[]> {
    const dashboard = await this.getDashboard();
    
    const projectMap = new Map(dashboard.Projects.map(p => [p.Id, p.Name]));
    const environmentMap = new Map(dashboard.Environments.map(e => [e.Id, e.Name]));
    const tenantMap = new Map(dashboard.Tenants.map(t => [t.Id, t.Name]));

    const deployments: DeploymentInfo[] = dashboard.Items
      .filter(item => item.State === 'Success')
      .map(item => ({
        projectName: projectMap.get(item.ProjectId) || 'Unknown',
        projectId: item.ProjectId,
        environmentName: environmentMap.get(item.EnvironmentId) || 'Unknown',
        environmentId: item.EnvironmentId,
        tenantName: item.TenantId ? (tenantMap.get(item.TenantId) || 'Unknown') : 'Untenanted',
        tenantId: item.TenantId || '',
        version: item.ReleaseVersion,
        deployedAt: item.CompletedTime || '',
      }));

    return deployments;
  }
}
