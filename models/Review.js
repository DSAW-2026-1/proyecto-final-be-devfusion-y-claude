const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    vendedor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    comprador: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    orden: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    producto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

ReviewSchema.index({ orden: 1, comprador: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
