const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  cart: {
    type: [
      {
        title: { type: String },
        description: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        discount: { type: Number },
        image: { type: String },
        product_id: { type: String },
      },
    ],
    default: [],
  },
});

userSchema.index({ user_id: 1 });

const User = mongoose.model("User", userSchema);
module.exports = User;
