const Producto = require("../models/Producto");
const Notification = require("../models/Notification");

exports.crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, estado } = req.body;
    if (!nombre || !descripcion || !precio || !categoria || !estado)
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    const imagenes = req.files ? req.files.map((f) => f.path) : [];
    if (imagenes.length === 0)
      return res.status(400).json({ error: "Debes subir al menos una imagen" });
    const producto = await Producto.create({
      nombre, descripcion, precio: Number(precio), categoria, estado, imagenes, vendedor: req.usuario._id,
    });
    await producto.populate("vendedor", "nombre foto correo");
    res.status(201).json({ mensaje: "Producto publicado exitosamente", producto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

exports.obtenerProductos = async (req, res) => {
  try {
    const { q, categoria, estado, precioMin, precioMax, pagina = 1, limite = 12, vendedor } = req.query;
    const filtro = { activo: true, vendido: false };
    if (q) filtro.$text = { $search: q };
    if (categoria) filtro.categoria = categoria;
    if (estado) filtro.estado = estado;
    if (precioMin || precioMax) {
      filtro.precio = {};
      if (precioMin) filtro.precio.$gte = Number(precioMin);
      if (precioMax) filtro.precio.$lte = Number(precioMax);
    }
    if (vendedor) filtro.vendedor = vendedor;
    const skip = (Number(pagina) - 1) * Number(limite);
    const [productos, total] = await Promise.all([
      Producto.find(filtro).populate("vendedor", "nombre foto reputacion").sort({ createdAt: -1 }).skip(skip).limit(Number(limite)),
      Producto.countDocuments(filtro),
    ]);
    res.json({ productos, total, pagina: Number(pagina), totalPaginas: Math.ceil(total / Number(limite)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate("vendedor", "nombre foto reputacion totalResenas correo carrera");
    if (!producto || !producto.activo) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

exports.actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    if (producto.vendedor.toString() !== req.usuario._id.toString() && req.usuario.rol !== "admin")
      return res.status(403).json({ error: "No tienes permiso para editar este producto" });
    const { nombre, descripcion, precio, categoria, estado } = req.body;
    if (nombre) producto.nombre = nombre;
    if (descripcion) producto.descripcion = descripcion;
    if (precio) producto.precio = Number(precio);
    if (categoria) producto.categoria = categoria;
    if (estado) producto.estado = estado;
    if (req.files && req.files.length > 0) producto.imagenes = req.files.map((f) => f.path);
    await producto.save();
    res.json({ mensaje: "Producto actualizado", producto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    if (producto.vendedor.toString() !== req.usuario._id.toString() && req.usuario.rol !== "admin")
      return res.status(403).json({ error: "No tienes permiso para eliminar este producto" });
    producto.activo = false;
    await producto.save();
    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

exports.misProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ vendedor: req.usuario._id, activo: true }).sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tus productos" });
  }
};
