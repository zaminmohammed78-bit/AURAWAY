// Expo reads app.json first, then this file adds the native Google Maps key.
// Supply GOOGLE_MAPS_API_KEY as an environment variable or EAS secret; do not hard-code it here.
module.exports = ({ config }) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || "";
  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...(config.android && config.android.config ? config.android.config : {}),
        googleMaps: { apiKey }
      }
    }
  };
};
