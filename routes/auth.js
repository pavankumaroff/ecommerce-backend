const Joi = require("joi");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const validator = require("../middleware/validator");

router.post("/", [validator(validateAuth)], async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "name", "isAdmin", "isSuperAdmin"]));
});

function validateAuth(user) {
  const schema = Joi.object({
    email: Joi.string().email().min(11).max(255).required(),
    password: Joi.string().min(5).max(50).required(),
  });

  return schema.validate(user);
}

module.exports = router;
