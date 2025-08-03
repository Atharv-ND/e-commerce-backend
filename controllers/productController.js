const Product = require("../models/Product");
// Preload products at server startup

// Get all products or find a specific product by ID
const getProducts = async (req, res) => {
  try {
    const { action, id } = req.query;

    switch (action) {
      case "getProducts": {
          const products = await Product.find();
          return res.status(200).json({ products });
      }

      case "findProduct": {
        if (!id) {
          return res.status(400).json({ message: "Product ID is required." });
        }
        product = await Product.findOne({ product_id: id });
        
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
};
