const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  rating: { type: Number, default: 0 },
  popular: { type: String, enum: ["yes", "no"], default: "no" },
  cart: { type: String, enum: ["true", "false"], default: "false" },
  discount: { type: Number, default: 0 },
  features: { type: [String], default: [] }, // e.g. ["Waterproof"]
  brand: { type: String }, // e.g. "Sony"
  category: { type: String }, // e.g. "Mobile"
  colours: { type: [String], default: [] }, // e.g. ["Black", "White"]
});

productSchema.index({ popular: 1 });
productSchema.index({ product_id: 1 }); // unique already defined
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ features: 1 });
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
