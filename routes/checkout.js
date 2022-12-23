const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Cart } = require("../models/cart");
const { User } = require("../models/user");
const { Order } = require("../models/order");
const { Product } = require("../models/product");
const stripe = require("stripe")(process.env.stripeSecretKey);

router.post("/create-checkout-session", [auth], async (req, res) => {
  const userId = req.user._id;
  const customer = await stripe.customers.create({
    metadata: {
      userId,
    },
  });

  const cart = await Cart.findOne({ userId });
  const items = cart.products.map((p) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: p.name,
        images: [p.image],
      },
      unit_amount: p.price * 100,
    },
    quantity: p.qty,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    shipping_address_collection: { allowed_countries: ["IN"] },
    phone_number_collection: { enabled: true },
    customer: customer.id,
    line_items: items,
    mode: "payment",
    success_url: `${process.env.clientUrl}/order-success`,
    cancel_url: `${process.env.clientUrl}/shopping-cart`,
  });

  res.send({ url: session.url });
});

async function createOrder(customer, object) {
  const userId = customer.metadata.userId;
  const user = await User.findById(userId);
  const cart = await Cart.findOne({ userId });

  await Order.create({
    user: { _id: userId, email: user.email, name: user.name },
    shipping: {
      address: object.customer_details.address,
      email: object.customer_details.email,
      name: object.customer_details.name,
      phone: object.customer_details.phone,
    },
    orderItems: cart.products,
    totalQty: cart.totalQty,
    totalPrice: cart.totalPrice,
  });

  cart.products.forEach(async (p) => {
    await Product.findByIdAndUpdate(p._id, {
      $inc: {
        stock: -p.qty,
      },
    });
  });

  await cart.remove();
}

router.post("/webhook", async (req, res) => {
  let event;
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.endpointSecret;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const { object } = event.data;
    const customer = await stripe.customers.retrieve(object.customer);

    await createOrder(customer, object);
  }

  res.send();
});

module.exports = router;
