const mongoose = require("mongoose");
const Joi = require("joi");

const productSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  products: [productSchema],
  totalQty: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

cartSchema.statics.createCart = async function (Cart, ...rest) {
  const [userId, qty, product] = rest;

  return await Cart.create({
    userId,
    products: [
      {
        _id: product._id,
        image: product.image.url,
        name: product.name,
        price: product.price,
        qty,
        total: qty * product.price,
      },
    ],
    totalQty: qty,
    totalPrice: qty * product.price,
  });
};

cartSchema.methods.pushToCart = function (cart, ...rest) {
  const [qty, product] = rest;

  cart.products.push({
    _id: product._id,
    image: product.image.url,
    name: product.name,
    price: product.price,
    qty,
    total: qty * product.price,
  });
};

cartSchema.methods.calculateTotal = function (cart) {
  return cart.products.reduce(
    (a, c) => {
      const { qty, total } = c;
      a.cartQty += qty;
      a.cartTotal += total;
      return a;
    },
    { cartQty: 0, cartTotal: 0 }
  );
};

const Cart = mongoose.model("Cart", cartSchema);

function validateCart(cart) {
  const schema = Joi.object({
    productId: Joi.objectId(),
    qty: Joi.number().min(1).max(6),
  });

  return schema.validate(cart);
}

module.exports.Cart = Cart;
module.exports.validate = validateCart;
