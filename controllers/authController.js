const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const generarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.registrar = async (req, res) => {
  try {
    const { nombre, correo, password, carrera } = req.body;
    if (!nombre || !correo || !password)
      return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios" });
    if (!correo.endsWith("@unisabana.edu.co"))
      return res.status(400).json({ error: "Solo se permiten correos @unisabana.edu.co" });
    if (password.length < 6)
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    const existe = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (existe) return res.status(400).json({ error: "Este correo ya está registrado" });
    const hash = await bcrypt.hash(password, 12);
    const usuario = await Usuario.create({ nombre, correo: correo.toLowerCase(), password: hash, carrera: carrera || "" });
    const token = generarToken(usuario._id);
    res.status(201).json({
      mensaje: "Cuenta creada exitosamente",
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, foto: usuario.foto, carrera: usuario.carrera },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password)
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    if (usuario.bloqueado) return res.status(403).json({ error: "Tu cuenta ha sido suspendida" });
    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) return res.status(401).json({ error: "Contraseña incorrecta" });
    const token = generarToken(usuario._id);
    res.json({
      mensaje: "Bienvenido de vuelta",
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, foto: usuario.foto, carrera: usuario.carrera, reputacion: usuario.reputacion },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

exports.perfil = async (req, res) => {
  try {
    res.json(req.usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, carrera } = req.body;
    const actualizar = {};
    if (nombre) actualizar.nombre = nombre;
    if (carrera !== undefined) actualizar.carrera = carrera;
    if (req.file) actualizar.foto = req.file.path;
    const usuario = await Usuario.findByIdAndUpdate(req.usuario._id, actualizar, { new: true }).select("-password");
    res.json({ mensaje: "Perfil actualizado", usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};

exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-password -bloqueado");
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};
