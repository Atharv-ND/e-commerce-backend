const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { ClerkExpressWithAuth } = require("@clerk/clerk-express");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use(ClerkExpressWithAuth());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection failed:", err));
