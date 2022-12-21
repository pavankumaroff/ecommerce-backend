const express = require("express");
const app = express();

require("dotenv").config();
require("./startup/config")();
require("./startup/db")();
require("./startup/routes")(app);
require("./startup/validation")();
require("./startup/production")(app);

const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
