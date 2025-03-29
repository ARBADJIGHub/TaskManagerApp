const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function androidManifestPlugin(config) {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults.manifest;

    // Ajouter ou modifier des permissions ici
    androidManifest.$ = {
      ...androidManifest.$,
      'xmlns:tools': 'http://schemas.android.com/tools',
    };

    // Exemple pour activer les requêtes HTTP non sécurisées
    androidManifest.application.$ = {
      ...androidManifest.application.$,
      'android:usesCleartextTraffic': 'true',
    };

    return config;
  });
};
