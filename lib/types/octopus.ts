export interface OctopusConfig {
  serverUrl: string;
  apiKey: string;
  spaceId: string;
}

export interface Project {
  Id: string;
  Name: string;
  Slug: string;
}

export interface Environment {
  Id: string;
  Name: string;
}

export interface Tenant {
  Id: string;
  Name: string;
}

export interface Release {
  Id: string;
  Version: string;
  ProjectId: string;
}

export interface Deployment {
  Id: string;
  ReleaseId: string;
  EnvironmentId: string;
  TenantId?: string;
  Created: string;
  ProjectId: string;
}

export interface DeploymentInfo {
  projectName: string;
  projectId: string;
  environmentName: string;
  environmentId: string;
  tenantName: string;
  tenantId: string;
  version: string;
  deployedAt: string;
}

export interface DashboardResource {
  Id: string;
  ProjectId: string;
  EnvironmentId: string;
  TenantId?: string;
  ReleaseVersion: string;
  State: string;
  CompletedTime?: string;
}

export interface DashboardResponse {
  Items: DashboardResource[];
  Projects: Project[];
  Environments: Environment[];
  Tenants: Tenant[];
}

export interface CompleteDeploymentData {
  deployments: DeploymentInfo[];
  allProjects: Project[];
  allEnvironments: Environment[];
  allTenants: Tenant[];
}
