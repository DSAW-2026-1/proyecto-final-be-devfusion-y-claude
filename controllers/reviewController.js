const Review = require("../models/Review");
const Order = require("../models/Order");
const Usuario = require("../models/Usuario");
const Notification = require("../models/Notification");

exports.crearResena = async (req, res) => {
  try {
    const { ordenId, productoId, vendedorId, rating, comentario } = req.body;
    if (!ordenId || !productoId || !vendedorId || !rating)
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ error: "El rating debe ser entre 1 y 5" });
    const orden = await Order.findById(ordenId);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });
    if (orden.comprador.toString() !== req.usuario._id.toString())
      return res.status(403).json({ error: "Solo el comprador puede dejar reseña" });
    if (orden.estado !== "entregada")
      return res.status(400).json({ error: "Solo puedes reseñar órdenes entregadas" });
    const yaReseno = await Review.findOne({ orden: ordenId, comprador: req.usuario._id });
    if (yaReseno) return res.status(400).json({ error: "Ya dejaste una reseña para esta orden" });
    const resena = await Review.create({
      vendedor: vendedorId, comprador: req.usuario._id, orden: ordenId,
      producto: productoId, rating: Number(rating), comentario: comentario || "",
    });
    const resenas = await Review.find({ vendedor: vendedorId });
    const promedio = resenas.reduce((acc, r) => acc + r.rating, 0) / resenas.length;
    await Usuario.findByIdAndUpdate(vendedorId, { reputacion: Math.round(promedio * 10) / 10, totalResenas: resenas.length });
    await Notification.create({
      usuario: vendedorId, tipo: "resena", titulo: "Nueva reseña recibida",
      mensaje: `${req.usuario.nombre} te dejó una reseña de ${rating} estrellas`,
      enlace: `/perfil/${vendedorId}`,
    });
    res.status(201).json({ mensaje: "Reseña publicada", resena });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) return res.status(400).json({ error: "Ya existe una reseña para esta orden" });
    res.status(500).json({ error: "Error al crear reseña" });
  }
};

exports.resenasDeVendedor = async (req, res) => {
  try {
    const resenas = await Review.find({ vendedor: req.params.vendedorId })
      .populate("comprador", "nombre foto")
      .populate("producto", "nombre")
      .sort({ createdAt: -1 });
    res.json(resenas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reseñas" });
  }
};
