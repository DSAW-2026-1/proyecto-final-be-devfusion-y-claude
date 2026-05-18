const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversacion: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    emisor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    texto: { type: String, required: true, trim: true },
    leido: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
