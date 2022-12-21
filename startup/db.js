const mongoose = require("mongoose");

module.exports = function () {
  mongoose
    .connect(`${process.env.db}`)
    .then(() => console.log(`connected to ${process.env.db}...`))
    .catch((err) => console.log(err));
};
