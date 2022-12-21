const express = require("express");
const cors = require("cors");
require("express-async-errors");
const users = require("../routes/users");
const auth = require("../routes/auth");
const categories = require("../routes/categories");
const products = require("../routes/products");
const cart = require("../routes/cart");
const orders = require("../routes/orders");
const checkout = require("../routes/checkout");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(cors());
  app.use("/api/checkout/webhook", express.raw({ type: "*/*" }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use("/api/cart", cart);
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use("/api/products", products);
  app.use("/api/categories", categories);
  app.use("/api/checkout", checkout);
  app.use("/api/orders", orders);
  app.use(error);
};
