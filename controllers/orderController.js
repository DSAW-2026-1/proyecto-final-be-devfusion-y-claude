const Order = require("../models/Order");
const Producto = require("../models/Producto");
const Notification = require("../models/Notification");

exports.crearOrden = async (req, res) => {
  try {
    const { items, notaComprador } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ error: "El carrito está vacío" });

    const itemsCompletos = [];
    let total = 0;

    for (const item of items) {
      const producto = await Producto.findById(item.productoId).populate("vendedor", "_id nombre");
      if (!producto || !producto.activo || producto.vendido)
        return res.status(400).json({ error: `El producto "${item.nombre}" ya no está disponible` });
      if (producto.vendedor._id.toString() === req.usuario._id.toString())
        return res.status(400).json({ error: "No puedes comprar tus propios productos" });
      itemsCompletos.push({
        producto: producto._id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagenes[0] || "",
        vendedor: producto.vendedor._id,
      });
      total += producto.precio;
    }

    const orden = await Order.create({
      comprador: req.usuario._id,
      items: itemsCompletos,
      total,
      notaComprador: notaComprador || "",
    });

    // Notificar a vendedores
    const vendedoresNotificados = new Set();
    for (const item of itemsCompletos) {
      const vid = item.vendedor.toString();
      if (!vendedoresNotificados.has(vid)) {
        await Notification.create({
          usuario: item.vendedor,
          tipo: "compra",
          titulo: "Nueva compra recibida",
          mensaje: `${req.usuario.nombre} compró productos de tu tienda`,
          enlace: `/mis-ventas`,
        });
        vendedoresNotificados.add(vid);
      }
    }

    // Notificar al comprador
    await Notification.create({
      usuario: req.usuario._id,
      tipo: "compra",
      titulo: "Compra realizada",
      mensaje: `Tu orden fue creada. Total: $${total.toLocaleString("es-CO")}`,
      enlace: `/mis-compras`,
    });

    await orden.populate("items.producto", "nombre imagenes");
    res.status(201).json({ mensaje: "Orden creada exitosamente", orden });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la orden" });
  }
};

exports.misCompras = async (req, res) => {
  try {
    const ordenes = await Order.find({ comprador: req.usuario._id })
      .populate("items.producto", "nombre imagenes")
      .populate("items.vendedor", "nombre foto")
      .sort({ createdAt: -1 });
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener compras" });
  }
};

exports.misVentas = async (req, res) => {
  try {
    const ordenes = await Order.find({ "items.vendedor": req.usuario._id })
      .populate("comprador", "nombre foto correo")
      .populate("items.producto", "nombre imagenes")
      .sort({ createdAt: -1 });
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener ventas" });
  }
};

exports.obtenerOrden = async (req, res) => {
  try {
    const orden = await Order.findById(req.params.id)
      .populate("comprador", "nombre foto correo")
      .populate("items.producto", "nombre imagenes descripcion")
      .populate("items.vendedor", "nombre foto");
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });
    const esComprador = orden.comprador._id.toString() === req.usuario._id.toString();
    const esVendedor = orden.items.some((i) => i.vendedor?._id?.toString() === req.usuario._id.toString());
    const esAdmin = req.usuario.rol === "admin";
    if (!esComprador && !esVendedor && !esAdmin)
      return res.status(403).json({ error: "No tienes acceso a esta orden" });
    res.json(orden);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener orden" });
  }
};

exports.actualizarEstadoOrden = async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ["pendiente", "confirmada", "entregada", "cancelada"];
    if (!estadosValidos.includes(estado))
      return res.status(400).json({ error: "Estado inválido" });
    const orden = await Order.findById(req.params.id).populate("comprador", "_id nombre");
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });
    const esVendedor = orden.items.some((i) => i.vendedor?.toString() === req.usuario._id.toString());
    if (!esVendedor && req.usuario.rol !== "admin")
      return res.status(403).json({ error: "Solo el vendedor puede actualizar el estado" });
    orden.estado = estado;
    await orden.save();
    await Notification.create({
      usuario: orden.comprador._id,
      tipo: "estado_orden",
      titulo: "Estado de tu orden actualizado",
      mensaje: `Tu orden cambió a: ${estado}`,
      enlace: `/mis-compras`,
    });
    res.json({ mensaje: "Estado actualizado", orden });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar estado" });
  }
};
