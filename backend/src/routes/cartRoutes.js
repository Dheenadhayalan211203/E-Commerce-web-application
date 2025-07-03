const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { user_id, email, product_id, quantity } = req.body;
    const item = await Cart.create({ user_id, email, product_id, quantity });
    res.status(201).json({ message: "Added to cart", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// Get cart for user
router.get("/:user_id", async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { user_id: req.params.user_id },
    });
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Update quantity
router.put("/update", async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    const item = await Cart.findOne({ where: { user_id, product_id } });
    if (!item) return res.status(404).json({ error: "Item not found" });

    item.quantity = quantity;
    await item.save();
    res.json({ message: "Quantity updated", item });
  } catch (err) {
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// Remove one item
router.delete("/remove", async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    await Cart.destroy({ where: { user_id, product_id } });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item" });
  }
});

// Clear cart
router.delete("/clear/:user_id", async (req, res) => {
  try {
    await Cart.destroy({ where: { user_id: req.params.user_id } });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

module.exports = router;
