const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    tipo: {
      type: String,
      enum: ["mensaje", "compra", "estado_orden", "resena", "reporte"],
      required: true,
    },
    titulo: { type: String, required: true },
    mensaje: { type: String, required: true },
    leida: { type: Boolean, default: false },
    enlace: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
