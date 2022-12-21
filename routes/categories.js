const express = require("express");
const router = express.Router();
const { Category, validate } = require("../models/category");
const { Product } = require("../models/product");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const superAdmin = require("../middleware/superAdmin");
const validator = require("../middleware/validator");
const validateId = require("../middleware/validateId");
const cloudinary = require("../utils/cloudinary")();

router.get("/", async (req, res) => {
  const categories = await Category.find();

  res.send(categories);
});

router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) return res.status(404).send("Category not found.");

  res.send(category);
});

router.post("/", [validator(validate), auth, admin], async (req, res) => {
  const { name, image } = req.body;

  const { secure_url, public_id } = await cloudinary.uploader.upload(image, {
    upload_preset: process.env.categoriesPreset,
    quality: 60,
  });

  const category = await Category.create({
    name,
    image: { url: secure_url, id: public_id },
  });

  res.send(category);
});

router.put(
  "/:id",
  [validator(validate), validateId, auth, admin],
  async (req, res) => {
    const { name, image } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send("Category not found.");

    if (image) {
      await cloudinary.uploader.destroy(category.image.id);

      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image,
        {
          upload_preset: process.env.categoriesPreset,
          quality: 60,
        }
      );

      category.set({
        name,
        image: { url: secure_url, id: public_id },
      });

      category.save();
    } else {
      category.set({
        name,
      });

      category.save();
    }

    await Product.updateMany(
      { "category._id": category._id },
      {
        $set: {
          "category.name": category.name,
        },
      }
    );

    res.send(category);
  }
);

router.delete("/:id", [validateId, auth, superAdmin], async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).send("Category not found.");

  await cloudinary.uploader.destroy(category.image.id);
  category.delete();

  res.send(category);
});

module.exports = router;
