const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 3,
      maxlenght: 50,
      required: true,
      lowercase: true,
    },
    image: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

function validateCategory(category) {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(50),
    image: Joi.string().required().allow(""),
  });

  return schema.validate(category);
}

module.exports.Category = Category;
module.exports.validate = validateCategory;
