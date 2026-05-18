const Notification = require("../models/Notification");

exports.misNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notification.find({ usuario: req.usuario._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

exports.marcarLeida = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { leida: true });
    res.json({ mensaje: "Notificación marcada como leída" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar notificación" });
  }
};

exports.marcarTodasLeidas = async (req, res) => {
  try {
    await Notification.updateMany({ usuario: req.usuario._id, leida: false }, { leida: true });
    res.json({ mensaje: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar notificaciones" });
  }
};

exports.contarNoLeidas = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ usuario: req.usuario._id, leida: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Error al contar notificaciones" });
  }
};
