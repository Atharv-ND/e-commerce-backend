const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const { action, id, search, brand, category, price, feature, page, limit } =
      req.query;

    switch (action) {
      case "getProducts": {
        // ✅ Pagination defaults
        const currentPage = parseInt(page) > 0 ? parseInt(page) : 1;
        const perPage = parseInt(limit) > 0 ? parseInt(limit) : 20;
        const skip = (currentPage - 1) * perPage;

        // ✅ Build MongoDB filter object
        const filter = {};

        // If search matches brand, category, or feature directly
        if (search) {
          filter.$or = [
            { brand: search },
            { category: search },
            { features: search },
          ];
        }

        if (brand) filter.brand = brand;
        if (category) filter.category = category;

        if (price) {
          if (price === "Under 25000") filter.price = { $lt: 25000 };
          else if (price === "25000-50000")
            filter.price = { $gte: 25000, $lt: 50000 };
          else if (price === "Above 50000") filter.price = { $gte: 50000 };
        }

        if (feature) filter.features = feature;

        // ✅ Count before pagination
        const totalCount = await Product.countDocuments(filter);

        // ✅ Fetch paginated products
        const products = await Product.find(filter)
          .skip(skip)
          .limit(perPage)
          .lean();

        return res.status(200).json({
          products,
          totalCount,
          currentPage,
          totalPages: Math.ceil(totalCount / perPage),
        });
      }

      case "findProduct": {
        if (!id) {
          return res.status(400).json({ message: "Product ID is required." });
        }
        const product = await Product.findOne({ product_id: id });

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
