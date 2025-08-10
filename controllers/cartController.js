const User = require("../models/User");
const redis = require("../utils/redisClient"); // your Redis client instance

// Get cart items for a user
const getCart = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cacheKey = `cart-${userId}`;
    const cachedCart = await redis.get(cacheKey);
    if (cachedCart) {
      return res.status(200).json({ cart: JSON.parse(cachedCart) });
    }

    const cartDoc = await User.findOne({ user_id: userId })
      .select("cart")
      .lean();

    const cart = cartDoc ? cartDoc.cart : [];

    // Cache cart in Redis for 5 minutes (300 seconds)
    await redis.set(cacheKey, JSON.stringify(cart), { EX: 300 });

    return res.status(200).json({ cart });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch cart",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Update cart (add, remove, update quantity, clear)
const updateCart = async (req, res) => {
  try {
    const { action, product, id, quantity } = req.body;
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cacheKey = `cart-${userId}`;

    const cartDoc = await User.findOne({ user_id: userId });

    switch (action) {
      case "addToCart": {
        if (!product) {
          return res.status(400).json({ message: "Product is required." });
        }

        if (!cartDoc) {
          await User.create({
            user_id: userId,
            cart: [
              {
                title: product.title,
                description: product.description,
                price: product.price,
                image: product.image,
                quantity: 1,
                discount: product.discount,
                product_id: product.product_id,
              },
            ],
          });
        } else {
          const exists = cartDoc.cart.some(
            (item) => item.product_id === product.product_id
          );

          if (!exists) {
            const newItem = {
              title: product.title,
              description: product.description,
              price: product.price,
              image: product.image,
              quantity: 1,
              discount: product.discount,
              product_id: product.product_id,
            };
            await User.findOneAndUpdate(
              { user_id: userId },
              { $push: { cart: newItem } },
              { new: true }
            );
          }
        }
        break;
      }

      case "removeFromCart": {
        if (!id) {
          return res.status(400).json({ message: "Product ID is required." });
        }

        if (cartDoc) {
          await User.findOneAndUpdate(
            { user_id: userId },
            { $pull: { cart: { product_id: id } } }
          );
        }
        break;
      }

      case "updateQuantity": {
        if (!id || quantity === undefined) {
          return res
            .status(400)
            .json({ message: "Product ID and quantity are required." });
        }

        if (cartDoc) {
          await User.updateOne(
            { user_id: userId, "cart.product_id": id },
            { $set: { "cart.$.quantity": quantity } }
          );
        }
        break;
      }

      case "clearCart": {
        if (cartDoc) {
          await User.findOneAndUpdate({ user_id: userId }, { cart: [] });
        }
        break;
      }

      default: {
        return res.status(400).json({ message: "Invalid action" });
      }
    }

    // Invalidate Redis cache on cart update
    await redis.del(cacheKey);

    return res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to process cart update",
      error: error instanceof Error ? error.message : error,
    });
  }
};

module.exports = {
  getCart,
  updateCart,
};
