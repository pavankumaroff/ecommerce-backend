const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");
const { Cart } = require("../models/cart");
const { Order } = require("../models/order");
const validator = require("../middleware/validator");
const validateId = require("../middleware/validateId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const superAdmin = require("../middleware/superAdmin");

router.get("/me", [auth], async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.send(user);
});

router.get("/", [auth, admin], async (req, res) => {
  const users = await User.find({
    isSuperAdmin: undefined,
    _id: { $ne: req.user._id },
  }).select("-password");

  res.send(users);
});

router.post("/", [validator(validate)], async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already exists.");

  user = await User.create(req.body);
  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "name"]));
});

router.patch(
  "/:id/make-admin",
  [validateId, auth, superAdmin],
  async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: { isAdmin: true },
      },
      { new: true }
    );

    if (!user) return res.status(404).send("User not found.");

    res.send(user);
  }
);

router.patch(
  "/:id/revoke-admin",
  [validateId, auth, superAdmin],
  async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $unset: { isAdmin: "" },
      },
      { new: true }
    );

    if (!user) return res.status(404).send("User not found.");

    res.send(user);
  }
);

router.delete("/:id", [validateId, auth, superAdmin], async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id).select("-password");
  if (!user) return res.status(404).send("User not found.");

  await Cart.deleteOne({ userId: user._id });

  await Order.deleteMany({ user: user._id });

  res.send(user);
});

module.exports = router;
