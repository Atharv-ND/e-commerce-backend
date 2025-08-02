const express = require("express");
const router = express.Router();
const { getProducts } = require("../controllers/productController");

// Define routes
router.get("/", getProducts);

module.exports = router;
