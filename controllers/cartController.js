const User = require("../models/User");

// Get cart items for a user
const getCart = async (req, res) => {
  try {
    const cart_items = await User.find({ user_id: "1" });
    const { cart } = cart_items[0];
    return res.status(200).json({ cart });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Failed to fetch products",
        error: error instanceof Error ? error.message : error,
      });
  }
};

// Update cart (add, remove, update quantity, clear)
const updateCart = async (req, res) => {
  try {
    const { action, product, id, quantity } = req.body;

    const userId = "1"; // You can replace this with a dynamic user ID if needed
    const cart_doc = await User.findOne({ user_id: userId });

    switch (action) {
      case "addToCart": {
        if (!product) {
          return res.status(400).json({ message: "Product is required." });
        }

        if (!cart_doc) {
          // No cart exists → create one
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
          const exists = cart_doc.cart.some(
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
        return res.status(200).json({ message: "Updating done" });
      }

      case "removeFromCart": {
        if (!id) {
          return res.status(400).json({ message: "Product ID is required." });
        }

        if (cart_doc) {
          await User.findOneAndUpdate(
            { user_id: userId },
            { $pull: { cart: { product_id: id } } }
          );
        }
        return res.status(200).json({ message: "Updating done" });
      }

      case "updateQuantity": {
        if (!id || quantity === undefined) {
          return res.status(400).json({ message: "Product ID and quantity are required." });
        }

        if (cart_doc) {
          await User.updateOne(
            { user_id: userId, "cart.product_id": id },
            { $set: { "cart.$.quantity": quantity } }
          );
        }
        return res.status(200).json({ message: "Updating done" });
      }

      case "clearCart": {
        if (cart_doc) {
          await User.findOneAndUpdate({ user_id: userId }, { cart: [] });
        }
        return res.status(200).json({ message: "Updating done" });
      }

      default: {
        return res.status(400).json({ message: "Invalid action" });
      }
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Failed to process request",
        error: error instanceof Error ? error.message : error,
      });
  }
};

module.exports = {
  getCart,
  updateCart,
};
