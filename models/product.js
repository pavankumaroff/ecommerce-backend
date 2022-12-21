const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlenght: 50,
    required: true,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 3,
      maxlength: 255,
      required: true,
    },
    image: {
      type: Object,
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 1024,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 10_00_000,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      max: 1_00_000,
    },
    category: {
      type: categorySchema,
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

function validateProduct(product) {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(255),
    description: Joi.string().required().min(50).max(1024),
    price: Joi.number().required().min(0).max(10_00_000),
    stock: Joi.number().required().min(0).max(1_00_000),
    categoryId: Joi.objectId().required(),
    image: Joi.string().required().allow(""),
  });

  return schema.validate(product);
}

module.exports.Product = Product;
module.exports.validate = validateProduct;
