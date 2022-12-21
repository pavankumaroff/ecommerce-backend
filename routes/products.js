const express = require("express");
const router = express.Router();
const { Product, validate } = require("../models/product");
const { Category } = require("../models/category");
const validator = require("../middleware/validator");
const validateId = require("../middleware/validateId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const superAdmin = require("../middleware/superAdmin");
const cloudinary = require("../utils/cloudinary")();

router.get("/", async (req, res) => {
  const products = await Product.find();

  res.send(products);
});

router.get("/few", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).limit(15);

  res.send(products);
});

router.get("/category/:name", async (req, res) => {
  let products;
  const { name } = req.params;

  if (name === "all") products = await Product.find().sort({ createdAt: -1 });
  else products = await Product.find({ "category.name": name });

  res.send(products);
});

router.get("/:id", [validateId], async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send("Product not found.");

  const similarProducts = await Product.find({
    "category.name": product.category.name,
    _id: { $ne: product._id },
    stock: { $ne: 0 },
  }).limit(10);

  res.send({ product, similarProducts });
});

router.post("/", [validator(validate), auth, admin], async (req, res) => {
  const { name, description, price, stock, categoryId, image } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).send("Invalid category.");

  const { secure_url, public_id } = await cloudinary.uploader.upload(image, {
    upload_preset: process.env.productsPreset,
    quality: 60,
  });

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category: {
      _id: category._id,
      name: category.name,
    },
    image: { url: secure_url, id: public_id },
  });

  res.send(product);
});

router.put(
  "/:id",
  [validator(validate), validateId, auth, admin],
  async (req, res) => {
    const { name, description, price, stock, categoryId, image } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found.");

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).send("Invalid category.");

    if (image) {
      await cloudinary.uploader.destroy(product.image.id);

      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image,
        {
          upload_preset: process.env.productsPreset,
          quality: 60,
        }
      );

      product.set({
        name,
        description,
        price,
        stock,
        category: {
          _id: category._id,
          name: category.name,
        },
        image: { url: secure_url, id: public_id },
      });

      product.save();
    } else {
      product.set({
        name,
        description,
        price,
        stock,
        category: {
          _id: category._id,
          name: category.name,
        },
      });

      product.save();
    }

    res.send(product);
  }
);

router.delete("/:id", [validateId, auth, superAdmin], async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send("Product not found.");

  await cloudinary.uploader.destroy(product.image.id);

  product.delete();

  res.send(product);
});

module.exports = router;
