const Usuario = require("../models/Usuario");
const Producto = require("../models/Producto");
const Order = require("../models/Order");
const Report = require("../models/Report");
const Notification = require("../models/Notification");

exports.dashboard = async (req, res) => {
  try {
    const [totalUsuarios, totalProductos, totalOrdenes, reportesPendientes] = await Promise.all([
      Usuario.countDocuments(),
      Producto.countDocuments({ activo: true }),
      Order.countDocuments(),
      Report.countDocuments({ estado: "pendiente" }),
    ]);
    res.json({ totalUsuarios, totalProductos, totalOrdenes, reportesPendientes });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener métricas" });
  }
};

exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password").sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

exports.bloquearUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, { bloqueado: true }, { new: true }).select("-password");
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario bloqueado", usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al bloquear usuario" });
  }
};

exports.desbloquearUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, { bloqueado: false }, { new: true }).select("-password");
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario desbloqueado", usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al desbloquear usuario" });
  }
};

exports.obtenerProductosAdmin = async (req, res) => {
  try {
    const productos = await Producto.find().populate("vendedor", "nombre correo").sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

exports.eliminarProductoAdmin = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ mensaje: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

exports.obtenerReportes = async (req, res) => {
  try {
    const reportes = await Report.find()
      .populate("reportadoPor", "nombre correo")
      .populate("producto", "nombre")
      .populate("usuarioReportado", "nombre correo")
      .sort({ createdAt: -1 });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reportes" });
  }
};

exports.actualizarReporte = async (req, res) => {
  try {
    const reporte = await Report.findByIdAndUpdate(req.params.id, { estado: req.body.estado }, { new: true });
    res.json({ mensaje: "Reporte actualizado", reporte });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar reporte" });
  }
};

exports.crearReporte = async (req, res) => {
  try {
    const { tipoObjetivo, productoId, usuarioReportadoId, motivo, descripcion } = req.body;
    const reporte = await Report.create({
      reportadoPor: req.usuario._id,
      tipoObjetivo,
      producto: productoId || undefined,
      usuarioReportado: usuarioReportadoId || undefined,
      motivo,
      descripcion: descripcion || "",
    });
    res.status(201).json({ mensaje: "Reporte enviado", reporte });
  } catch (error) {
    res.status(500).json({ error: "Error al enviar reporte" });
  }
};
