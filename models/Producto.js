const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    categoria: {
      type: String,
      required: true,
      enum: ["Libros", "Electrónica", "Ropa", "Deportes", "Alimentos", "Servicios", "Otros"],
    },
    estado: { type: String, required: true, enum: ["nuevo", "usado"] },
    imagenes: [{ type: String }],
    vendedor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    activo: { type: Boolean, default: true },
    vendido: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductoSchema.index({ nombre: "text", descripcion: "text" });

module.exports = mongoose.model("Producto", ProductoSchema);
