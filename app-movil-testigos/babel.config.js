// Sin este archivo, ni Metro (`expo start`) ni Jest pueden transformar el
// propio código fuente de React Native/Expo (usa sintaxis Flow) ni JSX/TS de
// la app -el proyecto no arrancaba ni corría tests pese a tener toda la
// configuración de Jest y dependencias en su lugar.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
