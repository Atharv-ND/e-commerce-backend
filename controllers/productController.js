const Product = require("../models/Product");
let cachedProducts = [];
let productsLoaded = false;

// Preload products at server startup
async function preloadProducts() {
  try {
    cachedProducts = await Product.find();
    productsLoaded = true;
    console.log("Products preloaded in cache.");
  } catch (err) {
    console.error("Failed to preload products:", err);
  }
}

// Get all products or find a specific product by ID
const getProducts = async (req, res) => {
  try {
    const { action, id } = req.query;

    switch (action) {
      case "getProducts": {
        // Serve from cache if loaded
        if (productsLoaded) {
          return res.status(200).json({ products: cachedProducts });
        } else {
          const products = await Product.find();
          return res.status(200).json({ products });
        }
      }

      case "findProduct": {
        if (!id) {
          return res.status(400).json({ message: "Product ID is required." });
        }
        // Try to find in cache first
        let product = null;
        if (productsLoaded) {
          product = cachedProducts.find((p) => p.product_id === id);
        }
        if (!product) {
          product = await Product.findOne({ product_id: id });
        }
        if (!product) {
          return res.status(404).json({ message: "Product not found." });
        }
        return res.status(200).json({ product });
      }

      default:
        return res.status(400).json({ message: "Invalid action specified." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch products",
      error: error instanceof Error ? error.message : error,
    });
  }
};

module.exports = {
  getProducts,
  preloadProducts,
};
