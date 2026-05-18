const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Producto = require("../models/Producto");

exports.obtenerOCrearConversacion = async (req, res) => {
  try {
    const { productoId } = req.params;
    const producto = await Producto.findById(productoId).populate("vendedor", "_id nombre");
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    if (producto.vendedor._id.toString() === req.usuario._id.toString())
      return res.status(400).json({ error: "No puedes chatear contigo mismo" });
    let conv = await Conversation.findOne({ producto: productoId, comprador: req.usuario._id });
    if (!conv) {
      conv = await Conversation.create({
        producto: productoId,
        comprador: req.usuario._id,
        vendedor: producto.vendedor._id,
      });
    }
    await conv.populate([
      { path: "producto", select: "nombre imagenes precio" },
      { path: "comprador", select: "nombre foto" },
      { path: "vendedor", select: "nombre foto" },
    ]);
    res.json(conv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener conversación" });
  }
};

exports.misConversaciones = async (req, res) => {
  try {
    const convs = await Conversation.find({
      $or: [{ comprador: req.usuario._id }, { vendedor: req.usuario._id }],
    })
      .populate("producto", "nombre imagenes precio")
      .populate("comprador", "nombre foto")
      .populate("vendedor", "nombre foto")
      .sort({ ultimaActividad: -1 });
    res.json(convs);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener conversaciones" });
  }
};

exports.obtenerMensajes = async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.convId);
    if (!conv) return res.status(404).json({ error: "Conversación no encontrada" });
    const esParticipante =
      conv.comprador.toString() === req.usuario._id.toString() ||
      conv.vendedor.toString() === req.usuario._id.toString();
    if (!esParticipante) return res.status(403).json({ error: "No tienes acceso a esta conversación" });
    const mensajes = await Message.find({ conversacion: req.params.convId })
      .populate("emisor", "nombre foto")
      .sort({ createdAt: 1 });
    await Message.updateMany(
      { conversacion: req.params.convId, emisor: { $ne: req.usuario._id }, leido: false },
      { leido: true }
    );
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
};

exports.enviarMensaje = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto?.trim()) return res.status(400).json({ error: "El mensaje no puede estar vacío" });
    const conv = await Conversation.findById(req.params.convId);
    if (!conv) return res.status(404).json({ error: "Conversación no encontrada" });
    const esParticipante =
      conv.comprador.toString() === req.usuario._id.toString() ||
      conv.vendedor.toString() === req.usuario._id.toString();
    if (!esParticipante) return res.status(403).json({ error: "No tienes acceso" });
    const mensaje = await Message.create({
      conversacion: conv._id,
      emisor: req.usuario._id,
      texto: texto.trim(),
    });
    conv.ultimoMensaje = texto.trim();
    conv.ultimaActividad = new Date();
    await conv.save();
    const destinatario = conv.comprador.toString() === req.usuario._id.toString() ? conv.vendedor : conv.comprador;
    await Notification.create({
      usuario: destinatario,
      tipo: "mensaje",
      titulo: "Nuevo mensaje",
      mensaje: `${req.usuario.nombre}: ${texto.substring(0, 50)}${texto.length > 50 ? "..." : ""}`,
      enlace: `/mensajes/${conv._id}`,
    });
    await mensaje.populate("emisor", "nombre foto");
    res.status(201).json(mensaje);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
};
