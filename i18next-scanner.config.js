module.exports = {
  input: [
    'src/**/*.{js,jsx,ts,tsx}', // Analiza todos los archivos fuente relevantes
  ],
  output: './public/locales/$LOCALE/$NAMESPACE.json',
  options: {
    debug: false,
    removeUnusedKeys: false,
    sort: true,
    lngs: ['es', 'en'],
    ns: ['translation', 'adminOrders'],
    defaultLng: 'es',
    defaultNs: 'translation',
    resource: {
      loadPath: 'public/locales/{{lng}}/{{ns}}.json',
      savePath: 'public/locales/{{lng}}/{{ns}}.json',
    },
    keySeparator: '.', // Usa punto para claves anidadas
    nsSeparator: ':',  // Usa dos puntos para separar namespace
  }
}; 