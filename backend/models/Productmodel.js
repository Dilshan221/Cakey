import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Weighted text index for nicer relevance
productSchema.index(
  { name: "text", description: "text", category: "text" },
  { weights: { name: 5, category: 3, description: 1 } }
);

export default mongoose.model("Product", productSchema);
