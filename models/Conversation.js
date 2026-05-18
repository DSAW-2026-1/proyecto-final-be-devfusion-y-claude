const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
    comprador: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    vendedor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    ultimoMensaje: { type: String, default: "" },
    ultimaActividad: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
