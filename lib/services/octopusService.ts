import OctopusClient from './octopusClient';
import type {
  Project,
  Environment,
  Tenant,
  DashboardResponse,
  DeploymentInfo,
  CompleteDeploymentData,
  DeploymentTarget,
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

  async getDeploymentTargets(): Promise<DeploymentTarget[]> {
    try {
      // Try the standard machines endpoint first
      const response = await this.client.get<PaginatedResponse<DeploymentTarget>>(
        `/api/${this.spaceId}/machines`,
        { take: 1000 }
      );
      return response.Items;
    } catch (error) {
      // If we get a 403 or any error, return empty array
      // This means we can't determine infeasible combinations, but the app will still work
      console.warn('Unable to fetch deployment targets:', error);
      return [];
    }
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
      .filter(item => item.TenantId)
      .map(item => ({
        projectName: projectMap.get(item.ProjectId) || 'Unknown',
        projectId: item.ProjectId,
        environmentName: environmentMap.get(item.EnvironmentId) || 'Unknown',
        environmentId: item.EnvironmentId,
        tenantName: tenantMap.get(item.TenantId!) || 'Unknown',
        tenantId: item.TenantId!,
        version: item.ReleaseVersion,
        deployedAt: item.CompletedTime || '',
        state: item.State,
      }));

    return deployments;
  }

  async getCompleteDeploymentData(): Promise<CompleteDeploymentData> {
    // Fetch all data in parallel
    const [dashboard, allProjects, allEnvironments, allTenants, deploymentTargets] = await Promise.all([
      this.getDashboard(),
      this.getProjects(),
      this.getEnvironments(),
      this.getTenants(),
      this.getDeploymentTargets()
    ]);
    
    const projectMap = new Map(dashboard.Projects.map(p => [p.Id, p.Name]));
    const environmentMap = new Map(dashboard.Environments.map(e => [e.Id, e.Name]));
    const tenantMap = new Map(dashboard.Tenants.map(t => [t.Id, t.Name]));

    const deployments: DeploymentInfo[] = dashboard.Items
      .filter(item => item.TenantId)
      .map(item => ({
        projectName: projectMap.get(item.ProjectId) || 'Unknown',
        projectId: item.ProjectId,
        environmentName: environmentMap.get(item.EnvironmentId) || 'Unknown',
        environmentId: item.EnvironmentId,
        tenantName: tenantMap.get(item.TenantId!) || 'Unknown',
        tenantId: item.TenantId!,
        version: item.ReleaseVersion,
        deployedAt: item.CompletedTime || '',
        state: item.State,
      }));

    // Extract envOrder from the response (added by our API route)
    const envOrder = (dashboard as any).envOrder as string | undefined;

    // Build a set of feasible environment-tenant combinations based on deployment targets
    const feasibleCombinations = new Set<string>();
    
    // Only process if we successfully fetched deployment targets
    if (deploymentTargets.length > 0) {
      deploymentTargets.forEach(target => {
        // Only consider tenanted or tenanted-or-untenanted machines
        if (target.TenantedDeploymentParticipation === 'Tenanted' || 
            target.TenantedDeploymentParticipation === 'TenantedOrUntenanted') {
          
          // For each environment this target is in
          target.EnvironmentIds.forEach(envId => {
            // For each tenant this target supports
            target.TenantIds.forEach(tenantId => {
              feasibleCombinations.add(`${envId}-${tenantId}`);
            });
          });
        }
      });
    }

    // Determine infeasible combinations: all env-tenant pairs that aren't in feasibleCombinations
    // Only calculate this if we have deployment targets data
    const infeasibleCombinations = new Set<string>();
    
    if (deploymentTargets.length > 0) {
      allEnvironments.forEach(env => {
        allTenants.forEach(tenant => {
          const key = `${env.Id}-${tenant.Id}`;
          if (!feasibleCombinations.has(key)) {
            infeasibleCombinations.add(key);
          }
        });
      });
    }

    return {
      deployments,
      allProjects,
      allEnvironments,
      allTenants,
      envOrder,
      infeasibleCombinations
    };
  }
}
