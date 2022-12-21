module.exports = function () {
  if (!process.env.clientUrl)
    throw new Error("FATAL ERROR: clientUrl is not defined.");
  if (!process.env.jwtPrivateKey)
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  if (!process.env.cloudName)
    throw new Error("FATAL ERROR: cloudName is not defined.");
  if (!process.env.productsPreset)
    throw new Error("FATAL ERROR: productsPreset is not defined.");
  if (!process.env.categoriesPreset)
    throw new Error("FATAL ERROR: categoriesPreset is not defined.");
  if (!process.env.apiKey)
    throw new Error("FATAL ERROR: apiKey is not defined.");
  if (!process.env.apiSecret)
    throw new Error("FATAL ERROR: apiSecret is not defined.");
  if (!process.env.stripeSecretKey)
    throw new Error("FATAL ERROR: stripeSecretKey is not defined.");
  if (!process.env.endpointSecret)
    throw new Error("FATAL ERROR: endpointSecret is not defined.");
};
