const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    correo: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
      validate: {
        validator: (v) => v.endsWith("@unisabana.edu.co"),
        message: "Solo se permiten correos @unisabana.edu.co",
      },
    },
    password: { type: String, required: true, minlength: 6 },
    rol: { type: String, enum: ["usuario", "admin"], default: "usuario" },
    carrera: { type: String, trim: true, default: "" },
    foto: { type: String, default: "" },
    bloqueado: { type: Boolean, default: false },
    reputacion: { type: Number, default: 0 },
    totalResenas: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Usuario", UsuarioSchema);
