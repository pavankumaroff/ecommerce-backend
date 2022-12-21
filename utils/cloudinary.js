const coludinary = require("cloudinary").v2;

module.exports = function () {
  coludinary.config({
    cloud_name: process.env.cloudName,
    api_key: process.env.apiKey,
    api_secret: process.env.apiSecret,
  });

  return coludinary;
};
