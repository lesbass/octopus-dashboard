interface VersionBadgeProps {
  version: string;
}

export function VersionBadge({ version }: VersionBadgeProps) {
  // Split version: 1.4.0.something -> ["1.4.0", "something"]
  const versionParts = version.split('.');
  
  // Check if it's a dev version (has 4+ parts)
  const isDevVersion = versionParts.length >= 4;
  
  if (isDevVersion) {
    // Take first 3 parts as main version (1.4.0)
    const mainVersion = versionParts.slice(0, 3).join('.');
    // Rest is the commit hash or build identifier
    const buildInfo = versionParts.slice(3).join('.');
    
    return (
      <>
        <span className="version-main">{mainVersion}</span>
        <span className="version-build">.{buildInfo}</span>
      </>
    );
  }
  
  // For major versions (1.4.0), display as simple text
  return <span className="version-text">{version}</span>;
}
