const router = require("express").Router();
const {
  dashboard, obtenerUsuarios, bloquearUsuario, desbloquearUsuario,
  obtenerProductosAdmin, eliminarProductoAdmin, obtenerReportes, actualizarReporte, crearReporte,
} = require("../controllers/adminController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.get("/dashboard", authMiddleware, adminMiddleware, dashboard);
router.get("/usuarios", authMiddleware, adminMiddleware, obtenerUsuarios);
router.put("/usuarios/:id/bloquear", authMiddleware, adminMiddleware, bloquearUsuario);
router.put("/usuarios/:id/desbloquear", authMiddleware, adminMiddleware, desbloquearUsuario);
router.get("/productos", authMiddleware, adminMiddleware, obtenerProductosAdmin);
router.delete("/productos/:id", authMiddleware, adminMiddleware, eliminarProductoAdmin);
router.get("/reportes", authMiddleware, adminMiddleware, obtenerReportes);
router.put("/reportes/:id", authMiddleware, adminMiddleware, actualizarReporte);
router.post("/reportes", authMiddleware, crearReporte);

module.exports = router;
