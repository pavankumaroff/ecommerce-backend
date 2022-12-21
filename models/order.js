const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shipping: { type: Object, required: true },
  orderItems: {
    type: Array,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "orderItems should have atleast one object",
    },
  },
  totalQty: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "processing" },
  date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

module.exports.Order = Order;
