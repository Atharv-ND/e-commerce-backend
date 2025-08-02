const express = require("express");
const router = express.Router();
const { getCart, updateCart } = require("../controllers/cartController");

// Define routes
router.get("/", getCart);
router.put("/", updateCart);

module.exports = router;
