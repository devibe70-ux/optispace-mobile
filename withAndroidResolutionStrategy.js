const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidResolutionStrategy(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let contents = config.modResults.contents;
      const kotlinOptionsAppend = `
allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            freeCompilerArgs += ["-Xskip-metadata-version-check"]
        }
    }
}
`;
      if (!contents.includes("-Xskip-metadata-version-check")) {
        config.modResults.contents = contents + kotlinOptionsAppend;
      }
    }
    return config;
  });
};
