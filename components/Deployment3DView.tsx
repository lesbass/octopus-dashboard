'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from './ThemeProvider';
import type { DeploymentInfo, Project, Environment, Tenant } from '@/lib/types/octopus';

interface Deployment3DViewProps {
  deployments: DeploymentInfo[];
  allProjects: Project[];
  allEnvironments: Environment[];
  allTenants: Tenant[];
  envOrder?: string;
}

interface NodeData {
  position: [number, number, number];
  label: string;
  type: 'project' | 'environment' | 'tenant';
  id: string;
}

interface DeploymentNode {
  position: [number, number, number];
  deployment: DeploymentInfo | null;
  projectId: string;
  environmentId: string;
  tenantId: string;
}

// Component for individual deployment nodes at cube intersections
function DeploymentNode({ 
  position, 
  deployment, 
  onHover,
  isDark
}: { 
  position: [number, number, number]; 
  deployment: DeploymentInfo | null;
  onHover: (deployment: DeploymentInfo | null) => void;
  isDark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const hasDeployment = deployment !== null;
  const isInProgress = hasDeployment && (deployment.state === 'Executing' || deployment.state === 'Queued');
  const isFailed = hasDeployment && deployment.state === 'Failed';
  const isSuccess = hasDeployment && deployment.state === 'Success';

  useFrame(() => {
    if (meshRef.current) {
      if (!hasDeployment || isInProgress) {
        // Rotate for empty nodes or in-progress deployments
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  const textColor = isDark ? '#e6e6e6' : '#000000';
  const tooltipBg = isDark ? 'rgba(26, 31, 46, 0.95)' : 'rgba(0, 0, 0, 0.9)';
  const emptyTooltipBg = isDark ? 'rgba(42, 50, 68, 0.95)' : 'rgba(128, 128, 128, 0.9)';
  
  // Safely get version, handle empty or invalid versions
  const versionText = hasDeployment && deployment.version ? deployment.version : 'N/A';
  
  // Determine color based on state
  const getVersionColor = () => {
    if (isInProgress) return '#ff9800'; // Orange
    if (isFailed) return '#ff6b6b'; // Red
    return textColor; // Normal color for success
  };

  return (
    <group position={position}>
      {hasDeployment ? (
        // Show version number as text for all deployments with color based on state
        <>
          <Text
            fontSize={0.15}
            color={getVersionColor()}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            onPointerOver={() => {
              setHovered(true);
              onHover(deployment);
            }}
            onPointerOut={() => {
              setHovered(false);
              onHover(null);
            }}
          >
            {versionText}
          </Text>
          {hovered && (
            <Html distanceFactor={10}>
              <div style={{
                background: tooltipBg,
                color: 'white',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                maxWidth: '300px'
              }}>
                <div><strong>Project:</strong> {deployment.projectName}</div>
                <div><strong>Environment:</strong> {deployment.environmentName}</div>
                <div><strong>Tenant:</strong> {deployment.tenantName}</div>
                <div><strong>Version:</strong> {versionText}</div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span style={{
                    color: isInProgress ? '#ff9800' : isFailed ? '#ff6b6b' : '#4caf50',
                    fontWeight: 'bold'
                  }}>
                    {deployment.state}
                  </span>
                </div>
                <div style={{ fontSize: '10px', marginTop: '5px', color: '#aaa' }}>
                  {deployment.deployedAt ? new Date(deployment.deployedAt).toLocaleString() : 'In progress...'}
                </div>
              </div>
            </Html>
          )}
        </>
      ) : (
        // Show grey dot for not deployed
        <>
          <mesh
            ref={meshRef}
            onPointerOver={() => {
              setHovered(true);
              onHover(deployment);
            }}
            onPointerOut={() => {
              setHovered(false);
              onHover(null);
            }}
          >
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial 
              color="#D3D3D3"
              emissive="#D3D3D3"
              emissiveIntensity={hovered ? 0.5 : 0.2}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
          {hovered && (
            <Html distanceFactor={10}>
              <div style={{
                background: emptyTooltipBg,
                color: 'white',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
              }}>
                No deployment yet
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}

// Component for axis labels (Projects, Environments, Tenants)
function AxisLabel({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  return (
    <Text
      position={position}
      fontSize={0.2}
      color={color}
      anchorX="center"
      anchorY="middle"
      fontWeight="bold"
    >
      {label}
    </Text>
  );
}

// Main 3D Scene component
function Scene({ 
  deployments, 
  allProjects, 
  allEnvironments, 
  allTenants,
  isDark,
  envOrder
}: {
  deployments: DeploymentInfo[];
  allProjects: Project[];
  allEnvironments: Environment[];
  allTenants: Tenant[];
  isDark: boolean;
  envOrder?: string;
}) {
  const [hoveredDeployment, setHoveredDeployment] = useState<DeploymentInfo | null>(null);

  // Use ALL projects, environments, and tenants from the API
  const { projects, environments, tenants } = useMemo(() => {
    // Custom sort order for environments
    const envOrderArray = (envOrder || '').split(',').map(s => s.trim()).filter(Boolean);
    const sortedEnvironments = allEnvironments
      .map(e => ({ id: e.Id, name: e.Name }))
      .sort((a, b) => {
        const indexA = envOrderArray.indexOf(a.name);
        const indexB = envOrderArray.indexOf(b.name);

        // If both are in the custom order, sort by that
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // If only A is in custom order, it comes first
        if (indexA !== -1) return -1;
        // If only B is in custom order, it comes first
        if (indexB !== -1) return 1;
        // Otherwise, sort alphabetically
        return a.name.localeCompare(b.name);
      });

    return {
      projects: allProjects.map(p => ({ id: p.Id, name: p.Name })).sort((a, b) => a.name.localeCompare(b.name)),
      environments: sortedEnvironments,
      tenants: allTenants.map(t => ({ id: t.Id, name: t.Name })).sort((a, b) => a.name.localeCompare(b.name))
    };
  }, [allProjects, allEnvironments, allTenants, envOrder]);

  const spacing = 2; // Space between nodes

  // Create deployment lookup map
  const deploymentMap = useMemo(() => {
    const map = new Map<string, DeploymentInfo>();
    deployments.forEach(dep => {
      const key = `${dep.projectId}-${dep.environmentId}-${dep.tenantId}`;
      map.set(key, dep);
    });
    return map;
  }, [deployments]);

  // Generate all possible deployment nodes (including empty ones)
  const deploymentNodes: DeploymentNode[] = useMemo(() => {
    const nodes: DeploymentNode[] = [];
    
    projects.forEach((project, pIdx) => {
      environments.forEach((env, eIdx) => {
        tenants.forEach((tenant, tIdx) => {
          const key = `${project.id}-${env.id}-${tenant.id}`;
          const deployment = deploymentMap.get(key) || null;
          
          nodes.push({
            position: [
              pIdx * spacing - (projects.length - 1) * spacing / 2,
              eIdx * spacing - (environments.length - 1) * spacing / 2,
              tIdx * spacing - (tenants.length - 1) * spacing / 2
            ],
            deployment,
            projectId: project.id,
            environmentId: env.id,
            tenantId: tenant.id
          });
        });
      });
    });
    
    return nodes;
  }, [projects, environments, tenants, deploymentMap, spacing]);

  // Generate grid lines for better visualization
  const gridLines = useMemo(() => {
    const lines: { points: [number, number, number][]; color: string }[] = [];
    const colors = {
      project: '#1565C0',
      environment: '#2E7D32',
      tenant: '#E65100'
    };

    // Only create grid lines if we have at least 2 items in a dimension
    // Project lines (along X axis) - only if we have multiple tenants
    if (tenants.length >= 2) {
      projects.forEach((project, pIdx) => {
        environments.forEach((env, eIdx) => {
          const points: [number, number, number][] = tenants.map((_, tIdx) => [
            pIdx * spacing - (projects.length - 1) * spacing / 2,
            eIdx * spacing - (environments.length - 1) * spacing / 2,
            tIdx * spacing - (tenants.length - 1) * spacing / 2
          ]);
          lines.push({ points, color: colors.tenant });
        });
      });
    }

    // Environment lines (along Y axis) - only if we have multiple projects
    if (projects.length >= 2) {
      environments.forEach((env, eIdx) => {
        tenants.forEach((tenant, tIdx) => {
          const points: [number, number, number][] = projects.map((_, pIdx) => [
            pIdx * spacing - (projects.length - 1) * spacing / 2,
            eIdx * spacing - (environments.length - 1) * spacing / 2,
            tIdx * spacing - (tenants.length - 1) * spacing / 2
          ]);
          lines.push({ points, color: colors.project });
        });
      });
    }

    // Tenant lines (along Z axis) - only if we have multiple environments
    if (environments.length >= 2) {
      tenants.forEach((tenant, tIdx) => {
        projects.forEach((project, pIdx) => {
          const points: [number, number, number][] = environments.map((_, eIdx) => [
            pIdx * spacing - (projects.length - 1) * spacing / 2,
            eIdx * spacing - (environments.length - 1) * spacing / 2,
            tIdx * spacing - (tenants.length - 1) * spacing / 2
          ]);
          lines.push({ points, color: colors.environment });
        });
      });
    }

    return lines;
  }, [projects, environments, tenants, spacing]);

  // Generate axis labels
  const axisLabels = useMemo(() => {
    const labels: { position: [number, number, number]; label: string; color: string }[] = [];
    const offset = 0.5;

    // Project labels (X axis - Blue)
    projects.forEach((project, idx) => {
      const x = idx * spacing - (projects.length - 1) * spacing / 2;
      const y = -(environments.length - 1) * spacing / 2 - offset;
      const z = -(tenants.length - 1) * spacing / 2 - offset;
      labels.push({
        position: [x, y, z],
        label: project.name,
        color: '#1565C0'
      });
    });

    // Environment labels (Y axis - Green)
    environments.forEach((env, idx) => {
      const x = -(projects.length - 1) * spacing / 2 - offset;
      const y = idx * spacing - (environments.length - 1) * spacing / 2;
      const z = -(tenants.length - 1) * spacing / 2 - offset;
      labels.push({
        position: [x, y, z],
        label: env.name,
        color: '#2E7D32'
      });
    });

    // Tenant labels (Z axis - Orange)
    tenants.forEach((tenant, idx) => {
      const x = -(projects.length - 1) * spacing / 2 - offset;
      const y = -(environments.length - 1) * spacing / 2 - offset;
      const z = idx * spacing - (tenants.length - 1) * spacing / 2;
      labels.push({
        position: [x, y, z],
        label: tenant.name,
        color: '#E65100'
      });
    });

    return labels;
  }, [projects, environments, tenants, spacing]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Reference axes */}
      {/* X-axis (Projects) - Blue */}
      <Line
        points={[
          [-(projects.length - 1) * spacing / 2 - 1, -(environments.length - 1) * spacing / 2 - 1, -(tenants.length - 1) * spacing / 2 - 1],
          [(projects.length - 1) * spacing / 2 + 1, -(environments.length - 1) * spacing / 2 - 1, -(tenants.length - 1) * spacing / 2 - 1]
        ]}
        color="#1565C0"
        lineWidth={2}
      />
      {/* Y-axis (Environments) - Green */}
      <Line
        points={[
          [-(projects.length - 1) * spacing / 2 - 1, -(environments.length - 1) * spacing / 2 - 1, -(tenants.length - 1) * spacing / 2 - 1],
          [-(projects.length - 1) * spacing / 2 - 1, (environments.length - 1) * spacing / 2 + 1, -(tenants.length - 1) * spacing / 2 - 1]
        ]}
        color="#2E7D32"
        lineWidth={2}
      />
      {/* Z-axis (Tenants) - Orange */}
      <Line
        points={[
          [-(projects.length - 1) * spacing / 2 - 1, -(environments.length - 1) * spacing / 2 - 1, -(tenants.length - 1) * spacing / 2 - 1],
          [-(projects.length - 1) * spacing / 2 - 1, -(environments.length - 1) * spacing / 2 - 1, (tenants.length - 1) * spacing / 2 + 1]
        ]}
        color="#E65100"
        lineWidth={2}
      />

      {/* Grid lines */}
      {gridLines.map((line, idx) => (
        <Line
          key={idx}
          points={line.points}
          color={line.color}
          lineWidth={1}
          opacity={0.3}
          transparent
        />
      ))}

      {/* Deployment nodes */}
      {deploymentNodes.map((node, idx) => (
        <DeploymentNode
          key={idx}
          position={node.position}
          deployment={node.deployment}
          onHover={setHoveredDeployment}
          isDark={isDark}
        />
      ))}

      {/* Axis labels */}
      {axisLabels.map((label, idx) => (
        <AxisLabel key={idx} {...label} />
      ))}

      {/* Axis titles */}
      <Text
        position={[0, -(environments.length - 1) * spacing / 2 - 1.5, -(tenants.length - 1) * spacing / 2 - 1.5]}
        fontSize={0.3}
        color={isDark ? '#64b5f6' : '#1565C0'}
        anchorX="center"
        fontWeight="bold"
      >
        PROJECTS
      </Text>
      <Text
        position={[-(projects.length - 1) * spacing / 2 - 1.5, 0, -(tenants.length - 1) * spacing / 2 - 1.5]}
        fontSize={0.3}
        color={isDark ? '#81c784' : '#2E7D32'}
        anchorX="center"
        fontWeight="bold"
      >
        ENVIRONMENTS
      </Text>
      <Text
        position={[-(projects.length - 1) * spacing / 2 - 1.5, -(environments.length - 1) * spacing / 2 - 1.5, 0]}
        fontSize={0.3}
        color={isDark ? '#ffb74d' : '#E65100'}
        anchorX="center"
        fontWeight="bold"
      >
        TENANTS
      </Text>

      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
}

export default function Deployment3DView({ deployments, allProjects, allEnvironments, allTenants, envOrder }: Deployment3DViewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Check if we have the necessary data to render
  if (!allProjects || !allEnvironments || !allTenants || 
      allProjects.length === 0 || allEnvironments.length === 0 || allTenants.length === 0) {
    return (
      <div className="view-3d-container">
        <div className="loading">
          Loading 3D visualization...
        </div>
      </div>
    );
  }

  const canvasBg = isDark ? '#1a1f2e' : '#ffffff';
  const textColor = isDark ? '#e6e6e6' : '#000000';

  return (
    <div className="view-3d-container">
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: canvasBg }}
      >
        <Scene 
          deployments={deployments} 
          allProjects={allProjects}
          allEnvironments={allEnvironments}
          allTenants={allTenants}
          isDark={isDark}
          envOrder={envOrder}
        />
      </Canvas>
    </div>
  );
}
