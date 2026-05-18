const router = require("express").Router();
const { crearOrden, misCompras, misVentas, obtenerOrden, actualizarEstadoOrden } = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/auth");

router.post("/", authMiddleware, crearOrden);
router.get("/mis-compras", authMiddleware, misCompras);
router.get("/mis-ventas", authMiddleware, misVentas);
router.get("/:id", authMiddleware, obtenerOrden);
router.put("/:id/estado", authMiddleware, actualizarEstadoOrden);

module.exports = router;
