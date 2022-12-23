const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", [auth, admin], async (req, res) => {
  const order = await Order.find().populate("user", "name email");

  res.send(order);
});

router.get("/mine", [auth], async (req, res) => {
  const order = await Order.find({ "user._id": req.user._id }).sort({
    date: -1,
  });

  res.send(order);
});

router.patch("/:id/shipped", [auth, admin], async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: "shipped",
      },
    },
    { new: true }
  ).populate("user", "name email");

  if (!order) return res.status(404).send("Order not found.");

  res.send(order);
});

module.exports = router;
