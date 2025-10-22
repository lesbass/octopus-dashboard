'use client';

import { useState, useMemo, useEffect } from 'react';
import type { DeploymentInfo } from '@/lib/types/octopus';

interface FilterBarProps {
  deployments: DeploymentInfo[];
  onFilterChange: (filtered: DeploymentInfo[]) => void;
}

export function FilterBar({ deployments, onFilterChange }: FilterBarProps) {
  const [projectFilter, setProjectFilter] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  const uniqueProjects = useMemo(
    () => Array.from(new Set(deployments.map(d => d.projectName))).sort(),
    [deployments]
  );

  const uniqueEnvironments = useMemo(
    () => Array.from(new Set(deployments.map(d => d.environmentName))).sort(),
    [deployments]
  );

  const uniqueTenants = useMemo(
    () => Array.from(new Set(deployments.map(d => d.tenantName))).sort(),
    [deployments]
  );

  const filteredDeployments = useMemo(() => {
    let filtered = deployments;

    if (projectFilter) {
      filtered = filtered.filter(d => d.projectName === projectFilter);
    }

    if (environmentFilter) {
      filtered = filtered.filter(d => d.environmentName === environmentFilter);
    }

    if (tenantFilter) {
      filtered = filtered.filter(d => d.tenantName === tenantFilter);
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        d =>
          d.projectName.toLowerCase().includes(search) ||
          d.environmentName.toLowerCase().includes(search) ||
          d.tenantName.toLowerCase().includes(search) ||
          d.version.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [projectFilter, environmentFilter, tenantFilter, searchText, deployments]);

  // Call onFilterChange when filtered results change
  useEffect(() => {
    onFilterChange(filteredDeployments);
  }, [filteredDeployments, onFilterChange]);

  return (
    <div className="filters">
      <h3>Filters</h3>
      <div className="filter-group">
        <div className="filter-field">
          <label htmlFor="project-filter">Project</label>
          <select
            id="project-filter"
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
          >
            <option value="">All projects</option>
            {uniqueProjects.map(project => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="environment-filter">Environment</label>
          <select
            id="environment-filter"
            value={environmentFilter}
            onChange={e => setEnvironmentFilter(e.target.value)}
          >
            <option value="">All environments</option>
            {uniqueEnvironments.map(env => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="tenant-filter">Tenant</label>
          <select
            id="tenant-filter"
            value={tenantFilter}
            onChange={e => setTenantFilter(e.target.value)}
          >
            <option value="">All tenants</option>
            {uniqueTenants.map(tenant => (
              <option key={tenant} value={tenant}>
                {tenant}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="search-text">Search</label>
          <input
            id="search-text"
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
