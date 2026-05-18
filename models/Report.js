const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    reportadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    tipoObjetivo: { type: String, enum: ["producto", "usuario"], required: true },
    producto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto" },
    usuarioReportado: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    motivo: {
      type: String,
      enum: ["spam", "fraude", "contenido_inapropiado", "precio_abusivo", "otro"],
      required: true,
    },
    descripcion: { type: String, trim: true, default: "" },
    estado: { type: String, enum: ["pendiente", "revisado", "resuelto"], default: "pendiente" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
