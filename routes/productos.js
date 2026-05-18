const router = require("express").Router();
const {
  crearProducto, obtenerProductos, obtenerProductoPorId,
  actualizarProducto, eliminarProducto, misProductos,
} = require("../controllers/productoController");
const { authMiddleware, authOpcional } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

router.get("/", authOpcional, obtenerProductos);
router.get("/mis-productos", authMiddleware, misProductos);
router.get("/:id", authOpcional, obtenerProductoPorId);
router.post("/", authMiddleware, upload.array("imagenes", 5), crearProducto);
router.put("/:id", authMiddleware, upload.array("imagenes", 5), actualizarProducto);
router.delete("/:id", authMiddleware, eliminarProducto);

module.exports = router;
