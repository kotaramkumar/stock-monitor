const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure Metro only resolves from this project, not the parent directory
config.projectRoot = __dirname;
config.watchFolders = [__dirname];

module.exports = config;
