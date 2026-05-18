const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
  nombre: String,
  precio: Number,
  imagen: String,
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
});

const OrderSchema = new mongoose.Schema(
  {
    comprador: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "entregada", "cancelada"],
      default: "pendiente",
    },
    direccionEntrega: { type: String, default: "Entrega en campus universitario" },
    notaComprador: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
