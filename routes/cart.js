const express = require("express");
const router = express.Router();
const { Cart, validate } = require("../models/cart");
const { Product } = require("../models/product");
const validator = require("../middleware/validator");
const auth = require("../middleware/auth");

router.get("/", [auth], async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });

  res.send(cart);
});

router.post("/add-to-cart", [validator(validate), auth], async (req, res) => {
  const userId = req.user._id;
  let { productId, qty } = req.body;
  if (!qty) qty = 1;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).send("Product not found.");
  if (product.stock === 0) return res.status(400).send("Out of stock.");

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    const cart = await Cart.createCart(Cart, userId, qty, product);
    res.send(cart);
  } else {
    const cartItem = cart.products.id(productId);

    if (cartItem) {
      cartItem.qty += qty;
      cartItem.total = cartItem.qty * cartItem.price;
    } else cart.pushToCart(cart, qty, product);

    const { cartQty, cartTotal } = cart.calculateTotal(cart);
    cart.totalQty = cartQty;
    cart.totalPrice = cartTotal;

    await cart.save();
    res.send(cart);
  }
});

router.post("/increase-cart", [validator(validate), auth], async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  const cart = await Cart.findOne({ userId });
  const cartItem = cart.products.id(productId);
  if (!cartItem) return res.status(404).send("Product not found in cart.");

  if (cartItem.qty <= 99) {
    cartItem.qty += 1;
    cartItem.total += cartItem.price;
    cart.totalQty += 1;
    cart.totalPrice += cartItem.price;

    await cart.save();
  }

  res.send(cart);
});

router.post("/decrease-cart", [validator(validate), auth], async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  const cart = await Cart.findOne({ userId });
  const cartItem = cart.products.id(productId);
  if (!cartItem) return res.status(404).send("Product not found in cart.");

  if (cartItem.qty > 1) {
    cartItem.qty -= 1;
    cartItem.total -= cartItem.price;
    cart.totalQty -= 1;
    cart.totalPrice -= cartItem.price;

    await cart.save();
  }

  res.send(cart);
});

router.delete(
  "/remove-from-cart/:id",
  [validator(validate), auth],
  async (req, res) => {
    const userId = req.user._id;
    let { id: productId } = req.params;

    const cart = await Cart.findOne({ userId });
    const cartItem = cart.products.id(productId);
    if (!cartItem) return res.status(404).send("Product not found in cart.");

    if (cart.products.length === 1) {
      await cart.remove();
      res.send(null);
    } else {
      cartItem.remove();

      const { cartQty, cartTotal } = cart.calculateTotal(cart);
      cart.totalQty = cartQty;
      cart.totalPrice = cartTotal;

      await cart.save();
      res.send(cart);
    }
  }
);

router.delete("/clear-cart", [auth], async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOneAndDelete({ userId });
  if (!cart) return res.status(404).send("Cart not found for current user.");

  res.send(cart);
});

module.exports = router;
