interface VersionBadgeProps {
  version: string;
  state?: string;
}

export function VersionBadge({ version, state }: VersionBadgeProps) {
  // Split version: 1.4.0.something -> ["1.4.0", "something"]
  const versionParts = version.split('.');
  
  // Check if it's a dev version (has 4+ parts)
  const isDevVersion = versionParts.length >= 4;
  
  // Check if deployment is in progress
  const isInProgress = state === 'Executing' || state === 'Queued';
  const isSuccess = state === 'Success';
  const isFailed = state === 'Failed';
  
  if (isDevVersion) {
    // Take first 3 parts as main version (1.4.0)
    const mainVersion = versionParts.slice(0, 3).join('.');
    // Rest is the commit hash or build identifier
    const buildInfo = versionParts.slice(3).join('.');
    
    return (
      <span className="version-wrapper">
        <span className={`version-main ${isInProgress ? 'version-in-progress' : ''} ${isFailed ? 'version-failed' : ''}`}>
          {mainVersion}
          {isInProgress && <span className="version-loader">⟳</span>}
        </span>
        <span className="version-build">.{buildInfo}</span>
      </span>
    );
  }
  
  // For major versions (1.4.0), display as simple text
  return (
    <span className={`version-text ${isInProgress ? 'version-in-progress' : ''} ${isFailed ? 'version-failed' : ''}`}>
      {version}
      {isInProgress && <span className="version-loader">⟳</span>}
    </span>
  );
}
