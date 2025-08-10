const Product = require("../models/Product");
const redisFetch = require("../utils/redisClient"); // REST API helper

const getProducts = async (req, res) => {
  try {
    const { action, id, search, brand, category, price, feature, page, limit } =
      req.query;

    switch (action) {
      case "getProducts": {
        const currentPage = parseInt(page) > 0 ? parseInt(page) : 1;
        const perPage = parseInt(limit) > 0 ? parseInt(limit) : 20;
        const skip = (currentPage - 1) * perPage;

        const filter = {};
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

        const cacheKey = `products:${JSON.stringify({
          search,
          brand,
          category,
          price,
          feature,
          page: currentPage,
          limit: perPage,
        })}`;

        const cached = await redisFetch("get", cacheKey);
        if (cached.result) {
          return res.status(200).json(JSON.parse(cached.result));
        }

        const totalCount = await Product.countDocuments(filter);
        const products = await Product.find(filter)
          .skip(skip)
          .limit(perPage)
          .lean();

        const responseData = {
          products,
          totalCount,
          currentPage,
          totalPages: Math.ceil(totalCount / perPage),
        };

        await redisFetch("set", cacheKey, JSON.stringify(responseData));
        await redisFetch("expire", cacheKey, 3600);
        return res.status(200).json(responseData);
      }

      case "findProduct": {
        if (!id) {
          return res.status(400).json({ message: "Product ID is required." });
        }

        const cacheKey = `product:${id}`;
        const cached = await redisFetch("get", cacheKey);
        if (cached.result) {
          return res.status(200).json(JSON.parse(cached.result));
        }

        const product = await Product.findOne({ product_id: id });
        if (!product) {
          return res.status(404).json({ message: "Product not found." });
        }

        await redisFetch("set", cacheKey, JSON.stringify({ product }));
        await redisFetch("expire", cacheKey, 3600);
        return res.status(200).json({ product });
      }

      case "getPopular": {
        const cacheKey = "popular-products";
        const cached = await redisFetch("get", cacheKey);
        if (cached.result) {
          return res.status(200).json(JSON.parse(cached.result));
        }

        const products = await Product.find({ popular: "yes" }).lean();

        await redisFetch("set", cacheKey, JSON.stringify(products));
        await redisFetch("expire", cacheKey, 3600);
        return res.status(200).json(products);
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

module.exports = { getProducts };
