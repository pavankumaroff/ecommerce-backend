const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      minlength: 11,
      maxlength: 50,
      required: true,
    },
    password: {
      type: String,
      minlength: 5,
      maxlength: 1024,
      required: true,
    },
    name: {
      type: String,
      minlength: 3,
      maxlength: 50,
      required: true,
    },
    isAdmin: {
      type: Boolean,
    },
    isSuperAdmin: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.generateAuthToken = function () {
  const { _id, isAdmin, isSuperAdmin } = this;

  return jwt.sign({ _id, isAdmin, isSuperAdmin }, process.env.jwtPrivateKey);
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().required().email().min(11).max(50),
    password: Joi.string().required().min(5).max(50),
    name: Joi.string().required().min(3).max(50),
  });

  return schema.validate(user);
}

module.exports.User = User;
module.exports.validate = validateUser;
