const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

config.resolver.extraNodeModules = {
  "@env": path.resolve(__dirname, "./node_modules/react-native-dotenv"),
};

module.exports = withNativeWind(config, { input: './global.css' })
