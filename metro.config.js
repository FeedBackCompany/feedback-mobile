const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add PNPM support
config.resolver = {
  ...config.resolver,
  // Enable symlinks for PNPM
  resolveSymlinksInRootFolder: true,
  // Add PNPM node_modules location
  nodeModulesPaths: [
    `${__dirname}/node_modules/.pnpm/node_modules`,
    `${__dirname}/node_modules`,
  ],
  // Enable source extensions
  sourceExts: [...config.resolver.sourceExts, 'mjs'],
  // Ensure proper module resolution
  disableHierarchicalLookup: true
};

// Additional configuration for PNPM structure
config.watchFolders = [
  `${__dirname}/node_modules/.pnpm/node_modules`,
  ...config.watchFolders || []
];

module.exports = config;