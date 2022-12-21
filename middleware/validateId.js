const mongoose = require("mongoose");

function validateId(req, res, next) {
  const isValid = mongoose.Types.ObjectId.isValid(req.params.id);

  if (!isValid) return res.status(404).send("Invalid id");

  next();
}

module.exports = validateId;
